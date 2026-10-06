import { LOADING_COPY } from '@/data/loadingCopy'
import MenuIcon from '@/hud/menu/MenuIcon'
import { toggleSound, useHudStore } from '@/store/hudStore'
import './SoundToggle.scss'

export default function SoundToggle() {
  const isSoundOn = useHudStore((state) => state.isSoundOn)

  return (
    <button type="button" className="sound-toggle" onClick={toggleSound}>
      <MenuIcon icon="music" isSlashed={!isSoundOn} />
      <span className="sound-toggle__label">
        {isSoundOn ? LOADING_COPY.soundOn : LOADING_COPY.soundOff}
      </span>
    </button>
  )
}
