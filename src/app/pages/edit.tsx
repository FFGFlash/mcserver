import { ChangeEvent, PropsWithChildren, useState } from 'react'
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
  useLoaderData
} from 'react-router-dom'
import tw, { styled } from 'twin.macro'
import { totalmem } from 'os'

export default function Edit() {
  const { server, versions } = useLoaderData() as {
    server: IServerInfo
    versions: IVersions
  }
  const [includeSnapshots, setIncludeSnapshots] = useState(false)
  const [minMemory, setMinMemory] = useState(server.minMemory)
  const [softMaxMemory, setSoftMaxMemory] = useState(server.softMaxMemory)
  const [maxMemory, setMaxMemory] = useState(server.maxMemory)

  const handleCheck = (e: ChangeEvent<HTMLInputElement>) =>
    setIncludeSnapshots(e.target.checked)
  const handleMinMemory = (e: ChangeEvent<HTMLInputElement>) =>
    setMinMemory(parseInt(e.target.value))
  const handleSoftMaxMemory = (e: ChangeEvent<HTMLInputElement>) =>
    setSoftMaxMemory(parseInt(e.target.value))
  const handleMaxMemory = (e: ChangeEvent<HTMLInputElement>) =>
    setMaxMemory(parseInt(e.target.value))

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
        <Input
          type="range"
          name="minMemory"
          label="Minimum Memory Usage"
          value={minMemory}
          min={128}
          max={softMaxMemory}
          onChange={handleMinMemory}
          suffix="mb"
        />
        <Input
          type="range"
          name="softMaxMemory"
          label="Target Memory Usage"
          value={softMaxMemory}
          min={minMemory}
          max={maxMemory}
          onChange={handleSoftMaxMemory}
          suffix="mb"
        />
        <Input
          type="range"
          name="maxMemory"
          label="Maximum Memory Usage"
          value={maxMemory}
          min={softMaxMemory}
          max={Math.floor((totalmem() * 0.75) / 1000000)}
          onChange={handleMaxMemory}
          suffix="mb"
        />
        <StyledButton type="submit">Save</StyledButton>
      </EditContainer>
    </EditWrapper>
  )
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.serverID as string

  const server = await window.serverAPI.get(id)
  const versions = await window.serverAPI.getVersions()

  return { server, versions }
}

export async function action({ request, params }: ActionFunctionArgs) {
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
  return redirect(`/server/${id}`)
}

type InputProps = (
  | { type: 'text'; placeholder?: string }
  | { type: 'checkbox'; name: string; checked?: boolean }
  | { type: 'range'; min: number; max: number; suffix?: string }
) & {
  label?: string
  name?: string
  value?: any
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

function Input(props: InputProps) {
  const { label, name, value, onChange } = props
  const labelEl = label && <InputLabel htmlFor={name}>{label}</InputLabel>
  switch (props.type) {
    case 'text':
      return (
        <InputWrapper type={props.type}>
          {labelEl}
          <StyledInput
            id={name}
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
        <InputWrapper className="group" type={props.type}>
          <StyledInput
            type={props.type}
            name={name}
            id={name}
            defaultChecked={props.checked}
            onChange={onChange}
          />
          <InputLabel htmlFor={name}>
            <StyledCheckbox checked={props.checked} />
            {label}
          </InputLabel>
        </InputWrapper>
      )
    case 'range':
      return (
        <InputWrapper type={props.type}>
          {label && (
            <InputLabel htmlFor={name}>
              {label} - {value}
              {props.suffix}
            </InputLabel>
          )}
          <StyledInput
            id={name}
            name={name}
            type={props.type}
            defaultValue={value}
            onChange={onChange}
            min={props.min}
            max={props.max}
          />
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

const EditWrapper = tw.div`flex h-full`
const EditContainer = tw(
  Form
)`flex flex-col bg-neutral-100 dark:bg-neutral-900 rounded-xl px-5 py-2 gap-4 w-2/3 max-w-xl m-auto`

const InputWrapper = styled.div<{ type: string }>`
  ${tw`flex flex-col gap-2`}
  ${({ type }: { type: string }) =>
    type === 'checkbox' && tw`flex-row items-center select-none`}
  &:has(span) * {
    ${tw`cursor-pointer`}
  }
`
const InputLabel = tw.label`flex gap-2 items-center text-sm font-medium text-neutral-800 dark:text-neutral-200`
const StyledInput = styled.input`
  ${tw`bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 focus:ring-2 block w-full p-2.5`}
  ${({ type }: { type: string }) =>
    type === 'checkbox'
      ? tw`absolute opacity-0 h-0 w-0 cursor-pointer`
      : type === 'range'
      ? tw`cursor-pointer appearance-none h-1 rounded-sm p-0`
      : null}
  &::-webkit-slider-thumb {
    ${tw`w-4 h-4 appearance-none cursor-pointer rounded-full bg-sky-400`}
  }
  &::-moz-range-thumb {
    ${tw`w-4 h-4 cursor-pointer rounded-full bg-sky-400`}
  }
`
type StyledCheckboxProps = { checked?: boolean }
const StyledCheckbox = styled.span<StyledCheckboxProps>`
  ${tw`w-4 h-4 relative group-hover:bg-neutral-300 group-hover:dark:bg-neutral-700 cursor-pointer inline-block bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-sm focus:ring-sky-400 focus:border-sky-400 focus:ring-2`}
  ${({ checked }: StyledCheckboxProps) => checked && tw`bg-sky-400!`}
  &::after {
    content: '';
    ${tw`absolute hidden left-1.5 top-0.5 w-1 h-2 border border-neutral-100 rotate-45`}
    ${({ checked }: StyledCheckboxProps) => checked && tw`block`}
    border-width: 0 0.125rem 0.125rem 0
  }
`

const SelectWrapper = tw.select`cursor-pointer bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 block w-full p-2.5`

const StyledButton = tw.button`bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 block w-full p-2.5 hover:bg-neutral-100 hover:dark:bg-neutral-900 transition-colors duration-100`
