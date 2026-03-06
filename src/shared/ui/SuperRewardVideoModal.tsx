import { useEffect, useState } from 'react'
import './SuperRewardVideoModal.css'

type SuperRewardVideoModalProps = {
  isOpen: boolean
  iframeKey: string
  embedUrl: string
  title: string
  closeLabel: string
  tapToPlayLabel: string
  onClose: () => void
}

function isIOSLikeDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  const ua = navigator.userAgent
  const iOSPlatform = /iPad|iPhone|iPod/.test(ua)
  const iPadDesktopUA = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOSPlatform || iPadDesktopUA
}

export function SuperRewardVideoModal({
  isOpen,
  iframeKey,
  embedUrl,
  title,
  closeLabel,
  tapToPlayLabel,
  onClose,
}: SuperRewardVideoModalProps) {
  const [playAttempt, setPlayAttempt] = useState(0)
  const [showTapOverlay, setShowTapOverlay] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setPlayAttempt(0)
    setShowTapOverlay(isIOSLikeDevice())
  }, [embedUrl, isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="super-reward-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="super-reward-backdrop"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div className="super-reward-dialog">
        <div className="super-reward-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="super-reward-close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            ✕
          </button>
        </div>
        <div className="super-reward-player">
          {showTapOverlay ? (
            <button
              type="button"
              className="super-reward-tap-overlay"
              onClick={() => {
                setPlayAttempt((current) => current + 1)
                setShowTapOverlay(false)
              }}
              aria-label={tapToPlayLabel}
            >
              {tapToPlayLabel}
            </button>
          ) : null}
          <iframe
            key={`${iframeKey}-${playAttempt}`}
            src={embedUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <button type="button" className="super-reward-done" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  )
}
