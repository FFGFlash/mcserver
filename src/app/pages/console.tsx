import tw from 'twin.macro'

export default function Console() {
  return (
    <ConsoleWrapper>
      <ConsoleContent>Console!</ConsoleContent>
    </ConsoleWrapper>
  )
}

const ConsoleWrapper = tw.div`flex items-center justify-center`
const ConsoleContent = tw.div`flex flex-col rounded-xl bg-neutral-200 dark:bg-neutral-800 shadow-md`
