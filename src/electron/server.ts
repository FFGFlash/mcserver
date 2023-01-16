import path from 'path'
import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import Download, { Request } from './util'
import { spawn, ChildProcess } from 'child_process'
import { EOL } from 'os'
import { confirm, send } from '.'
import crypto from 'crypto'

export default class Server {
  id: string
  name: string
  version: string
  minMemory: number
  softMaxMemory: number
  maxMemory: number
  #state: ServerState = 'STOPPED'
  #logs: IServerLog[] = []
  #propertyFileData: PropertiesData[] = []
  private process?: ChildProcess
  static Cache: { [key: string]: Server } = {}
  static VersionCache: IVersions
  static DonePattern =
    /\[\d+:\d+:\d+\] \[(ServerMain|Server thread)\/INFO\]: Done \([^)]+\)!/i
  static StopPattern =
    /\[\d+:\d+:\d+\] \[(ServerMain|Server thread)\/INFO\]: Stopping server/i
  static EulaPattern =
    /\[\d+:\d+:\d+\] \[(ServerMain|Server thread)\/INFO\]: You need to agree to the EULA in order to run the server\. Go to eula.txt for more info\.(?:\n|\r\n)?/i
  static WarnPattern = /\/WARN\]/i
  static ErrorPattern = /\/ERROR\]/i
  static PropertyPattern = /^\s*(?!#)(.+)=(.*)$/i
  static CommentPattern = /^#.+$/i

  constructor(
    id: string,
    name: string,
    version: string,
    minMemory: number,
    softMaxMemory: number,
    maxMemory: number
  ) {
    this.id = id
    this.name = name
    this.version = version
    this.minMemory = minMemory
    this.softMaxMemory = softMaxMemory
    this.maxMemory = maxMemory
    Server.Cache[this.id] = this
  }

  async getProperties() {
    if (this.#propertyFileData.length !== 0) return this.properties
    const { prop } = this
    if (!existsSync(prop)) return
    const content = await readFile(prop, 'utf-8')
    this.#propertyFileData = content
      .replace(/\r?\n/gm, '\n')
      .split('\n')
      .map<PropertiesData>(line => {
        const match = line.match(Server.PropertyPattern)
        return Server.CommentPattern.test(line)
          ? line
          : match
          ? { key: match[1], value: match[2] }
          : null
      })
    return this.properties
  }

  async setProperties(properties: IServerProperty[]) {
    const { prop } = this
    const newPropertyFileData = this.#propertyFileData.map(line =>
      !line || typeof line === 'string'
        ? line
        : properties.find(prop => prop.key === line.key) || line
    )
    if (newPropertyFileData)
      await writeFile(
        prop,
        newPropertyFileData
          .map<string>(line =>
            line
              ? typeof line === 'string'
                ? line
                : `${line.key}=${line.value}`
              : ''
          )
          .join(EOL),
        'utf-8'
      )
    this.#propertyFileData = newPropertyFileData
    return this.properties
  }

  async start() {
    const { cwd, jar, eula } = this
    try {
      if (!this.canStart) throw new ServerStateError(this.state)
      this.state = 'STARTING'
      this.log('Attempting to start server...')
      const versions = await Server.getVersions()
      if (!this.version) this.version = versions.latest.release
      const versionInfo = versions.versions.find(v => v.id === this.version)

      if (!versionInfo) {
        this.state = 'CRASHED'
        throw new Error('Unable to find version info')
      }

      if (!existsSync(cwd)) {
        this.warn('Creating server directory...')
        await mkdir(cwd, { recursive: true })
      }

      if (!existsSync(jar)) {
        this.warn('Downloading server jar...')
        const version = await Request(versionInfo.url)
        if ('status' in version) {
          this.state = 'CRASHED'
          throw new Error('Failed to get version from version info')
        }
        try {
          await Download(version.downloads.server.url, jar)
        } catch (err) {
          this.state = 'CRASHED'
          throw err
        }
      }

      this.log('Starting child process...')
      const process = spawn(
        'java',
        [
          `-Xms${this.minMemory}M`,
          `-XX:SoftMaxHeapSize=${this.softMaxMemory}M`,
          `-Xmx${this.maxMemory}M`,
          '-jar',
          'server.jar',
          '--nogui'
        ],
        { cwd, windowsHide: true }
      )

      process.on('error', err => {
        this.error(`Failed to start server. ${err.message}`)
        this.state = 'CRASHED'
      })

      process.stdout.on('data', (data: Buffer) => {
        const messages = data
          .toString()
          .replace(
            /(\[\d+:\d+:\d+\] \[(?:ServerMain|Server thread)\/)/g,
            '\n$&'
          )
          .split('\n')
          .filter(m => !!m)
        messages.forEach(message => {
          Server.WarnPattern.test(message)
            ? this.warn(message, false)
            : Server.ErrorPattern.test(message)
            ? this.error(message, false)
            : this.log(message, false)
          if (Server.DonePattern.test(message)) {
            this.log('Server is running...')
            this.state = 'RUNNING'
          } else if (Server.StopPattern.test(message)) {
            this.log('Server is stopping...')
            this.state = 'STOPPING'
          } else if (Server.EulaPattern.test(message)) {
            this.warn(
              'Server was unable to start, the user must accept the EULA...'
            )
            confirm(
              'End User License Agreement',
              'Do you accept the EULA?'
            ).then(async agreed => {
              if (!agreed) return
              await readFile(eula, 'utf-8').then(content =>
                writeFile(
                  eula,
                  content.replace('eula=false', 'eula=true'),
                  'utf-8'
                )
              )
              this.start()
            })
            this.state = 'STOPPING'
          }
        })
      })

      process.on('exit', (code, signal) => {
        this.state = code === 0 ? 'STOPPED' : 'CRASHED'
        if (code === null) this.error(`Server exited with signal: ${signal}`)
        else if (code !== 0) this.error(`Server exited with code: ${code}`)
        else this.log('Server stopped')
        this.process = undefined
      })

      this.process = process
    } catch (err: any) {
      this.error(err.message)
      throw err
    }
  }

  async execute(command: string) {
    try {
      if (!this.canStop) throw new ServerStateError(this.state)
      this.log(command)
      this.process?.stdin?.write(command)
      this.process?.stdin?.write(EOL)
    } catch (err: any) {
      this.error(err.message)
      throw err
    }
  }

  async quit() {
    if (this.canStart) return
    while (!this.canStop) continue
    this.process?.stdin?.write('stop')
    this.process?.stdin?.write(EOL)
  }

  static async quit() {
    return Promise.all(Object.values(this.Cache).map(server => server.quit()))
  }

  async stop() {
    try {
      if (!this.canStop) throw new ServerStateError(this.state)
      this.log('Attempting to stop server...')
      this.process?.stdin?.write('stop')
      this.process?.stdin?.write(EOL)
    } catch (err: any) {
      this.error(err.message)
      throw err
    }
  }

  error(message: string, msm = true) {
    if (msm)
      message = `[${new Date().toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}] [MSM] ${message}`
    const log: IServerLog = {
      type: 'ERROR',
      message
    }
    send('server-log', this.id, log)
    return this.#logs.push(log)
  }

  warn(message: string, msm = true) {
    if (msm)
      message = `[${new Date().toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}] [MSM] ${message}`
    const log: IServerLog = {
      type: 'WARN',
      message
    }
    send('server-log', this.id, log)
    return this.#logs.push(log)
  }

  log(message: string, msm = true) {
    if (msm)
      message = `[${new Date().toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}] [MSM] ${message}`
    const log: IServerLog = {
      type: 'INFO',
      message
    }
    send('server-log', this.id, log)
    return this.#logs.push(log)
  }

  static async load() {
    const { file } = this
    if (!existsSync(file)) return []
    return await readFile(file, 'utf-8').then(data =>
      (JSON.parse(data) as IServerInfo[]).map(
        ({ id, name, version, minMemory, softMaxMemory, maxMemory }) =>
          new Server(id, name, version, minMemory, softMaxMemory, maxMemory)
      )
    )
  }

  static async save() {
    const { file } = this
    if (!existsSync('./servers')) await mkdir('./servers', { recursive: true })
    return await writeFile(
      file,
      JSON.stringify(
        Object.values(Server.Cache).reduce(
          (data, server) => [...data, server.info],
          [] as IServerInfo[]
        ),
        undefined,
        process.env.NODE_ENV === 'development' ? 2 : undefined
      ),
      'utf-8'
    )
  }

  static async get(): Promise<Server[]>
  static async get(id: string): Promise<Server>
  static async get(id?: string) {
    return id ? this.Cache[id] : Object.values(this.Cache)
  }

  static async create() {
    const server = new this(
      crypto.randomUUID(),
      'New Server',
      await Server.getVersions().then(v => v.latest.release),
      512,
      1024,
      2048
    )
    await this.save()
    return server
  }

  static async delete(id: string) {
    if (!this.Cache[id]) return false
    const server = this.Cache[id]
    await server.quit()
    delete this.Cache[id]
    return true
  }

  static async update(
    id: string,
    name: string,
    version: string,
    minMemory: number,
    softMaxMemory: number,
    maxMemory: number
  ) {
    if (!this.Cache[id]) return false
    const server = this.Cache[id]
    server.name = name
    server.version = version
    server.minMemory = minMemory
    server.softMaxMemory = softMaxMemory
    server.maxMemory = maxMemory
    return true
  }

  static async getVersions() {
    if (!this.VersionCache)
      this.VersionCache = await Request(
        'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
      )
    return this.VersionCache
  }

  get info(): IServerInfo {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      minMemory: this.minMemory,
      softMaxMemory: this.softMaxMemory,
      maxMemory: this.maxMemory
    }
  }

  get properties() {
    return this.#propertyFileData.filter<IServerProperty>(
      (line): line is IServerProperty =>
        line && typeof line !== 'string' ? true : false
    )
  }

  get status(): IServerStatus {
    return {
      state: this.state
    }
  }

  get logs() {
    return this.#logs
  }

  get state() {
    return this.#state
  }

  set state(state: ServerState) {
    this.#state = state
    send('server-status-changed', this.id, this.status)
  }

  get canStart() {
    return ['STOPPED', 'CRASHED'].includes(this.state)
  }

  get canStop() {
    return this.state === 'RUNNING'
  }

  get cwd() {
    return path.join('./servers', this.id)
  }

  get jar() {
    return path.join('./servers', this.id, 'server.jar')
  }

  get eula() {
    return path.join('./servers', this.id, 'eula.txt')
  }

  get prop() {
    return path.join('./servers', this.id, 'server.properties')
  }

  static get file() {
    return path.join('./servers/server.json')
  }
}

export class ServerStateError extends Error {
  constructor(state: ServerState) {
    super(
      `Illegal Action: The server is currently ${state.toLocaleLowerCase()}.`
    )
  }
}
