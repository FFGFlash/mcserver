import tw from 'twin.macro'
import Info from '../images/info.svg'

export default function LoadingState() {
  return (
    <InfoWrapper>
      <InfoIcon />
      <h1>Just a moment!</h1>
      <p>We&#39;re getting things ready.</p>
    </InfoWrapper>
  )
}

const InfoIcon = tw(Info)`w-12 h-12 fill-blue-400 dark:fill-blue-500`
const InfoWrapper = tw.div`flex flex-col items-center justify-center h-full`
