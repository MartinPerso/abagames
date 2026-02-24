import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { router } from './app/router'
import './index.css'

function setupIOSZoomLock() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined
  }

  const isIOSDevice =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (!isIOSDevice) {
    return () => undefined
  }

  let lastTouchEnd = 0

  const preventDefault = (event: Event) => {
    event.preventDefault()
  }

  const preventPinchZoom = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      event.preventDefault()
    }
  }

  const preventDoubleTapZoom = (event: TouchEvent) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }

  document.addEventListener('gesturestart', preventDefault, { passive: false })
  document.addEventListener('gesturechange', preventDefault, { passive: false })
  document.addEventListener('touchmove', preventPinchZoom, { passive: false })
  document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })

  return () => {
    document.removeEventListener('gesturestart', preventDefault)
    document.removeEventListener('gesturechange', preventDefault)
    document.removeEventListener('touchmove', preventPinchZoom)
    document.removeEventListener('touchend', preventDoubleTapZoom)
  }
}

const teardownZoomLock = setupIOSZoomLock()

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

window.addEventListener('beforeunload', () => {
  teardownZoomLock()
})
