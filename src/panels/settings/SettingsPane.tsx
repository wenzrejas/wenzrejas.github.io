import { useRef, type ReactNode } from 'react'
import { useMistScroll } from '../shared/island-panel/useMistScroll'

interface SettingsPaneProps {
  id: string
  label: string
  children: ReactNode
}

export default function SettingsPane({ id, label, children }: SettingsPaneProps) {
  const paneRef = useRef<HTMLDivElement>(null)
  const mistStyle = useMistScroll(paneRef)

  return (
    <div
      ref={paneRef}
      id={id}
      className="settings__pane"
      role="tabpanel"
      aria-label={label}
      style={mistStyle}
    >
      {children}
    </div>
  )
}
