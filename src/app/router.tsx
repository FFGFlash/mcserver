import { createHashRouter, RouteObject } from 'react-router-dom'
import ErrorState from './components/errorState'
import { lazy } from 'react'

import { rootLoader, rootAction } from './data/root'
import { editLoader, editAction } from './data/edit'
import { serverLoader, serverAction } from './data/server'
import { propertiesLoader, propertiesAction } from './data/properties'
import { consoleLoader, consoleAction } from './data/console'
import Update from './pages/update'

const Root = lazy(() => import('./pages/root'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const Edit = lazy(() => import('./pages/edit'))
const Server = lazy(() => import('./pages/server'))
const Properties = lazy(() => import('./pages/properties'))
const Console = lazy(() => import('./pages/console'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Update />,
    errorElement: <ErrorState />
  },
  {
    path: '/app',
    element: <Root />,
    errorElement: <ErrorState />,
    loader: rootLoader,
    action: rootAction,
    children: [
      {
        index: true,
        element: <Dashboard />,
        errorElement: <ErrorState />
      },
      {
        path: '*',
        element: <ErrorState status={404} message="Page Not Found" />
      },
      {
        path: 'server/:serverID/edit',
        element: <Edit />,
        errorElement: <ErrorState />,
        loader: editLoader,
        action: editAction
      },
      {
        path: 'server/:serverID',
        element: <Server />,
        errorElement: <ErrorState />,
        id: 'server',
        loader: serverLoader,
        action: serverAction,
        children: [
          {
            index: true,
            element: <Properties />,
            errorElement: <ErrorState />,
            loader: propertiesLoader,
            action: propertiesAction
          },
          {
            path: 'console',
            element: <Console />,
            errorElement: <ErrorState />,
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
