import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom'

export async function consoleLoader({ params }: LoaderFunctionArgs) {
  const id = params.serverID as string
  const logs = await window.serverAPI.getLogs(id)
  return { id, logs }
}

export async function consoleAction({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = params.serverID as string
  const command = formData.get('command') as string
  window.serverAPI.execute(id, command)
  return null
}
