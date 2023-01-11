import './styles'
import { StrictMode, useContext, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import AppContext, { AppState } from './app.context'
import Router from './router'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')
const root = createRoot(rootEl)

function App() {
  const { darkMode } = useContext(AppContext)

  useEffect(() => {
    darkMode
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark')
    document.documentElement.classList.remove('preload')
  }, [darkMode])

  return <RouterProvider router={Router} />
}

root.render(
  <StrictMode>
    <AppState>
      <App />
    </AppState>
  </StrictMode>
)
