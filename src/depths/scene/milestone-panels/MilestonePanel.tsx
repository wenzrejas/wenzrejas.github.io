import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { DEPTHS_COPY, type MilestoneCopy } from '@/data/depthsCopy'
import type { WallClock } from '@/utils/time'
import type { Timeline } from '../timeline/timeline'
import { PANEL_Z_INDEX_RANGE } from './constants'
import {
  panelSide,
  panelSpot,
  showPanel,
  stepPanelReveal,
  type PanelReveal,
} from './panelPlacement'
import { keepWheelInside } from './panelWheel'
import './MilestonePanel.scss'

interface MilestonePanelProps {
  level: number
  milestone: MilestoneCopy
  timeline: Timeline
  clock: WallClock
}

export default function MilestonePanel({ level, milestone, timeline, clock }: MilestonePanelProps) {
  const cardRef = useRef<HTMLElement>(null)
  const reveal = useRef<PanelReveal>({ presence: 0 })
  const side = panelSide(level)
  const spot = useMemo(() => panelSpot(level), [level])

  useFrame(() => {
    const card = cardRef.current
    if (!card) return
    stepPanelReveal(reveal.current, timeline, level, clock.delta)
    showPanel(card, side, reveal.current.presence)
  })

  return (
    <Html position={spot} zIndexRange={PANEL_Z_INDEX_RANGE}>
      <article
        ref={cardRef}
        className={`milestone-panel milestone-panel--${side > 0 ? 'right' : 'left'}`}
        onWheel={keepWheelInside}
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
