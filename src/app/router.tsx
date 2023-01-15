import { createHashRouter, RouteObject } from 'react-router-dom'
import Root, { loader as rootLoader, action as rootAction } from './pages/root'
import ErrorBoundary from './components/errorBoundary'
import Dashboard from './pages/dashboard'
import Edit, { loader as editLoader, action as editAction } from './pages/edit'
import Server, {
  loader as serverLoader,
  action as serverAction
} from './pages/server'
import Console, {
  loader as consoleLoader,
  action as consoleAction
} from './pages/console'
import Properties, {
  loader as propertiesLoader,
  action as propertiesAction
} from './pages/properties'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorBoundary />,
    loader: rootLoader,
    action: rootAction,
    children: [
      {
        index: true,
        element: <Dashboard />,
        errorElement: <ErrorBoundary />
      },
      {
        path: 'server/:serverID/edit',
        element: <Edit />,
        errorElement: <ErrorBoundary />,
        loader: editLoader,
        action: editAction
      },
      {
        path: 'server/:serverID',
        element: <Server />,
        errorElement: <ErrorBoundary />,
        id: 'server',
        loader: serverLoader,
        action: serverAction,
        children: [
          {
            index: true,
            element: <Properties />,
            errorElement: <ErrorBoundary />,
            loader: propertiesLoader,
            action: propertiesAction
          },
          {
            path: 'console',
            element: <Console />,
            errorElement: <ErrorBoundary />,
            loader: consoleLoader,
            action: consoleAction
          }
        ]
      }
    ]
  }
]

const Router = createHashRouter(routes)

export default Router
