import { ChangeEventHandler, useEffect, useState } from 'react'
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  useLoaderData
} from 'react-router-dom'
import tw, { styled } from 'twin.macro'

export default function Console() {
  const { id, logs: initialLogs } = useLoaderData() as {
    id: string
    logs: IServerLog[]
  }

  //* Keep track of the current logs
  const [logs, setLogs] = useState(initialLogs)
  useEffect(() => {
    setLogs(initialLogs)
    return window.serverAPI.onLog(id, log => setLogs(logs => [...logs, log]))
  }, [id])

  //* keep track of the input field
  const [command, setCommand] = useState('')
  const onSubmit = () => setCommand('')
  const onChange: ChangeEventHandler<HTMLInputElement> = e =>
    setCommand(e.target.value)

  return (
    <ConsoleWrapper method="post" onSubmit={onSubmit}>
      <ConsoleOutput>
        {logs
          .slice()
          .reverse()
          .map((log, i) => (
            <ConsoleLog key={`${id}:${i}`} type={log.type}>
              {log.message}
            </ConsoleLog>
          ))}
      </ConsoleOutput>
      <StyledInput
        type="text"
        name="command"
        onChange={onChange}
        value={command}
        placeholder="Enter a server command..."
      />
    </ConsoleWrapper>
  )
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.serverID as string
  const logs = await window.serverAPI.getLogs(id)
  return { id, logs }
}

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = params.serverID as string
  const command = formData.get('command') as string
  window.serverAPI.execute(id, command)
  return null
}

const ConsoleWrapper = tw(
  Form
)`w-full bg-neutral-100 dark:bg-neutral-900 p-5 rounded-xl flex flex-col gap-2 h-[75vh]`

type ConsoleLogProps = { type: ServerLogTypes }
const ConsoleLog = styled.span<ConsoleLogProps>`
  ${tw`text-sm`}
  ${({ type }: ConsoleLogProps) =>
    type === 'ERROR'
      ? tw`text-red-400 dark:text-red-500`
      : type === 'WARN'
      ? tw`text-yellow-400 dark:text-yellow-500`
      : tw`text-neutral-900 dark:text-neutral-100`}
`
const StyledInput = tw.input`w-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 focus:ring-2 block p-2.5`
const ConsoleOutput = styled.div`
  ${tw`overflow-y-auto overflow-x-hidden h-full max-h-full flex-1 flex flex-col-reverse gap-2`}
  &::-webkit-scrollbar {
    display: none;
  }
`
