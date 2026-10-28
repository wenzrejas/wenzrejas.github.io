import { SETTINGS_COPY } from '@/data/settingsCopy'
import { SWITCH_CHOICES } from '../constants'
import ChoiceRow from './ChoiceRow'

interface SwitchRowProps {
  label: string
  isOn: boolean
  onToggle: () => void
}

export default function SwitchRow({ label, isOn, onToggle }: SwitchRowProps) {
  return (
    <ChoiceRow
      label={label}
      choices={SWITCH_CHOICES}
      names={SETTINGS_COPY.switch}
      chosen={isOn ? 'on' : 'off'}
      onChoose={onToggle}
    />
  )
}
