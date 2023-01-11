import { ChangeEvent, PropsWithChildren, useContext, useState } from 'react'
import {
  ActionFunctionArgs,
  Form,
  redirect,
  useLoaderData
} from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import AppContext from '../app.context'
import { IServer, updateServer } from '../data/servers'

export default function Edit() {
  const { versions } = useContext(AppContext)
  const { server } = useLoaderData() as { server: IServer }
  const [includeSnapshots, setIncludeSnapshots] = useState(false)

  const handleCheck = (e: ChangeEvent<HTMLInputElement>) =>
    setIncludeSnapshots(e.target.checked)

  return (
    <EditWrapper>
      <EditContainer method="post">
        <input type="hidden" name="id" value={server.id} />
        <Input
          type="text"
          label="Server Name"
          name="name"
          value={server.name}
        />
        <Input
          type="checkbox"
          label="Include Snapshots"
          name="snapshots"
          checked={includeSnapshots}
          onChange={handleCheck}
        />
        <Select label="Version" name="version" value={server.version}>
          {versions.versions
            .filter(version => version.type === 'release' || includeSnapshots)
            .map(version => (
              <option key={version.id} value={version.id}>
                {version.id}
              </option>
            ))}
        </Select>
        <StyledButton type="submit">Save</StyledButton>
      </EditContainer>
    </EditWrapper>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const version = formData.get('version') as string
  await updateServer({ id, name, version })
  return redirect(`/server/${id}`)
}

type InputProps = (
  | { type: 'text'; placeholder?: string }
  | { type: 'checkbox'; checked?: boolean }
) & {
  label?: string
  name: string
  value?: any
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

function Input(props: InputProps) {
  const { label, name, value, onChange } = props
  switch (props.type) {
    case 'text':
      return (
        <InputWrapper type={props.type}>
          {label && <InputLabel htmlFor={name}>{label}</InputLabel>}
          <StyledInput
            name={name}
            type={props.type}
            placeholder={props.placeholder}
            defaultValue={value}
            onChange={onChange}
          />
        </InputWrapper>
      )
    case 'checkbox':
      return (
        <InputWrapper type={props.type}>
          <StyledInput
            type={props.type}
            name={name}
            defaultChecked={props.checked}
            onChange={onChange}
          />
          {label && <InputLabel htmlFor={name}>{label}</InputLabel>}
        </InputWrapper>
      )
    default:
      throw new Error(`Invalid type ${(props as { type: string }).type}`)
  }
}

type SelectProps = {
  value: any
  name: string
  label?: string
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
} & PropsWithChildren

function Select(props: SelectProps) {
  const { children, value, name, label, onChange } = props
  return (
    <InputWrapper type="select">
      {label && <InputLabel htmlFor={name}>{label}</InputLabel>}
      <SelectWrapper defaultValue={value} name={name} onChange={onChange}>
        {children}
      </SelectWrapper>
    </InputWrapper>
  )
}

const EditWrapper = tw.div`flex justify-center items-center h-full`
const EditContainer = tw(
  Form
)`flex flex-col bg-neutral-100 dark:bg-neutral-900 rounded-xl px-5 py-2 gap-4 w-2/3 max-w-xl`

const InputWrapper = styled.div<{ type: string }>`
  ${tw`flex flex-col gap-2`}
  ${({ type }: { type: string }) =>
    type === 'checkbox' && tw`flex-row items-center`}
`
const InputLabel = tw.label`block text-sm font-medium text-neutral-800 dark:text-neutral-200`
const StyledInput = styled.input`
  ${tw`bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 focus:ring-2 block w-full p-2.5`}
  ${({ type }: { type: string }) =>
    type === 'checkbox' &&
    tw`cursor-pointer w-4 h-4 text-sky-400 rounded dark:ring-offset-neutral-400 p-0`}
`

const SelectWrapper = tw.select`cursor-pointer bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 block w-full p-2.5`

const StyledButton = tw.button`bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 block w-full p-2.5 hover:bg-neutral-100 hover:dark:bg-neutral-900 transition-colors duration-100`
