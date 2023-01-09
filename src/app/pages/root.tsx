import tw from 'twin.macro'

export default function App() {
  return <CenterWrapper>Hello World!</CenterWrapper>
}

export function RootLoader() {
  return null
}

const CenterWrapper = tw.div`flex flex-col items-center justify-center h-full`
