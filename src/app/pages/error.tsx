import { Link, useRouteError } from 'react-router-dom'
import tw from 'twin.macro'

export default function Error() {
  const error = useRouteError() as {
    status: number
    statusText?: string
    message?: string
  }

  return (
    <ErrorWrapper to="/">
      <h1>Oops! Looks like you&#39;ve run into an issue.</h1>
      <p>
        Error {error.status}: {error.statusText || error.message}
      </p>
    </ErrorWrapper>
  )
}

const ErrorWrapper = tw(Link)`flex flex-col items-center justify-center h-full`
