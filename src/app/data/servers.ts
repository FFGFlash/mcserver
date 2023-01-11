import { writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'

export interface IServer {
  id: string
  name: string
  version: string
  properties?: object
}

export async function createServer(versions: string) {
  const server: IServer = {
    id: crypto.randomUUID(),
    name: 'New Server',
    version: versions
  }

  const servers = await getServers()
  servers.push(server)
  await writeFile('./servers.json', JSON.stringify(servers, null, 2))

  return server
}

export async function updateServer(server: Partial<IServer> & { id: string }) {
  const servers = await getServers()

  await writeFile(
    './servers.json',
    JSON.stringify(
      servers.map(s => (s.id === server.id ? { ...s, ...server } : s)),
      null,
      2
    )
  )

  return server
}

export async function getServers() {
  const text =
    existsSync('./servers.json') && (await readFile('./servers.json', 'utf-8'))
  return (text ? JSON.parse(text) : []) as IServer[]
}

export async function getServer(id: string) {
  const servers = await getServers()
  return servers.find(s => s.id === id)
}

export async function deleteServer(id: string) {
  const servers = (await getServers()).filter(s => s.id !== id)
  await writeFile('./servers.json', JSON.stringify(servers, null, 2))
  return servers
}
