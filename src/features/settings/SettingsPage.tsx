import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  countingGameNameByLanguage,
  inverseCountingGameNameByLanguage,
  letterListeningGameNameByLanguage,
  type Language,
  languageLabels,
  parseLanguageParam,
  setStoredLanguage,
  settingsTextByLanguage,
} from '../../shared/i18n/i18n'
import {
  ALL_ALPHABET_LETTERS,
  COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS,
  type SuperRewardVideoSetting,
  answerPointerDelaySettingsRange,
  answerRevealDelaySettingsRange,
  createDefaultSuperRewardVideoSetting,
  getStoredCountingAnswerRevealDelaySeconds,
  countingHintFirstDelaySettingsRange,
  countingHintRepeatDelaySettingsRange,
  countingSettingsRange,
  getStoredCountingAnswerPointerDelaySeconds,
  getStoredCountingAnswerPointerEnabled,
  getStoredCountingDiceHintEnabled,
  getStoredCountingHintFirstDelaySeconds,
  getStoredCountingHintRepeatDelaySeconds,
  getStoredCountingMaxObjects,
  getStoredLetterListeningAnswerPointerDelaySeconds,
  getStoredLetterListeningAnswerPointerEnabled,
  getStoredLetterListeningAnswerRevealDelaySeconds,
  getStoredLetterListeningAllowedLettersForSettings,
  getStoredLetterListeningSuperRewardEnabled,
  getStoredLetterListeningSuperRewardFirstTryStreak,
  getStoredSuperRewardVideos,
  getStoredCountingSuperRewardFirstTryStreak,
  getStoredCountingSuperRewardEnabled,
  getStoredReverseCountingSuperRewardFirstTryStreak,
  getStoredReverseCountingSuperRewardEnabled,
  getStoredReverseCountingAnswerPointerDelaySeconds,
  getStoredReverseCountingAnswerPointerEnabled,
  getStoredReverseCountingAnswerRevealDelaySeconds,
  getStoredReverseCountingDiceHintEnabled,
  getStoredReverseCountingMaxObjects,
  getStoredSpeechVoiceUri,
  reverseCountingSettingsRange,
  superRewardDurationSettingsRange,
  superRewardFirstTryStreakSettingsRange,
  setStoredCountingAnswerPointerDelaySeconds,
  setStoredCountingAnswerPointerEnabled,
  setStoredCountingAnswerRevealDelaySeconds,
  setStoredCountingDiceHintEnabled,
  setStoredCountingHintFirstDelaySeconds,
  setStoredCountingHintRepeatDelaySeconds,
  setStoredCountingMaxObjects,
  setStoredLetterListeningAnswerPointerDelaySeconds,
  setStoredLetterListeningAnswerPointerEnabled,
  setStoredLetterListeningAnswerRevealDelaySeconds,
  setStoredLetterListeningAllowedLetters,
  setStoredLetterListeningSuperRewardEnabled,
  setStoredSuperRewardVideos,
  setStoredCountingSuperRewardFirstTryStreak,
  setStoredCountingSuperRewardEnabled,
  setStoredLetterListeningSuperRewardFirstTryStreak,
  setStoredReverseCountingSuperRewardFirstTryStreak,
  setStoredReverseCountingSuperRewardEnabled,
  setStoredReverseCountingAnswerPointerDelaySeconds,
  setStoredReverseCountingAnswerPointerEnabled,
  setStoredReverseCountingAnswerRevealDelaySeconds,
  setStoredReverseCountingDiceHintEnabled,
  setStoredReverseCountingMaxObjects,
  setStoredSpeechVoiceUri,
} from '../../shared/settings/gameSettings'
import { extractYouTubeVideoId } from '../../shared/rewards/superRewardVideo'
import './SettingsPage.css'

export function SettingsPage() {
  const [searchParams] = useSearchParams()
  const [language, setLanguage] = useState<Language>(() =>
    parseLanguageParam(searchParams.get('lang')),
  )
  const [countingMaxObjects, setCountingMaxObjects] = useState<number>(() =>
    getStoredCountingMaxObjects(),
  )
  const [countingAnswerPointerEnabled, setCountingAnswerPointerEnabled] = useState<boolean>(() =>
    getStoredCountingAnswerPointerEnabled(),
  )
  const [countingDiceHintEnabled, setCountingDiceHintEnabled] = useState<boolean>(() =>
    getStoredCountingDiceHintEnabled(),
  )
  const [countingAnswerPointerDelaySeconds, setCountingAnswerPointerDelaySeconds] =
    useState<number>(() => getStoredCountingAnswerPointerDelaySeconds())
  const [countingAnswerRevealDelaySeconds, setCountingAnswerRevealDelaySeconds] = useState<number>(
    () => getStoredCountingAnswerRevealDelaySeconds(),
  )
  const [countingHintFirstDelaySeconds, setCountingHintFirstDelaySeconds] = useState<number>(() =>
    getStoredCountingHintFirstDelaySeconds(),
  )
  const [countingHintRepeatDelaySeconds, setCountingHintRepeatDelaySeconds] = useState<number>(() =>
    getStoredCountingHintRepeatDelaySeconds(),
  )
  const [countingSuperRewardEnabled, setCountingSuperRewardEnabled] = useState<boolean>(() =>
    getStoredCountingSuperRewardEnabled(),
  )
  const [countingSuperRewardFirstTryStreak, setCountingSuperRewardFirstTryStreak] =
    useState<number>(() => getStoredCountingSuperRewardFirstTryStreak())
  const [reverseCountingMaxObjects, setReverseCountingMaxObjects] = useState<number>(() =>
    getStoredReverseCountingMaxObjects(),
  )
  const [reverseAnswerPointerEnabled, setReverseAnswerPointerEnabled] = useState<boolean>(() =>
    getStoredReverseCountingAnswerPointerEnabled(),
  )
  const [reverseDiceHintEnabled, setReverseDiceHintEnabled] = useState<boolean>(() =>
    getStoredReverseCountingDiceHintEnabled(),
  )
  const [reverseAnswerPointerDelaySeconds, setReverseAnswerPointerDelaySeconds] = useState<number>(
    () => getStoredReverseCountingAnswerPointerDelaySeconds(),
  )
  const [reverseAnswerRevealDelaySeconds, setReverseAnswerRevealDelaySeconds] = useState<number>(
    () => getStoredReverseCountingAnswerRevealDelaySeconds(),
  )
  const [reverseSuperRewardEnabled, setReverseSuperRewardEnabled] = useState<boolean>(() =>
    getStoredReverseCountingSuperRewardEnabled(),
  )
  const [reverseSuperRewardFirstTryStreak, setReverseSuperRewardFirstTryStreak] = useState<number>(
    () => getStoredReverseCountingSuperRewardFirstTryStreak(),
  )
  const [letterAnswerPointerEnabled, setLetterAnswerPointerEnabled] = useState<boolean>(() =>
    getStoredLetterListeningAnswerPointerEnabled(),
  )
  const [letterAnswerPointerDelaySeconds, setLetterAnswerPointerDelaySeconds] = useState<number>(
    () => getStoredLetterListeningAnswerPointerDelaySeconds(),
  )
  const [letterAnswerRevealDelaySeconds, setLetterAnswerRevealDelaySeconds] = useState<number>(
    () => getStoredLetterListeningAnswerRevealDelaySeconds(),
  )
  const [letterListeningLetters, setLetterListeningLetters] = useState<Set<string>>(
    () => new Set(getStoredLetterListeningAllowedLettersForSettings()),
  )
  const [letterSuperRewardEnabled, setLetterSuperRewardEnabled] = useState<boolean>(() =>
    getStoredLetterListeningSuperRewardEnabled(),
  )
  const [letterSuperRewardFirstTryStreak, setLetterSuperRewardFirstTryStreak] = useState<number>(
    () => getStoredLetterListeningSuperRewardFirstTryStreak(),
  )
  const [superRewardVideos, setSuperRewardVideos] = useState<SuperRewardVideoSetting[]>(() =>
    getStoredSuperRewardVideos(),
  )
  const [speechVoiceUri, setSpeechVoiceUri] = useState<string>(() => getStoredSpeechVoiceUri())
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const text = settingsTextByLanguage[language]
  const isCountingHintDisabled =
    countingHintFirstDelaySeconds === COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS
  const compatibleVoices = availableVoices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(language === 'fr' ? 'fr' : 'en'),
  )
  const selectedCompatibleVoiceUri = compatibleVoices.some((voice) => voice.voiceURI === speechVoiceUri)
    ? speechVoiceUri
    : ''
  const hasAtLeastOneValidSuperRewardVideo = superRewardVideos.some(
    (video) => extractYouTubeVideoId(video.youtubeUrl) !== null,
  )

  useEffect(() => {
    const fromQuery = parseLanguageParam(searchParams.get('lang'))
    setLanguage(fromQuery)
  }, [searchParams])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return
    }

    const synth = window.speechSynthesis
    const updateVoices = () => {
      const voices = synth
        .getVoices()
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
      setAvailableVoices(voices)
    }

    updateVoices()
    const delayedUpdateTimer = window.setTimeout(updateVoices, 350)
    synth.addEventListener('voiceschanged', updateVoices)

    return () => {
      window.clearTimeout(delayedUpdateTimer)
      synth.removeEventListener('voiceschanged', updateVoices)
    }
  }, [])

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage)
    setStoredLanguage(nextLanguage)
  }

  function handleSpeechVoiceChange(nextVoiceUri: string) {
    setSpeechVoiceUri(nextVoiceUri)
    setStoredSpeechVoiceUri(nextVoiceUri)

    if (typeof window === 'undefined') {
      return
    }
    const synth = window.speechSynthesis
    if (!synth) {
      return
    }

    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text.speechVoiceLabel)
    const selectedVoice = nextVoiceUri
      ? compatibleVoices.find((voice) => voice.voiceURI === nextVoiceUri)
      : undefined
    if (selectedVoice) {
      utterance.voice = selectedVoice
      utterance.lang = selectedVoice.lang
    } else {
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US'
    }
    utterance.rate = 0.95
    synth.speak(utterance)
  }

  function handleCountingMaxObjectsChange(nextValue: number) {
    setCountingMaxObjects(nextValue)
    setStoredCountingMaxObjects(nextValue)
  }

  function handleCountingAnswerPointerEnabledChange(enabled: boolean) {
    setCountingAnswerPointerEnabled(enabled)
    setStoredCountingAnswerPointerEnabled(enabled)
  }

  function handleCountingDiceHintEnabledChange(enabled: boolean) {
    setCountingDiceHintEnabled(enabled)
    setStoredCountingDiceHintEnabled(enabled)
  }

  function handleCountingAnswerPointerDelayChange(nextValue: number) {
    setCountingAnswerPointerDelaySeconds(nextValue)
    setStoredCountingAnswerPointerDelaySeconds(nextValue)
  }

  function handleCountingAnswerRevealDelayChange(nextValue: number) {
    setCountingAnswerRevealDelaySeconds(nextValue)
    setStoredCountingAnswerRevealDelaySeconds(nextValue)
  }

  function handleCountingHintFirstDelayChange(nextValue: number) {
    setCountingHintFirstDelaySeconds(nextValue)
    setStoredCountingHintFirstDelaySeconds(nextValue)
  }

  function handleCountingHintRepeatDelayChange(nextValue: number) {
    setCountingHintRepeatDelaySeconds(nextValue)
    setStoredCountingHintRepeatDelaySeconds(nextValue)
  }

  function handleCountingSuperRewardEnabledChange(enabled: boolean) {
    setCountingSuperRewardEnabled(enabled)
    setStoredCountingSuperRewardEnabled(enabled)
  }

  function handleReverseCountingMaxObjectsChange(nextValue: number) {
    setReverseCountingMaxObjects(nextValue)
    setStoredReverseCountingMaxObjects(nextValue)
  }

  function handleReverseAnswerPointerEnabledChange(enabled: boolean) {
    setReverseAnswerPointerEnabled(enabled)
    setStoredReverseCountingAnswerPointerEnabled(enabled)
  }

  function handleReverseDiceHintEnabledChange(enabled: boolean) {
    setReverseDiceHintEnabled(enabled)
    setStoredReverseCountingDiceHintEnabled(enabled)
  }

  function handleReverseAnswerPointerDelayChange(nextValue: number) {
    setReverseAnswerPointerDelaySeconds(nextValue)
    setStoredReverseCountingAnswerPointerDelaySeconds(nextValue)
  }

  function handleReverseAnswerRevealDelayChange(nextValue: number) {
    setReverseAnswerRevealDelaySeconds(nextValue)
    setStoredReverseCountingAnswerRevealDelaySeconds(nextValue)
  }

  function handleReverseSuperRewardEnabledChange(enabled: boolean) {
    setReverseSuperRewardEnabled(enabled)
    setStoredReverseCountingSuperRewardEnabled(enabled)
  }

  function handleLetterAnswerPointerEnabledChange(enabled: boolean) {
    setLetterAnswerPointerEnabled(enabled)
    setStoredLetterListeningAnswerPointerEnabled(enabled)
  }

  function handleLetterAnswerPointerDelayChange(nextValue: number) {
    setLetterAnswerPointerDelaySeconds(nextValue)
    setStoredLetterListeningAnswerPointerDelaySeconds(nextValue)
  }

  function handleLetterAnswerRevealDelayChange(nextValue: number) {
    setLetterAnswerRevealDelaySeconds(nextValue)
    setStoredLetterListeningAnswerRevealDelaySeconds(nextValue)
  }

  function handleLetterSuperRewardEnabledChange(enabled: boolean) {
    setLetterSuperRewardEnabled(enabled)
    setStoredLetterListeningSuperRewardEnabled(enabled)
  }

  function persistSuperRewardVideos(nextVideos: SuperRewardVideoSetting[]) {
    setSuperRewardVideos(nextVideos)
    setStoredSuperRewardVideos(nextVideos)
  }

  function handleAddSuperRewardVideo() {
    persistSuperRewardVideos([...superRewardVideos, createDefaultSuperRewardVideoSetting()])
  }

  function handleCountingSuperRewardFirstTryStreakChange(nextValue: number) {
    setCountingSuperRewardFirstTryStreak(nextValue)
    setStoredCountingSuperRewardFirstTryStreak(nextValue)
  }

  function handleReverseSuperRewardFirstTryStreakChange(nextValue: number) {
    setReverseSuperRewardFirstTryStreak(nextValue)
    setStoredReverseCountingSuperRewardFirstTryStreak(nextValue)
  }

  function handleLetterSuperRewardFirstTryStreakChange(nextValue: number) {
    setLetterSuperRewardFirstTryStreak(nextValue)
    setStoredLetterListeningSuperRewardFirstTryStreak(nextValue)
  }

  function handleRemoveSuperRewardVideo(videoId: string) {
    persistSuperRewardVideos(superRewardVideos.filter((video) => video.id !== videoId))
  }

  function handleSuperRewardVideoUrlChange(videoId: string, youtubeUrl: string) {
    persistSuperRewardVideos(
      superRewardVideos.map((video) =>
        video.id === videoId ? { ...video, youtubeUrl } : video,
      ),
    )
  }

  function handleSuperRewardVideoStartChange(videoId: string, startSecondsRaw: string) {
    const parsed = Number(startSecondsRaw)
    const startSeconds = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0

    persistSuperRewardVideos(
      superRewardVideos.map((video) =>
        video.id === videoId
          ? {
              ...video,
              startSeconds,
            }
          : video,
      ),
    )
  }

  function handleSuperRewardVideoDurationChange(videoId: string, durationSecondsRaw: string) {
    const parsed = Number(durationSecondsRaw)
    const durationSeconds = Number.isFinite(parsed)
      ? Math.max(
          superRewardDurationSettingsRange.min,
          Math.min(superRewardDurationSettingsRange.max, Math.floor(parsed)),
        )
      : superRewardDurationSettingsRange.defaultValue

    persistSuperRewardVideos(
      superRewardVideos.map((video) =>
        video.id === videoId
          ? {
              ...video,
              durationSeconds,
            }
          : video,
      ),
    )
  }

  function handleLetterListeningLetterToggle(letter: string) {
    const next = new Set(letterListeningLetters)
    if (next.has(letter)) {
      next.delete(letter)
    } else {
      next.add(letter)
    }
    setLetterListeningLetters(next)
    setStoredLetterListeningAllowedLetters([...next])
  }

  function handleLetterListeningSelectAll() {
    setLetterListeningLetters(new Set(ALL_ALPHABET_LETTERS))
    setStoredLetterListeningAllowedLetters([...ALL_ALPHABET_LETTERS])
  }

  function handleLetterListeningDeselectAll() {
    setLetterListeningLetters(new Set())
    setStoredLetterListeningAllowedLetters([])
  }

  return (
    <main className="app-shell settings-page">
      <header className="settings-header">
        <h1>{text.title}</h1>
        <Link to={`/?lang=${language}`} className="secondary-link" aria-label={text.backHomeLabel}>
          ⌂
        </Link>
      </header>

      <section className="settings-card">
        <h2>{text.languageTitle}</h2>
        <div className="language-switcher" role="group" aria-label={text.languageTitle}>
          {(['fr', 'en'] as const).map((lang) => {
            const active = language === lang
            return (
              <button
                key={lang}
                type="button"
                className={`language-chip ${active ? 'is-active' : ''}`}
                onClick={() => handleLanguageChange(lang)}
              >
                {languageLabels[lang]}
              </button>
            )
          })}
        </div>
        <label className="field-label" htmlFor="speech-voice-select">
          {text.speechVoiceLabel}
        </label>
        <select
          id="speech-voice-select"
          className="settings-select"
          value={selectedCompatibleVoiceUri}
          onChange={(event) => handleSpeechVoiceChange(event.target.value)}
        >
          <option value="">{text.speechVoiceDefaultOption}</option>
          {compatibleVoices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {`${voice.name} (${voice.lang})`}
            </option>
          ))}
        </select>
        {compatibleVoices.length === 0 ? (
          <p className="settings-hint">{text.speechVoiceUnavailableHint}</p>
        ) : null}
      </section>

      <section className="settings-card">
        <h2>{text.superRewardSectionTitle}</h2>
        <p className="settings-hint">{text.superRewardDescription}</p>
        <label className="field-label">{text.superRewardVideosLabel}</label>
        {superRewardVideos.length === 0 ? (
          <p className="settings-hint">{text.superRewardNoVideosHint}</p>
        ) : null}
        <div className="super-reward-list">
          {superRewardVideos.map((video) => {
            const hasUrl = video.youtubeUrl.trim().length > 0
            const hasValidYouTubeUrl = extractYouTubeVideoId(video.youtubeUrl) !== null
            return (
              <div key={video.id} className="super-reward-item">
                <label className="field-label super-reward-url">
                  <span>{text.superRewardVideoUrlLabel}</span>
                  <input
                    type="text"
                    className="settings-text-input"
                    value={video.youtubeUrl}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(event) =>
                      handleSuperRewardVideoUrlChange(video.id, event.target.value)
                    }
                  />
                </label>

                <label className="field-label super-reward-number-field">
                  <span>{text.superRewardVideoStartLabel}</span>
                  <input
                    type="number"
                    min={0}
                    className="settings-number-input"
                    value={video.startSeconds}
                    onChange={(event) =>
                      handleSuperRewardVideoStartChange(video.id, event.target.value)
                    }
                  />
                </label>

                <label className="field-label super-reward-number-field">
                  <span>{text.superRewardVideoDurationLabel}</span>
                  <input
                    type="number"
                    min={superRewardDurationSettingsRange.min}
                    max={superRewardDurationSettingsRange.max}
                    className="settings-number-input"
                    value={video.durationSeconds}
                    onChange={(event) =>
                      handleSuperRewardVideoDurationChange(video.id, event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="super-reward-remove-button"
                  onClick={() => handleRemoveSuperRewardVideo(video.id)}
                >
                  {text.superRewardRemoveVideoLabel}
                </button>

                {hasUrl && !hasValidYouTubeUrl ? (
                  <p className="super-reward-invalid-hint">{text.superRewardInvalidVideoHint}</p>
                ) : null}
              </div>
            )
          })}
        </div>
        <button type="button" className="language-chip" onClick={handleAddSuperRewardVideo}>
          {text.superRewardAddVideoLabel}
        </button>
      </section>

      <section className="settings-card">
        <h2>{countingGameNameByLanguage[language]}</h2>
        <label className="field-label" htmlFor="counting-max-objects">
          {text.countingMaxObjectsLabel}
        </label>
        <div className="range-row">
          <input
            id="counting-max-objects"
            type="range"
            min={countingSettingsRange.min}
            max={countingSettingsRange.max}
            value={countingMaxObjects}
            onChange={(event) => handleCountingMaxObjectsChange(Number(event.target.value))}
          />
          <output htmlFor="counting-max-objects">{countingMaxObjects}</output>
        </div>

        <label className="field-label" htmlFor="counting-hint-first-delay">
          {text.countingHintFirstDelayLabel}
        </label>
        <div className="range-row">
          <input
            id="counting-hint-first-delay"
            type="range"
            min={countingHintFirstDelaySettingsRange.min}
            max={countingHintFirstDelaySettingsRange.max}
            value={countingHintFirstDelaySeconds}
            onChange={(event) => handleCountingHintFirstDelayChange(Number(event.target.value))}
          />
          <output htmlFor="counting-hint-first-delay">
            {isCountingHintDisabled ? text.countingHintNeverLabel : `${countingHintFirstDelaySeconds}s`}
          </output>
        </div>

        <label className="field-label" htmlFor="counting-hint-repeat-delay">
          {text.countingHintRepeatDelayLabel}
        </label>
        <div className={`range-row ${isCountingHintDisabled ? 'is-disabled' : ''}`}>
          <input
            id="counting-hint-repeat-delay"
            type="range"
            min={countingHintRepeatDelaySettingsRange.min}
            max={countingHintRepeatDelaySettingsRange.max}
            value={countingHintRepeatDelaySeconds}
            onChange={(event) => handleCountingHintRepeatDelayChange(Number(event.target.value))}
            disabled={isCountingHintDisabled}
          />
          <output htmlFor="counting-hint-repeat-delay">{countingHintRepeatDelaySeconds}s</output>
        </div>

        <label className="toggle-row" htmlFor="counting-answer-pointer-enabled">
          <span>{text.answerPointerEnabledLabel}</span>
          <input
            id="counting-answer-pointer-enabled"
            type="checkbox"
            checked={countingAnswerPointerEnabled}
            onChange={(event) => handleCountingAnswerPointerEnabledChange(event.target.checked)}
          />
        </label>

        <label className="toggle-row" htmlFor="counting-dice-hint-enabled">
          <span>{text.diceHintEnabledLabel}</span>
          <input
            id="counting-dice-hint-enabled"
            type="checkbox"
            checked={countingDiceHintEnabled}
            onChange={(event) => handleCountingDiceHintEnabledChange(event.target.checked)}
          />
        </label>

        <label className="toggle-row" htmlFor="counting-super-reward-enabled">
          <span>{text.superRewardEnabledLabel}</span>
          <input
            id="counting-super-reward-enabled"
            type="checkbox"
            checked={countingSuperRewardEnabled}
            onChange={(event) => handleCountingSuperRewardEnabledChange(event.target.checked)}
            disabled={!hasAtLeastOneValidSuperRewardVideo}
          />
        </label>
        <label className="field-label" htmlFor="counting-super-reward-first-try-streak">
          {text.superRewardFirstTryStreakLabel}
        </label>
        <div className={`range-row ${!countingSuperRewardEnabled ? 'is-disabled' : ''}`}>
          <input
            id="counting-super-reward-first-try-streak"
            type="range"
            min={superRewardFirstTryStreakSettingsRange.min}
            max={superRewardFirstTryStreakSettingsRange.max}
            value={countingSuperRewardFirstTryStreak}
            onChange={(event) =>
              handleCountingSuperRewardFirstTryStreakChange(Number(event.target.value))
            }
            disabled={!countingSuperRewardEnabled || !hasAtLeastOneValidSuperRewardVideo}
          />
          <output htmlFor="counting-super-reward-first-try-streak">
            {countingSuperRewardFirstTryStreak}
          </output>
        </div>

        <label className="field-label" htmlFor="counting-answer-pointer-delay">
          {text.answerPointerDelayLabel}
        </label>
        <div className={`range-row ${!countingAnswerPointerEnabled ? 'is-disabled' : ''}`}>
          <input
            id="counting-answer-pointer-delay"
            type="range"
            min={answerPointerDelaySettingsRange.min}
            max={answerPointerDelaySettingsRange.max}
            value={countingAnswerPointerDelaySeconds}
            onChange={(event) => handleCountingAnswerPointerDelayChange(Number(event.target.value))}
            disabled={!countingAnswerPointerEnabled}
          />
          <output htmlFor="counting-answer-pointer-delay">
            {countingAnswerPointerDelaySeconds}s
          </output>
        </div>

        <label className="field-label" htmlFor="counting-answer-reveal-delay">
          {text.answerButtonsDelayLabel}
        </label>
        <div className="range-row">
          <input
            id="counting-answer-reveal-delay"
            type="range"
            min={answerRevealDelaySettingsRange.min}
            max={answerRevealDelaySettingsRange.max}
            value={countingAnswerRevealDelaySeconds}
            onChange={(event) => handleCountingAnswerRevealDelayChange(Number(event.target.value))}
          />
          <output htmlFor="counting-answer-reveal-delay">{countingAnswerRevealDelaySeconds}s</output>
        </div>
      </section>

      <section className="settings-card">
        <h2>{inverseCountingGameNameByLanguage[language]}</h2>
        <label className="field-label" htmlFor="reverse-counting-max-objects">
          {text.reverseCountingMaxObjectsLabel}
        </label>
        <div className="range-row">
          <input
            id="reverse-counting-max-objects"
            type="range"
            min={reverseCountingSettingsRange.min}
            max={reverseCountingSettingsRange.max}
            value={reverseCountingMaxObjects}
            onChange={(event) => handleReverseCountingMaxObjectsChange(Number(event.target.value))}
          />
          <output htmlFor="reverse-counting-max-objects">{reverseCountingMaxObjects}</output>
        </div>

        <label className="toggle-row" htmlFor="reverse-answer-pointer-enabled">
          <span>{text.answerPointerEnabledLabel}</span>
          <input
            id="reverse-answer-pointer-enabled"
            type="checkbox"
            checked={reverseAnswerPointerEnabled}
            onChange={(event) => handleReverseAnswerPointerEnabledChange(event.target.checked)}
          />
        </label>

        <label className="toggle-row" htmlFor="reverse-dice-hint-enabled">
          <span>{text.diceHintEnabledLabel}</span>
          <input
            id="reverse-dice-hint-enabled"
            type="checkbox"
            checked={reverseDiceHintEnabled}
            onChange={(event) => handleReverseDiceHintEnabledChange(event.target.checked)}
          />
        </label>

        <label className="toggle-row" htmlFor="reverse-super-reward-enabled">
          <span>{text.superRewardEnabledLabel}</span>
          <input
            id="reverse-super-reward-enabled"
            type="checkbox"
            checked={reverseSuperRewardEnabled}
            onChange={(event) => handleReverseSuperRewardEnabledChange(event.target.checked)}
            disabled={!hasAtLeastOneValidSuperRewardVideo}
          />
        </label>
        <label className="field-label" htmlFor="reverse-super-reward-first-try-streak">
          {text.superRewardFirstTryStreakLabel}
        </label>
        <div className={`range-row ${!reverseSuperRewardEnabled ? 'is-disabled' : ''}`}>
          <input
            id="reverse-super-reward-first-try-streak"
            type="range"
            min={superRewardFirstTryStreakSettingsRange.min}
            max={superRewardFirstTryStreakSettingsRange.max}
            value={reverseSuperRewardFirstTryStreak}
            onChange={(event) =>
              handleReverseSuperRewardFirstTryStreakChange(Number(event.target.value))
            }
            disabled={!reverseSuperRewardEnabled || !hasAtLeastOneValidSuperRewardVideo}
          />
          <output htmlFor="reverse-super-reward-first-try-streak">
            {reverseSuperRewardFirstTryStreak}
          </output>
        </div>

        <label className="field-label" htmlFor="reverse-answer-pointer-delay">
          {text.answerPointerDelayLabel}
        </label>
        <div className={`range-row ${!reverseAnswerPointerEnabled ? 'is-disabled' : ''}`}>
          <input
            id="reverse-answer-pointer-delay"
            type="range"
            min={answerPointerDelaySettingsRange.min}
            max={answerPointerDelaySettingsRange.max}
            value={reverseAnswerPointerDelaySeconds}
            onChange={(event) => handleReverseAnswerPointerDelayChange(Number(event.target.value))}
            disabled={!reverseAnswerPointerEnabled}
          />
          <output htmlFor="reverse-answer-pointer-delay">{reverseAnswerPointerDelaySeconds}s</output>
        </div>

        <label className="field-label" htmlFor="reverse-answer-reveal-delay">
          {text.answerButtonsDelayLabel}
        </label>
        <div className="range-row">
          <input
            id="reverse-answer-reveal-delay"
            type="range"
            min={answerRevealDelaySettingsRange.min}
            max={answerRevealDelaySettingsRange.max}
            value={reverseAnswerRevealDelaySeconds}
            onChange={(event) => handleReverseAnswerRevealDelayChange(Number(event.target.value))}
          />
          <output htmlFor="reverse-answer-reveal-delay">{reverseAnswerRevealDelaySeconds}s</output>
        </div>
      </section>

      <section className="settings-card">
        <h2>{letterListeningGameNameByLanguage[language]}</h2>
        <label className="field-label">{text.letterListeningAllowedLettersLabel}</label>
        <p className="settings-hint">{text.letterListeningMinLettersHint}</p>
        <div className="letter-selection-actions">
          <button
            type="button"
            className="language-chip"
            onClick={handleLetterListeningSelectAll}
          >
            {text.letterListeningAllLetters}
          </button>
          <button
            type="button"
            className="language-chip"
            onClick={handleLetterListeningDeselectAll}
          >
            {text.letterListeningNoLetters}
          </button>
        </div>
        <div className="letter-selection-grid" role="group" aria-label={text.letterListeningAllowedLettersLabel}>
          {ALL_ALPHABET_LETTERS.map((letter) => {
            const isSelected = letterListeningLetters.has(letter)
            return (
              <button
                key={letter}
                type="button"
                className={`letter-chip ${isSelected ? 'is-active' : ''}`}
                onClick={() => handleLetterListeningLetterToggle(letter)}
                aria-pressed={isSelected}
                aria-label={letter}
              >
                {letter}
              </button>
            )
          })}
        </div>

        <label className="toggle-row" htmlFor="letter-answer-pointer-enabled">
          <span>{text.answerPointerEnabledLabel}</span>
          <input
            id="letter-answer-pointer-enabled"
            type="checkbox"
            checked={letterAnswerPointerEnabled}
            onChange={(event) => handleLetterAnswerPointerEnabledChange(event.target.checked)}
          />
        </label>

        <label className="toggle-row" htmlFor="letter-super-reward-enabled">
          <span>{text.superRewardEnabledLabel}</span>
          <input
            id="letter-super-reward-enabled"
            type="checkbox"
            checked={letterSuperRewardEnabled}
            onChange={(event) => handleLetterSuperRewardEnabledChange(event.target.checked)}
            disabled={!hasAtLeastOneValidSuperRewardVideo}
          />
        </label>
        <label className="field-label" htmlFor="letter-super-reward-first-try-streak">
          {text.superRewardFirstTryStreakLabel}
        </label>
        <div className={`range-row ${!letterSuperRewardEnabled ? 'is-disabled' : ''}`}>
          <input
            id="letter-super-reward-first-try-streak"
            type="range"
            min={superRewardFirstTryStreakSettingsRange.min}
            max={superRewardFirstTryStreakSettingsRange.max}
            value={letterSuperRewardFirstTryStreak}
            onChange={(event) =>
              handleLetterSuperRewardFirstTryStreakChange(Number(event.target.value))
            }
            disabled={!letterSuperRewardEnabled || !hasAtLeastOneValidSuperRewardVideo}
          />
          <output htmlFor="letter-super-reward-first-try-streak">
            {letterSuperRewardFirstTryStreak}
          </output>
        </div>

        <label className="field-label" htmlFor="letter-answer-pointer-delay">
          {text.answerPointerDelayLabel}
        </label>
        <div className={`range-row ${!letterAnswerPointerEnabled ? 'is-disabled' : ''}`}>
          <input
            id="letter-answer-pointer-delay"
            type="range"
            min={answerPointerDelaySettingsRange.min}
            max={answerPointerDelaySettingsRange.max}
            value={letterAnswerPointerDelaySeconds}
            onChange={(event) => handleLetterAnswerPointerDelayChange(Number(event.target.value))}
            disabled={!letterAnswerPointerEnabled}
          />
          <output htmlFor="letter-answer-pointer-delay">{letterAnswerPointerDelaySeconds}s</output>
        </div>

        <label className="field-label" htmlFor="letter-answer-reveal-delay">
          {text.answerButtonsDelayLabel}
        </label>
        <div className="range-row">
          <input
            id="letter-answer-reveal-delay"
            type="range"
            min={answerRevealDelaySettingsRange.min}
            max={answerRevealDelaySettingsRange.max}
            value={letterAnswerRevealDelaySeconds}
            onChange={(event) => handleLetterAnswerRevealDelayChange(Number(event.target.value))}
          />
          <output htmlFor="letter-answer-reveal-delay">{letterAnswerRevealDelaySeconds}s</output>
        </div>
      </section>
    </main>
  )
}
