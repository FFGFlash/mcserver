import tw from 'twin.macro'
import Info from '../images/info.svg'

export interface InfoStateProps {
  title: string
  description: string
}

export default function InfoState({ title, description }: InfoStateProps) {
  return (
    <InfoWrapper>
      <InfoIcon />
      <h1>{title}</h1>
      <p>{description}</p>
    </InfoWrapper>
  )
}

const InfoIcon = tw(Info)`w-12 h-12 fill-blue-400 dark:fill-blue-500`
const InfoWrapper = tw.div`flex flex-col items-center justify-center h-full`
