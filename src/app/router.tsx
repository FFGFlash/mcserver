import { createHashRouter, RouteObject } from 'react-router-dom'
import Root, { loader as rootLoader, action as rootAction } from './pages/root'
import ErrorPage from './pages/error'
import Dashboard from './pages/dashboard'
import Edit, { action as editAction } from './pages/edit'
import Server, {
  loader as serverLoader,
  action as serverAction
} from './pages/server'
import Console from './pages/console'
import deleteAction from './actions/deleteAction'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    action: rootAction,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'server/:serverID/edit',
        element: <Edit />,
        loader: serverLoader,
        action: editAction
      },
      {
        path: 'server/:serverID',
        element: <Server />,
        loader: serverLoader,
        action: serverAction
      }
    ]
  },
  {
    path: '/console/:serverID',
    element: <Console />,
    loader: serverLoader
  },
  {
    path: '/server/:serverID/delete',
    action: deleteAction
  }
]

const Router = createHashRouter(routes)

export default Router
