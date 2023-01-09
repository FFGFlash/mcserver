import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createHashRouter } from 'react-router-dom'
import { AppState } from './app.context'
import Root, { RootLoader } from './pages/root'
import './styles'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')
const root = createRoot(rootEl)

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    loader: RootLoader
  }
])

root.render(
  <StrictMode>
    <AppState>
      <RouterProvider router={router} />
    </AppState>
  </StrictMode>
)
