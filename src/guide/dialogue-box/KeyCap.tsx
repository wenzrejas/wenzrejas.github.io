import { ARROW_KEY_TURNS } from './constants'

export default function KeyCap({ label }: { label: string }) {
  const turn = ARROW_KEY_TURNS[label]

  return (
    <kbd className="dialogue-box__key">
      {turn === undefined ? (
        label
      ) : (
        <svg
          className="dialogue-box__key-arrow"
          viewBox="0 0 16 16"
          role="img"
          aria-label={label}
          style={{ transform: `rotate(${turn}deg)` }}
        >
          <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
        </svg>
      )}
    </kbd>
  )
}
