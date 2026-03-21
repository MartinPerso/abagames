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
  onClose: () => void
}

export function SuperRewardVideoModal({
  playback,
  title,
  closeLabel,
  onClose,
}: SuperRewardVideoModalProps) {
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
          {playback.kind === 'youtube' ? (
            <iframe
              key={playback.iframeKey}
              src={playback.embedUrl}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video
              key={playback.videoKey}
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
