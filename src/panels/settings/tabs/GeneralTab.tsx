import { CHANNELS } from '@/audio/sounds'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import { toggleHud, toggleSound, useHudStore } from '@/store/hudStore'
import { useIsTouchInput } from '@/store/inputStore'
import { isWorldScene, useViewStore } from '@/store/viewStore'
import { toggleFullscreen, useIsFullscreen } from '@/utils/fullscreen'
import { FRAME_RATE_CHOICES, GRAPHICS_CHOICES } from '../constants'
import SettingChoiceRow from '../rows/SettingChoiceRow'
import SettingSwitchRow from '../rows/SettingSwitchRow'
import SwitchRow from '../rows/SwitchRow'
import VolumeSlider from '../rows/VolumeSlider'

const { general } = SETTINGS_COPY

export default function GeneralTab() {
  const isSoundOn = useHudStore((state) => state.isSoundOn)
  const isInWorld = useViewStore(isWorldScene)
  const isHudVisible = useHudStore((state) => state.isHudVisible)
  const isTouch = useIsTouchInput()
  const isFullscreen = useIsFullscreen()

  return (
    <>
      <section className="settings__group">
        <h3 className="settings__group-heading">{general.sound}</h3>
        <SwitchRow label={general.allSound} isOn={isSoundOn} onToggle={toggleSound} />
        {CHANNELS.map((channel) => (
          <VolumeSlider key={channel} channel={channel} />
        ))}
      </section>
      <section className="settings__group">
        <h3 className="settings__group-heading">{general.display}</h3>
        <SettingChoiceRow
          label={general.graphics}
          setting="graphicsQuality"
          choices={GRAPHICS_CHOICES}
          names={general.graphicsChoices}
        />
        <SettingChoiceRow
          label={general.frameRateLimit}
          setting="frameRateLimit"
          choices={FRAME_RATE_CHOICES}
          names={general.frameRateLimitChoices}
        />
        {isTouch && document.fullscreenEnabled && (
          <SwitchRow label={general.fullscreen} isOn={isFullscreen} onToggle={toggleFullscreen} />
        )}
        {isInWorld && <SwitchRow label={general.hud} isOn={isHudVisible} onToggle={toggleHud} />}
        <SettingSwitchRow label={general.reduceMotion} setting="isMotionReduced" />
        <SettingSwitchRow label={general.reduceFlashing} setting="isFlashingReduced" />
      </section>
    </>
  )
}
