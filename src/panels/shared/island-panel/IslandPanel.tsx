import { useEffect, useId, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { animated, type SpringValues } from '@react-spring/web'
import { useScrollOverflowVariables } from '@/hooks/useScrollOverflowVariables'
import { PANEL_COPY } from '@/data/panelCopy'
import { centerFocusLeftOf, closePanel } from '@/store/panelStore'
import { isDepthsInView, isWorldInView } from '@/store/viewStore'
import CloseButton from '../close-button/CloseButton'
import CompassRose from '../compass-rose/CompassRose'
import PanelArt from '../panel-art/PanelArt'
import Parchment from '../parchment/Parchment'
import { TITLE_UNDERLINE, TITLE_UNDERLINE_BOX } from './brushStrokeModel'
import { mistMaskStyle } from './mistModel'
import './IslandPanel.scss'

interface SheetMotion {
  opacity: number
  x: number
  rotate: number
}

interface IslandPanelProps {
  title: string
  subtitle: string
  splashUrl?: string
  splashZoom?: number
  isCentered?: boolean
  motion: SpringValues<SheetMotion>
  children: ReactNode
}

export default function IslandPanel({
  title,
  subtitle,
  splashUrl,
  splashZoom,
  isCentered = false,
  motion,
  children,
}: IslandPanelProps) {
  const layoutRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const mistStyle = useMemo(() => mistMaskStyle(), [])
  useScrollOverflowVariables(contentRef)

  useLayoutEffect(() => {
    const layout = layoutRef.current
    if (!layout || isCentered) return
    const reportOpenArea = () => centerFocusLeftOf(layout.getBoundingClientRect().left)
    reportOpenArea()
    window.addEventListener('resize', reportOpenArea)
    return () => window.removeEventListener('resize', reportOpenArea)
  }, [isCentered])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (isWorldInView() || isDepthsInView())) closePanel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <aside
      ref={layoutRef}
      className={isCentered ? 'island-panel island-panel--centered' : 'island-panel'}
      role="dialog"
      aria-labelledby={titleId}
    >
      <animated.div className="island-panel__sheet" style={motion}>
        <Parchment />
        <CloseButton
          className="island-panel__close"
          label={PANEL_COPY.close}
          onClose={closePanel}
        />
        <div className="island-panel__viewport">
          <div ref={contentRef} className="island-panel__content" style={mistStyle}>
            <CompassRose className="island-panel__compass" />
            <div
              className={
                splashUrl
                  ? 'island-panel__page island-panel__page--with-splash'
                  : 'island-panel__page'
              }
            >
              {splashUrl && (
                <div className="island-panel__splash">
                  <PanelArt splashUrl={splashUrl} zoom={splashZoom} />
                </div>
              )}
              <div className="island-panel__body">
                <header className="island-panel__beside-splash">
                  <div className="island-panel__titles">
                    <h2 id={titleId} className="island-panel__title">
                      {title}
                    </h2>
                    <svg
                      className="island-panel__underline"
                      viewBox={TITLE_UNDERLINE_BOX}
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path d={TITLE_UNDERLINE} />
                    </svg>
                    <p className="island-panel__subtitle">{subtitle}</p>
                  </div>
                </header>
                {children}
              </div>
            </div>
          </div>
        </div>
      </animated.div>
    </aside>
  )
}
