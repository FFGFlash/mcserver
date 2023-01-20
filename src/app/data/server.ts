import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect
} from 'react-router-dom'

export async function serverAction({ request, params }: ActionFunctionArgs) {
  const id = params.serverID as string
  if (request.method.toLowerCase() === 'delete') {
    window.serverAPI.delete(id)
    return redirect('/app')
  } else if (request.method.toLowerCase() === 'post') {
    const data = await request.formData()
    const state = data.get('state') as ServerState
    switch (state) {
      case 'RUNNING':
        window.serverAPI.stop(id)
        break
      case 'STOPPED':
      case 'CRASHED':
        window.serverAPI.start(id)
        break
      default:
        break
    }
    return redirect(window.location.hash.replace('#', ''))
  }
}

export async function serverLoader({ params }: LoaderFunctionArgs) {
  const id = params.serverID as string
  const server = await window.serverAPI.get(id)
  const status = await window.serverAPI.getStatus(id)
  return { server, status }
}
