import { CHANNELS } from '@/audio/sounds'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import { toggleSound, useHudStore } from '@/store/hudStore'
import SwitchRow from '../rows/SwitchRow'
import VolumeSlider from '../rows/VolumeSlider'

export default function SoundTab() {
  const isSoundOn = useHudStore((state) => state.isSoundOn)

  return (
    <>
      <SwitchRow label={SETTINGS_COPY.sound.toggle} isOn={isSoundOn} onToggle={toggleSound} />
      {CHANNELS.map((channel) => (
        <VolumeSlider key={channel} channel={channel} />
      ))}
    </>
  )
}
