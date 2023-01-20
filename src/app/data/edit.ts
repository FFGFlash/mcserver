import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect
} from 'react-router-dom'

export async function editLoader({ params }: LoaderFunctionArgs) {
  const id = params.serverID as string

  const server = await window.serverAPI.get(id)
  const versions = await window.serverAPI.getVersions()

  return { server, versions }
}

export async function editAction({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = params.serverID as string
  window.serverAPI.update(
    id,
    formData.get('name') as string,
    formData.get('version') as string,
    parseInt(formData.get('minMemory') as string),
    parseInt(formData.get('softMaxMemory') as string),
    parseInt(formData.get('maxMemory') as string)
  )
  return redirect(`/app/server/${id}`)
}
