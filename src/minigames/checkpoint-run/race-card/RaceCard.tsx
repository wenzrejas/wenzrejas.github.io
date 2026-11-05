import type { ReactNode } from 'react'
import { animated, type SpringValues } from '@react-spring/web'
import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import { PANEL_COPY } from '@/data/panelCopy'
import Cartouche from '@/panels/shared/cartouche/Cartouche'
import CloseButton from '@/panels/shared/close-button/CloseButton'
import type { CourseKey } from '../courses'
import './RaceCard.scss'

interface RaceCardProps {
  motion: SpringValues<{ opacity: number; y: number }>
  className: string
  course: CourseKey
  actionLabel: string
  onAction: () => void
  onClose: () => void
  children: ReactNode
}

export default function RaceCard({
  motion,
  className,
  course,
  actionLabel,
  onAction,
  onClose,
  children,
}: RaceCardProps) {
  return (
    <animated.section className={`race-card ${className}`} style={motion} aria-live="polite">
      <CloseButton className="race-card__close" label={PANEL_COPY.close} onClose={onClose} />
      <span className="race-card__eyebrow">{CHECKPOINT_RUN_COPY.eyebrow}</span>
      <h2 className="race-card__course">{CHECKPOINT_RUN_COPY.courses[course]}</h2>
      {children}
      <div className="race-card__actions">
        <button type="button" className="race-card__action" onClick={onAction}>
          <Cartouche />
          <span className="race-card__action-label">{actionLabel}</span>
        </button>
      </div>
    </animated.section>
  )
}
