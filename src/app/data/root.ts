import { redirect } from 'react-router-dom'

export async function rootLoader() {
  const servers = await window.serverAPI.getAll()
  const darkMode = await window.darkModeAPI.isDarkMode()
  return { servers, darkMode }
}

export async function rootAction() {
  const server = await window.serverAPI.create()
  return redirect(`/app/server/${server.id}/edit`)
}
