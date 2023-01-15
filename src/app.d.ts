declare interface Window {
  serverAPI: {
    create(): Promise<IServerInfo>
    get(id: string): Promise<IServerInfo>
    getAll(): Promise<IServerInfo[]>
    update(
      id: string,
      name: string,
      version: string,
      minMemory: number,
      softMaxMemory: number,
      maxMemory: number
    ): void
    delete(id: string): void
    getVersions(): Promise<IVersions>
    getLogs(id: string): Promise<IServerLog[]>
    execute(id: string, command: string): void
    getStatus(id: string): Promise<IServerStatus>
    onStatusChange(
      id: string,
      callback: (status: IServerStatus) => void
    ): () => void
    start(id: string): void
    stop(id: string): void
    onLog(id: string, callback: (log: IServerLog) => void): () => void
    getProperties(id: string): Promise<IServerProperty[] | undefined>
    setProperties(id: string, properties: IServerProperty[]): void
  }

  darkModeAPI: {
    useDefault(): Promise<boolean>
    toggle(): Promise<boolean>
    isDarkMode(): Promise<boolean>
    changed(callback: (darkMode: boolean) => void): () => void
  }
}

declare type PropertiesData = IServerProperty | null | string

declare interface IServerProperty {
  key: string
  value: string
}

declare interface IServerStatus {
  state: ServerState
}

declare interface IServerInfo {
  id: string
  name: string
  version: string
  minMemory: number
  softMaxMemory: number
  maxMemory: number
}

declare interface IVersion {
  id: string
  type: 'release' | 'snapshot'
  url: string
  time: string
  releaseTime: string
  sha1: string
  complianceLevel: 0 | 1
}

declare interface IVersions {
  latest: { release: string; snapshot: string }
  versions: IVersion[]
}

declare type ServerLogTypes = 'ERROR' | 'WARN' | 'INFO'

declare interface IServerLog {
  type: ServerLogTypes
  message: string
}

declare type ServerState =
  | 'STOPPED'
  | 'STARTING'
  | 'RUNNING'
  | 'STOPPING'
  | 'CRASHED'
