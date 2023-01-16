import { useRouteError } from 'react-router-dom'
import tw from 'twin.macro'
import Error from '../images/error.svg'

interface ErrorStateProps {
  status?: number
  message?: string
}

export default function ErrorState({ status, message }: ErrorStateProps) {
  const error = useRouteError() as {
    status: number
    statusText?: string
    message?: string
  }

  return (
    <ErrorWrapper>
      <ErrorIcon />
      <h1>Oops! Looks like you&#39;ve run into an issue.</h1>
      <p>
        Error {status || error.status}:{' '}
        {message || error.statusText || error.message}
      </p>
    </ErrorWrapper>
  )
}

const ErrorIcon = tw(Error)`w-12 h-12 fill-red-400 dark:fill-red-500`
const ErrorWrapper = tw.div`flex flex-col items-center justify-center h-full`
