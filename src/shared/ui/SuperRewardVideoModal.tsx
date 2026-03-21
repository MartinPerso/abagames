import { useEffect, useState } from 'react'
import './SuperRewardVideoModal.css'

export type SuperRewardVideoPlayback =
  | {
      kind: 'youtube'
      iframeKey: string
      embedUrl: string
    }
  | {
      kind: 'local'
      videoKey: string
      videoUrl: string
      startSeconds: number
    }

type SuperRewardVideoModalProps = {
  playback: SuperRewardVideoPlayback | null
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
  playback,
  title,
  closeLabel,
  tapToPlayLabel,
  onClose,
}: SuperRewardVideoModalProps) {
  const [playAttempt, setPlayAttempt] = useState(0)
  const [showTapOverlay, setShowTapOverlay] = useState(false)
  const isOpen = playback !== null

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setPlayAttempt(0)
    setShowTapOverlay(isIOSLikeDevice())
  }, [isOpen, playback])

  if (!playback) {
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
          {playback.kind === 'youtube' ? (
            <iframe
              key={`${playback.iframeKey}-${playAttempt}`}
              src={playback.embedUrl}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video
              key={`${playback.videoKey}-${playAttempt}`}
              src={playback.videoUrl}
              autoPlay
              controls
              playsInline
              preload="auto"
              onLoadedMetadata={(event) => {
                if (playback.startSeconds <= 0) {
                  return
                }

                const player = event.currentTarget
                try {
                  player.currentTime = playback.startSeconds
                } catch {
                  // Ignore browsers that delay seeking until later buffered ranges.
                }
              }}
            />
          )}
        </div>
        <button type="button" className="super-reward-done" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  )
}
