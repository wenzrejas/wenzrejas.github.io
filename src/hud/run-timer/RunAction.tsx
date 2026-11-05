import type { MouseEvent } from 'react'
import KeyCap from '@/panels/shared/key-cap/KeyCap'
import { useIsTouchInput } from '@/store/inputStore'
import { useCompactLayout } from '@/utils/layout'
import MenuIcon from '../menu/MenuIcon'

const keepFocusOnWorld = (event: MouseEvent) => event.preventDefault()

interface RunActionProps {
  icon: 'restart' | 'abandon'
  label: string
  keyLabel: string
  onClick: () => void
}

export default function RunAction({ icon, label, keyLabel, onClick }: RunActionProps) {
  const isTouch = useIsTouchInput()
  const isCompact = useCompactLayout()

  return (
    <button
      type="button"
      className="run-timer__action"
      aria-label={label}
      onMouseDown={keepFocusOnWorld}
      onClick={onClick}
    >
      {isCompact ? (
        <MenuIcon icon={icon} />
      ) : (
        <>
          {!isTouch && <KeyCap label={keyLabel} />}
          <span className="run-timer__action-label">{label}</span>
        </>
      )}
    </button>
  )
}
