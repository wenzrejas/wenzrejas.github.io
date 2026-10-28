import { useMemo, useRef, type ReactNode } from 'react'
import { useScrollOverflowVariables } from '@/hooks/useScrollOverflowVariables'
import { mistMaskStyle } from '../shared/island-panel/mistModel'

interface SettingsPaneProps {
  id: string
  label: string
  children: ReactNode
}

export default function SettingsPane({ id, label, children }: SettingsPaneProps) {
  const paneRef = useRef<HTMLDivElement>(null)
  const mistStyle = useMemo(() => mistMaskStyle(), [])
  useScrollOverflowVariables(paneRef)

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
