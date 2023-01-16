import { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom'

export async function propertiesLoader({ params }: LoaderFunctionArgs) {
  const id = params.serverID as string
  const properties = await window.serverAPI.getProperties(id)
  return { properties }
}

export async function propertiesAction({
  request,
  params
}: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = params.serverID as string
  const props = [...formData.entries()].map(prop => ({
    key: prop[0],
    value: prop[1].toString()
  }))
  window.serverAPI.setProperties(id, props)
  return null
}
