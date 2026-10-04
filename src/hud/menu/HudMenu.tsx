import { MENU_COPY } from '@/data/hudCopy'
import { toggleHud, toggleSound, useHudStore } from '@/store/hudStore'
import MenuIcon from './MenuIcon'
import './HudMenu.scss'

export default function HudMenu() {
  const isSoundOn = useHudStore((state) => state.isSoundOn)
  const isHudVisible = useHudStore((state) => state.isHudVisible)

  return (
    <nav className="hud-menu" aria-label={MENU_COPY.label}>
      <button
        type="button"
        className="hud-menu__button"
        aria-label={isSoundOn ? MENU_COPY.mute : MENU_COPY.unmute}
        onClick={toggleSound}
      >
        <MenuIcon icon="music" isSlashed={!isSoundOn} />
      </button>
      <button
        type="button"
        className="hud-menu__button"
        aria-label={isHudVisible ? MENU_COPY.hideHud : MENU_COPY.showHud}
        onClick={toggleHud}
      >
        <MenuIcon icon="eye" isSlashed={isHudVisible} />
      </button>
      <button type="button" className="hud-menu__button" aria-label={MENU_COPY.settings}>
        <MenuIcon icon="gear" />
      </button>
    </nav>
  )
}
