import { CLOSE_BUTTON_URL } from './constants'
import './CloseButton.scss'

interface CloseButtonProps {
  className: string
  label: string
  onClose: () => void
}

export default function CloseButton({ className, label, onClose }: CloseButtonProps) {
  return (
    <button
      type="button"
      className={`close-button ${className}`}
      aria-label={label}
      onClick={onClose}
    >
      <img className="close-button__art" src={CLOSE_BUTTON_URL} alt="" draggable={false} />
    </button>
  )
}
