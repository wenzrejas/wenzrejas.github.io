import {
  CLOSE_BOX,
  CROSS,
  FACE_RADIUS,
  RIM_LIGHT_ARC,
  RIM_RADIUS,
  RIM_SHADE_RADIUS,
  RING_CENTRE,
} from './constants'
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
      <svg className="close-button__art" viewBox={CLOSE_BOX} aria-hidden="true">
        <circle className="close-button__rim" {...RING_CENTRE} r={RIM_RADIUS} />
        <circle className="close-button__rim-shade" {...RING_CENTRE} r={RIM_SHADE_RADIUS} />
        <path className="close-button__rim-light" d={RIM_LIGHT_ARC} />
        <circle className="close-button__face" {...RING_CENTRE} r={FACE_RADIUS} />
        <path className="close-button__cross" d={CROSS} />
      </svg>
    </button>
  )
}
