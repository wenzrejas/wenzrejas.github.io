import { Fragment, useMemo, type CSSProperties } from 'react'
import { BLEED_MASK_URL, BLEED_SECONDS, WORD_SECONDS, WRITE_DELAY_SECONDS } from '../constants'
import { MESSAGES, messageWords, writeDelaySeconds } from '../loadingMessages'
import './HandwrittenMessage.scss'

interface HandwrittenMessageProps {
  message: number
  fadingMessage: number | null
}

export default function HandwrittenMessage({ message, fadingMessage }: HandwrittenMessageProps) {
  const ink = useMemo(
    () =>
      ({
        '--word-seconds': WORD_SECONDS,
        '--bleed-seconds': BLEED_SECONDS,
        '--fade-seconds': WRITE_DELAY_SECONDS,
        '--bleed': `url(${BLEED_MASK_URL})`,
      }) as CSSProperties,
    []
  )
  const writing = {
    '--write-delay-seconds': writeDelaySeconds(fadingMessage !== null),
  } as CSSProperties

  return (
    <p className="handwritten-message" role="status" style={ink}>
      {fadingMessage !== null && (
        <span
          key={`fading-${fadingMessage}`}
          className="handwritten-message__line handwritten-message__line--fading"
          aria-hidden="true"
        >
          {MESSAGES[fadingMessage]}
        </span>
      )}
      <span key={message} className="handwritten-message__line" style={writing}>
        {messageWords(message).map((word, index) => (
          <Fragment key={index}>
            {index > 0 && ' '}
            <span
              className="handwritten-message__word"
              style={{ '--word': index } as CSSProperties}
            >
              {word}
            </span>
          </Fragment>
        ))}
      </span>
    </p>
  )
}
