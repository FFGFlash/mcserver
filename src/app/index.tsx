import './styles'
import { StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import Router from './router'
import LoadingState from './components/loadingState'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')
const root = createRoot(rootEl)

function App() {
  const [darkMode, setDarkMode] = useState(false)

  window.darkModeAPI.isDarkMode().then(setDarkMode)
  useEffect(() => window.darkModeAPI.changed(setDarkMode), [])
  useEffect(() => {
    darkMode
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark')
    document.documentElement.classList.remove('preload')
  }, [darkMode])

  return <RouterProvider router={Router} fallbackElement={<LoadingState />} />
}

root.render(
  <StrictMode>
    <Suspense fallback={<LoadingState />}>
      <App />
    </Suspense>
  </StrictMode>
)
