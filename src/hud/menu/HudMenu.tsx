import { toggleHud, toggleSound, useHudStore } from '@/store/hudStore'
import MenuIcon from './MenuIcon'
import './HudMenu.scss'

export default function HudMenu() {
  const isSoundOn = useHudStore((state) => state.isSoundOn)
  const isHudVisible = useHudStore((state) => state.isHudVisible)

  return (
    <nav className="hud-menu" aria-label="Game menu">
      <button
        type="button"
        className="hud-menu__button"
        aria-label={isSoundOn ? 'Mute sound' : 'Unmute sound'}
        onClick={toggleSound}
      >
        <MenuIcon icon="music" isSlashed={!isSoundOn} />
      </button>
      <button
        type="button"
        className="hud-menu__button"
        aria-label={isHudVisible ? 'Hide HUD' : 'Show HUD'}
        onClick={toggleHud}
      >
        <MenuIcon icon="eye" isSlashed={isHudVisible} />
      </button>
      <button type="button" className="hud-menu__button" aria-label="Settings">
        <MenuIcon icon="gear" />
      </button>
    </nav>
  )
}
