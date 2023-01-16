import { useSubmit, Outlet, useLoaderData, useNavigate } from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import Power from '../images/power.svg'
import Edit from '../images/edit.svg'
import Delete from '../images/delete.svg'
import Console from '../images/console.svg'
import { Suspense, useEffect, useState } from 'react'
import LoadingState from '../components/loadingState'

export default function Server() {
  const submit = useSubmit()
  const { server, status: initialStatus } = useLoaderData() as {
    server: IServerInfo
    status: IServerStatus
  }
  const navigate = useNavigate()

  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    setStatus(initialStatus)
    return window.serverAPI.onStatusChange(server.id, setStatus)
  }, [server])

  const deleteServer = () => submit(null, { method: 'delete' })
  const startServer = () => submit({ state: status.state }, { method: 'post' })
  const editServer = () => navigate('edit')
  const openConsole = () => navigate('console')

  const w = window as never as { server: typeof server }
  w.server = server

  return (
    <ServerWrapper>
      <ServerHeader>
        <ServerInfo>
          <h1>
            {server.name} - {server.version} |{' '}
            <small>
              {server.minMemory}Mb - {server.softMaxMemory}Mb -{' '}
              {server.maxMemory}
              Mb
            </small>
          </h1>
          <p>{server.id}</p>
        </ServerInfo>
        <ServerButtons>
          <button type="button" onClick={startServer}>
            <PowerIcon state={status.state} />
          </button>
          <button type="button" onClick={openConsole}>
            <ConsoleIcon />
          </button>
          <button type="button" onClick={editServer}>
            <EditIcon />
          </button>
          <button type="button" onClick={deleteServer}>
            <DeleteIcon />
          </button>
        </ServerButtons>
      </ServerHeader>
      <ServerComponent>
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </ServerComponent>
    </ServerWrapper>
  )
}

type PowerIconProps = { state?: ServerState }
const PowerIcon = styled(Power)<PowerIconProps>`
  ${tw`w-6 h-6`}
  ${({ state }: PowerIconProps) =>
    state === 'RUNNING'
      ? tw`fill-green-400 dark:fill-green-500`
      : state === 'STARTING'
      ? tw`fill-yellow-400 dark:fill-yellow-500`
      : state === 'STOPPING'
      ? tw`fill-orange-400 dark:fill-orange-600`
      : tw`fill-red-400 dark:fill-red-500`}
`
const ConsoleIcon = tw(Console)`w-6 h-6 fill-neutral-900 dark:fill-neutral-100`
const EditIcon = tw(Edit)`w-6 h-6 fill-neutral-900 dark:fill-neutral-100`
const DeleteIcon = tw(Delete)`w-6 h-6 fill-neutral-900 dark:fill-neutral-100`

const ServerWrapper = tw.div`flex flex-col gap-5 p-5 max-w-5xl mx-auto h-full`
const ServerHeader = tw.div`flex p-5 bg-neutral-100 dark:bg-neutral-900 rounded-xl justify-between items-center`
const ServerInfo = tw.div`flex flex-col`
const ServerButtons = tw.div`flex gap-2`
const ServerComponent = tw.div`flex flex-col gap-2 flex-1`
