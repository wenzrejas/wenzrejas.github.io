import {
  changeSetting,
  useSettingsStore,
  type ChoiceSetting,
  type Settings,
} from '@/store/settingsStore'
import ChoiceRow from './ChoiceRow'

interface SettingChoiceRowProps<Key extends ChoiceSetting> {
  label: string
  setting: Key
  choices: readonly Settings[Key][]
  names: Record<Settings[Key], string>
}

export default function SettingChoiceRow<Key extends ChoiceSetting>({
  label,
  setting,
  choices,
  names,
}: SettingChoiceRowProps<Key>) {
  const chosen = useSettingsStore((state) => state[setting])

  return (
    <ChoiceRow
      label={label}
      choices={choices}
      names={names}
      chosen={chosen}
      onChoose={(choice) => changeSetting(setting, choice)}
    />
  )
}
