import { ActionFunctionArgs, redirect } from 'react-router-dom'
import { deleteServer } from '../data/servers'

export default async function deleteAction({ params }: ActionFunctionArgs) {
  await deleteServer(params.serverID as string)
  return redirect('/')
}
