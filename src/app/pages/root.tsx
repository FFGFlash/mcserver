import { MouseEventHandler, PropsWithChildren, Suspense, useState } from 'react'
import { Form, Link, Outlet, useLoaderData } from 'react-router-dom'
import tw, { styled, TwStyle } from 'twin.macro'
import LoadingState from '../components/loadingState'
import Add from '../images/add.svg'
import Home from '../images/home.svg'
import Server from '../images/server.svg'
import Star from '../images/star.svg'

export default function Root() {
  const { servers, darkMode: initialDarkMode } = useLoaderData() as {
    servers: IServerInfo[]
    darkMode: boolean
  }

  const [darkMode, setDarkMode] = useState(initialDarkMode)

  const toggleDarkMode = () => window.darkModeAPI.toggle().then(setDarkMode)

  return (
    <RootWrapper>
      <SidebarWrapper method="post">
        <SidebarGroup>
          <SidebarItem
            type="link"
            to="/"
            fill={tw`fill-sky-600 dark:fill-sky-400`}
            background={tw`bg-blue-400 dark:bg-blue-600`}
          >
            <HomeIcon />
          </SidebarItem>
          <Divider />
          {servers.map(server => (
            <SidebarItem
              type="link"
              key={server.id}
              to={`/server/${server.id}`}
              fill={tw`fill-amber-600 dark:fill-amber-400`}
              background={tw`bg-orange-400 dark:bg-orange-600`}
              tooltip={server.name}
            >
              <ServerIcon />
            </SidebarItem>
          ))}
          <SidebarItem
            type="submit"
            fill={tw`fill-lime-600 dark:fill-lime-400`}
            background={tw`bg-green-400 dark:bg-green-600`}
            tooltip="Create New Server"
          >
            <AddIcon />
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarItem
            type="button"
            fill={tw`fill-neutral-400 dark:bg-neutral-600`}
            background={tw`bg-neutral-300 dark:bg-neutral-700`}
            onClick={toggleDarkMode}
            tooltip={`Toggle ${darkMode ? 'Light' : 'Dark'} Mode`}
          >
            <StarIcon />
          </SidebarItem>
        </SidebarGroup>
      </SidebarWrapper>
      <PageWrapper>
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </PageWrapper>
    </RootWrapper>
  )
}

type SidebarItemProps = (
  | { type: 'link'; to: string }
  | { type: 'submit' }
  | { type: 'button'; onClick?: MouseEventHandler<HTMLButtonElement> }
) & {
  fill: TwStyle
  background: TwStyle
  tooltip?: string
} & PropsWithChildren

function SidebarItem(props: SidebarItemProps) {
  const { children, fill, background, tooltip } = props

  const tooltipChild = tooltip && <SidebarTooltip>{tooltip}</SidebarTooltip>

  switch (props.type) {
    case 'button':
      return (
        <SidebarButton
          className="group"
          type={props.type}
          fill={fill}
          background={background}
          onClick={props.onClick}
        >
          {children}
          {tooltipChild}
        </SidebarButton>
      )
    case 'link':
      return (
        <SidebarLink
          className="group"
          fill={fill}
          background={background}
          to={props.to}
        >
          {children}
          {tooltipChild}
        </SidebarLink>
      )
    default:
      return (
        <SidebarButton
          className="group"
          type={props.type}
          fill={fill}
          background={background}
        >
          {children}
          {tooltipChild}
        </SidebarButton>
      )
  }
}

const RootWrapper = tw.div`flex min-h-screen h-fit flex-row`

const SidebarWrapper = tw(
  Form
)`relative w-16 m-0 flex flex-col gap-2 py-2 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-lg justify-between`
const SidebarGroup = tw.div`flex flex-col gap-2`
const SidebarLink = styled(Link)<{ fill: TwStyle; background: TwStyle }>`
  ${tw`relative flex items-center justify-center h-12 w-12 mx-auto p-1 bg-neutral-200 dark:bg-neutral-800 rounded-3xl hover:rounded-2xl transition-all cursor-pointer duration-300 ease-in-out`}
  ${({ fill }: { fill: TwStyle }) => fill}
  &:hover {
    ${({ background }: { background: TwStyle }) => background}
  }
`

const SidebarButton = styled.button<{ fill: TwStyle; background: TwStyle }>`
  ${tw`relative flex items-center justify-center h-12 w-12 mx-auto p-1 bg-neutral-200 dark:bg-neutral-800 rounded-3xl hover:rounded-2xl transition-all cursor-pointer duration-300 ease-in-out`}
  ${({ fill }: { fill: TwStyle }) => fill}
  &:hover {
    ${({ background }: { background: TwStyle }) => background}
  }
`
const SidebarTooltip = tw.span`absolute left-14 w-auto p-2 m-2 min-w-max rounded-md shadow-md bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-bold transition-all duration-100 origin-left z-50 scale-0 group-hover:scale-100`
const AddIcon = tw(Add)`fill-inherit`
const HomeIcon = tw(Home)`fill-inherit`
const ServerIcon = tw(Server)`fill-inherit`
const StarIcon = tw(Star)`fill-inherit`
const Divider = tw.div`border-b-2 border-neutral-200 dark:border-neutral-800 mx-2`

const PageWrapper = tw.div`relative flex-1 px-2 py-2`
