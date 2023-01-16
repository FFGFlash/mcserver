import { Form, useLoaderData } from 'react-router-dom'
import tw from 'twin.macro'

export default function Properties() {
  const { properties } = useLoaderData() as {
    properties: IServerProperty[] | undefined
  }

  return (
    <PropertiesWrapper method="post">
      {(properties && (
        <>
          {properties?.map(({ key, value }) => (
            <PropertyWrapper key={`${key}${value}`}>
              <label htmlFor={key}>{key}</label>
              <StyledInput type="text" name={key} defaultValue={value} />
            </PropertyWrapper>
          ))}
          <StyledButton type="submit">Save</StyledButton>
        </>
      )) || (
        <InfoWrapper>
          It looks like this might be a new server, start the server to get the
          list of properties!
        </InfoWrapper>
      )}
    </PropertiesWrapper>
  )
}

const PropertiesWrapper = tw(
  Form
)`flex flex-col gap-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl px-5 py-2`
const PropertyWrapper = tw.div`w-full grid-cols-2 grid items-center`
const StyledInput = tw.input`w-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 focus:ring-2 block p-2.5`
const InfoWrapper = tw.div`flex justify-center items-center`
const StyledButton = tw.button`bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 text-neutral-800 dark:text-neutral-200 text-sm rounded-xl focus:ring-sky-400 focus:border-sky-400 block w-full p-2.5 hover:bg-neutral-100 hover:dark:bg-neutral-900 transition-colors duration-100`
