import { useCallback, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { trackEvent } from '@/analytics/analytics'
import { DEPTHS_COPY, type MilestoneCopy } from '@/data/depthsCopy'
import type { WallClock } from '@/utils/time'
import type { Timeline } from '../timeline/timeline'
import { CARD_VIEWED_ABOVE_PRESENCE, FITTED_Z_INDEX_RANGE, PANEL_Z_INDEX_RANGE } from './constants'
import {
  createPanelReveal,
  measurePanel,
  panelPosition,
  panelSide,
  panelSpot,
  showPanel,
  stepPanelReveal,
  type PanelLayout,
} from './panelPlacement'
import './MilestonePanel.scss'

interface MilestonePanelProps {
  level: number
  milestone: MilestoneCopy
  timeline: Timeline
  clock: WallClock
  layout: PanelLayout
}

export default function MilestonePanel({
  level,
  milestone,
  timeline,
  clock,
  layout,
}: MilestonePanelProps) {
  const cardRef = useRef<HTMLElement>(null)
  const hasBeenViewed = useRef(false)
  const reveal = useMemo(() => createPanelReveal(), [])
  const side = panelSide(level)
  const spot = useMemo(() => panelSpot(level), [level])
  const position = useMemo(
    () => panelPosition(layout, level, timeline, reveal),
    [layout, level, timeline, reveal]
  )

  const trackCard = useCallback(
    (card: HTMLElement | null) => {
      cardRef.current = card
      return card ? measurePanel(reveal, card) : undefined
    },
    [reveal]
  )

  useFrame(() => {
    const card = cardRef.current
    if (!card) return
    stepPanelReveal(reveal, layout, timeline, level, clock.delta)
    showPanel(card, layout === 'under' ? 0 : side, reveal.presence)
    if (!hasBeenViewed.current && reveal.presence > CARD_VIEWED_ABOVE_PRESENCE) {
      hasBeenViewed.current = true
      trackEvent('milestone_viewed', { milestone: milestone.place })
    }
  })

  return (
    <Html
      position={spot}
      zIndexRange={layout === 'anchored' ? PANEL_Z_INDEX_RANGE : FITTED_Z_INDEX_RANGE}
      calculatePosition={position}
    >
      <article
        ref={trackCard}
        className={`milestone-panel milestone-panel--${side > 0 ? 'right' : 'left'} milestone-panel--${layout}`}
      >
        <header className="milestone-panel__header">
          <p className="milestone-panel__chapter">
            {milestone.chapter}
            <span className="milestone-panel__divider">|</span>
            {milestone.dates}
          </p>
          <h3 className="milestone-panel__title">{milestone.title}</h3>
          <p className="milestone-panel__place">{milestone.place}</p>
        </header>
        <p className="milestone-panel__summary">{milestone.summary}</p>
        <section className="milestone-panel__section">
          <h4 className="milestone-panel__label">{DEPTHS_COPY.highlightsLabel}</h4>
          <ul className="milestone-panel__highlights">
            {milestone.highlights.map((highlight) => (
              <li key={highlight} className="milestone-panel__highlight">
                {highlight}
              </li>
            ))}
          </ul>
        </section>
        <section className="milestone-panel__section">
          <h4 className="milestone-panel__label">{DEPTHS_COPY.skillsLabel}</h4>
          <ul className="milestone-panel__skills">
            {milestone.skills.map((skill) => (
              <li key={skill} className="milestone-panel__skill">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </Html>
  )
}
