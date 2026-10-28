import { changeSetting, useSettingsStore, type SwitchSetting } from '@/store/settingsStore'
import SwitchRow from './SwitchRow'

interface SettingSwitchRowProps {
  label: string
  setting: SwitchSetting
}

export default function SettingSwitchRow({ label, setting }: SettingSwitchRowProps) {
  const isOn = useSettingsStore((state) => state[setting])

  return <SwitchRow label={label} isOn={isOn} onToggle={() => changeSetting(setting, !isOn)} />
}
