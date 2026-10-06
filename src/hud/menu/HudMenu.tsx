import { MENU_COPY } from '@/data/hudCopy'
import { toggleHud, toggleSound, useHudStore } from '@/store/hudStore'
import { useLoadingStore } from '@/store/loadingStore'
import { openWorldMap, useViewStore } from '@/store/viewStore'
import MenuIcon from './MenuIcon'
import './HudMenu.scss'

export default function HudMenu() {
  const activeScene = useViewStore((state) => state.activeScene)
  const isSoundOn = useHudStore((state) => state.isSoundOn)
  const isHudVisible = useHudStore((state) => state.isHudVisible)
  const isWorldRevealed = useLoadingStore((state) => state.isLoaderGone)

  return (
    <nav
      className={isWorldRevealed ? 'hud-menu' : 'hud-menu hud-menu--hidden'}
      aria-label={MENU_COPY.label}
    >
      <button
        type="button"
        className="hud-menu__button"
        aria-label={isSoundOn ? MENU_COPY.mute : MENU_COPY.unmute}
        onClick={toggleSound}
      >
        <MenuIcon icon="music" isSlashed={!isSoundOn} />
      </button>
      {activeScene === 'world' && (
        <button
          type="button"
          className="hud-menu__button"
          aria-label={isHudVisible ? MENU_COPY.hideHud : MENU_COPY.showHud}
          onClick={toggleHud}
        >
          <MenuIcon icon="eye" isSlashed={isHudVisible} />
        </button>
      )}
      <button
        type="button"
        className="hud-menu__button"
        aria-label={MENU_COPY.worldMap}
        onClick={openWorldMap}
      >
        <MenuIcon icon="map" />
      </button>
      <button type="button" className="hud-menu__button" aria-label={MENU_COPY.settings}>
        <MenuIcon icon="gear" />
      </button>
    </nav>
  )
}
