import PanelIcon from '../shared/PanelIcon'
import './ArrowButton.scss'

interface ArrowButtonProps {
  direction: 'previous' | 'next'
  label: string
  isDisabled: boolean
  onClick: () => void
}

export default function ArrowButton({ direction, label, isDisabled, onClick }: ArrowButtonProps) {
  return (
    <button
      type="button"
      className={`arrow-button arrow-button--${direction}`}
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
    >
      <PanelIcon icon={direction} />
    </button>
  )
}
