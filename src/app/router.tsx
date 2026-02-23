import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { CountingGamePage } from '../features/games/counting/CountingGamePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/games/counting',
    element: <CountingGamePage />,
  },
])
