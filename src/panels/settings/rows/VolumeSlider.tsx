import { useId, type CSSProperties } from 'react'
import type { Channel } from '@/audio/sounds'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import { changeVolume, useSettingsStore } from '@/store/settingsStore'
import { VOLUME_STEP } from '../constants'

interface VolumeSliderProps {
  channel: Channel
}

export default function VolumeSlider({ channel }: VolumeSliderProps) {
  const volume = useSettingsStore((state) => state.volumes[channel])
  const sliderId = useId()

  return (
    <div className="settings__row">
      <label className="settings__label" htmlFor={sliderId}>
        {SETTINGS_COPY.sound.volumes[channel]}
      </label>
      <input
        id={sliderId}
        className="settings__slider"
        type="range"
        min={0}
        max={1}
        step={VOLUME_STEP}
        value={volume}
        style={{ '--volume': volume } as CSSProperties}
        onChange={(event) => changeVolume(channel, event.currentTarget.valueAsNumber)}
      />
      <output className="settings__value" htmlFor={sliderId}>
        {SETTINGS_COPY.sound.volumeValue(volume)}
      </output>
    </div>
  )
}
