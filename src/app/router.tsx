import { createHashRouter } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { CountingGamePage } from '../features/games/counting/CountingGamePage'
import { SettingsPage } from '../features/settings/SettingsPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/games/counting',
    element: <CountingGamePage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
])
