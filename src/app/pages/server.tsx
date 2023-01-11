import {
  LoaderFunctionArgs,
  useLoaderData,
  redirect,
  ActionFunctionArgs,
  useSubmit
} from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { getServer, IServer } from '../data/servers'
import Power from '../images/power.svg'
import Edit from '../images/edit.svg'
import Delete from '../images/delete.svg'
import { useState } from 'react'

export default function Server() {
  const submit = useSubmit()
  const { server } = useLoaderData() as { server: IServer }
  const [running, setRunning] = useState(false)

  const deleteServer = () =>
    submit(null, { method: 'post', action: `/server/${server.id}/delete` })
  const editServer = () =>
    submit(null, { method: 'get', action: `/server/${server.id}/edit` })
  const toggleServer = () => setRunning(cur => !cur)

  return (
    <ServerWrapper>
      <ServerHeader>
        <ServerInfo>
          <h1>
            {server.name} - {server.version}
          </h1>
          <p>{server.id}</p>
        </ServerInfo>
        <ServerButtons>
          <button type="button" onClick={toggleServer}>
            <PowerIcon running={running} />
          </button>
          <button type="button" onClick={editServer}>
            <EditIcon />
          </button>
          <button type="button" onClick={deleteServer}>
            <DeleteIcon />
          </button>
        </ServerButtons>
      </ServerHeader>
      <ServerProperties>
        {(server.properties &&
          Object.entries(server.properties).map(([key, value]) => (
            <span key={key}>
              {key} {value}
            </span>
          ))) || <span>No Properties</span>}
      </ServerProperties>
    </ServerWrapper>
  )
}

export async function action({ params }: ActionFunctionArgs) {
  return redirect(`/server/${params.serverID}/edit`)
}

export async function loader({ params: { serverID } }: LoaderFunctionArgs) {
  if (!serverID) return redirect('/')
  const server = await getServer(serverID)
  return { server }
}

type PowerIconProps = { running: boolean }
const PowerIcon = styled(Power)<PowerIconProps>`
  ${tw`w-6 h-6 fill-red-400 dark:fill-red-500`}
  ${({ running }: PowerIconProps) =>
    running && tw`fill-green-400 dark:fill-green-500`}
`
const EditIcon = tw(Edit)`w-6 h-6 fill-neutral-900 dark:fill-neutral-100`
const DeleteIcon = tw(Delete)`w-6 h-6 fill-neutral-900 dark:fill-neutral-100`

const ServerWrapper = tw.div`flex flex-col p-5`
const ServerHeader = tw.div`flex p-5 bg-neutral-100 dark:bg-neutral-900 rounded-3xl justify-between items-center`
const ServerInfo = tw.div`flex flex-col`
const ServerButtons = tw.div`flex gap-2`
const ServerProperties = tw.div`flex flex-col gap-2`
