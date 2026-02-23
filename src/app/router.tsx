import { createHashRouter } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { CountingGamePage } from '../features/games/counting/CountingGamePage'
import { ReverseCountingGamePage } from '../features/games/reverseCounting/ReverseCountingGamePage'
import { LetterListeningGamePage } from '../features/games/letterListening/LetterListeningGamePage'
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
    path: '/games/reverse-counting',
    element: <ReverseCountingGamePage />,
  },
  {
    path: '/games/letter-listening',
    element: <LetterListeningGamePage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
])
