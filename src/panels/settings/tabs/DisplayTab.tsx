import { SETTINGS_COPY } from '@/data/settingsCopy'
import { toggleHud, useHudStore } from '@/store/hudStore'
import { useIsTouchInput } from '@/store/inputStore'
import { isWorldScene, useViewStore } from '@/store/viewStore'
import { toggleFullscreen, useIsFullscreen } from '@/utils/fullscreen'
import { FRAME_RATE_CHOICES, GRAPHICS_CHOICES } from '../constants'
import SettingChoiceRow from '../rows/SettingChoiceRow'
import SettingSwitchRow from '../rows/SettingSwitchRow'
import SwitchRow from '../rows/SwitchRow'

const { display } = SETTINGS_COPY

export default function DisplayTab() {
  const isInWorld = useViewStore(isWorldScene)
  const isHudVisible = useHudStore((state) => state.isHudVisible)
  const isTouch = useIsTouchInput()
  const isFullscreen = useIsFullscreen()

  return (
    <>
      <SettingChoiceRow
        label={display.graphics}
        setting="graphicsQuality"
        choices={GRAPHICS_CHOICES}
        names={display.graphicsChoices}
      />
      <SettingChoiceRow
        label={display.frameRateLimit}
        setting="frameRateLimit"
        choices={FRAME_RATE_CHOICES}
        names={display.frameRateLimitChoices}
      />
      {isTouch && document.fullscreenEnabled && (
        <SwitchRow label={display.fullscreen} isOn={isFullscreen} onToggle={toggleFullscreen} />
      )}
      {isInWorld && <SwitchRow label={display.hud} isOn={isHudVisible} onToggle={toggleHud} />}
      <SettingSwitchRow label={display.reduceMotion} setting="isMotionReduced" />
      <SettingSwitchRow label={display.reduceFlashing} setting="isFlashingReduced" />
    </>
  )
}
