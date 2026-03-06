import './SuperRewardVideoModal.css'

type SuperRewardVideoModalProps = {
  isOpen: boolean
  iframeKey: string
  embedUrl: string
  title: string
  closeLabel: string
  onClose: () => void
}

export function SuperRewardVideoModal({
  isOpen,
  iframeKey,
  embedUrl,
  title,
  closeLabel,
  onClose,
}: SuperRewardVideoModalProps) {
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
          <iframe
            key={iframeKey}
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
