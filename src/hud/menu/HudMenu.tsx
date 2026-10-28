import { MENU_COPY } from '@/data/hudCopy'
import { useIsIntroductionOver } from '@/store/guideStore'
import { toggleHud, useHudStore } from '@/store/hudStore'
import { closePanel, openSettings, usePanelStore } from '@/store/panelStore'
import { isWorldScene, openWorldMap, useViewStore } from '@/store/viewStore'
import MenuIcon from './MenuIcon'
import './HudMenu.scss'

export default function HudMenu() {
  const isInWorld = useViewStore(isWorldScene)
  const isHudVisible = useHudStore((state) => state.isHudVisible)
  const isIntroductionOver = useIsIntroductionOver()
  const isSettingsOpen = usePanelStore((state) => state.activePanel === 'settings')

  return (
    <nav
      className={isIntroductionOver ? 'hud-menu' : 'hud-menu hud-menu--hidden'}
      aria-label={MENU_COPY.label}
    >
      {isInWorld && (
        <>
          <button
            type="button"
            className="hud-menu__button"
            aria-label={isHudVisible ? MENU_COPY.hideHud : MENU_COPY.showHud}
            onClick={toggleHud}
          >
            <MenuIcon icon="spyglass" isSlashed={isHudVisible} />
          </button>
          <button
            type="button"
            className="hud-menu__button"
            aria-label={MENU_COPY.worldMap}
            onClick={openWorldMap}
          >
            <MenuIcon icon="chart" />
          </button>
        </>
      )}
      <button
        type="button"
        className="hud-menu__button"
        aria-label={MENU_COPY.settings}
        aria-expanded={isSettingsOpen}
        onClick={isSettingsOpen ? closePanel : openSettings}
      >
        <MenuIcon icon="helm" />
      </button>
    </nav>
  )
}
