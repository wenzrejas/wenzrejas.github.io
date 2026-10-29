import { useEffect, useRef } from 'react'
import { animated, useTransition } from '@react-spring/web'
import type { AchievementKey } from '@/achievements/constants'
import { audio } from '@/audio/audioManager'
import { ACHIEVEMENT_COPY, ACHIEVEMENT_TOAST_COPY } from '@/data/achievementCopy'
import { finishAnnouncement, useAchievementStore } from '@/store/achievementStore'
import { usePanelStore } from '@/store/panelStore'
import { useRevealStore } from '@/store/revealStore'
import { isMapUnfolded, useViewStore } from '@/store/viewStore'
import {
  ACHIEVEMENT_BADGE_URL,
  TOAST_CLOSE_SPRING,
  TOAST_SHOW_SECONDS,
  TOAST_SLIDE_PIXELS,
  TOAST_SPRING,
} from '../constants'
import './AchievementToast.scss'

const HIDDEN_TOAST = { opacity: 0, y: -TOAST_SLIDE_PIXELS }
const SHOWN_TOAST = { opacity: 1, y: 0 }
const CLOSING_TOAST = { ...HIDDEN_TOAST, config: TOAST_CLOSE_SPRING }

const announcementKey = (achievement: AchievementKey) => achievement

function useIsToastHeld() {
  const isRevealPlaying = useRevealStore((state) => state.activeKey !== null)
  const isPanelOpen = usePanelStore((state) => state.activePanel !== null)
  const isMapOut = useViewStore(isMapUnfolded)
  return isRevealPlaying || isPanelOpen || isMapOut
}

export default function AchievementToast() {
  const announcement = useAchievementStore((state) => state.announcements[0] ?? null)
  const isHeld = useIsToastHeld()
  const shown = isHeld ? null : announcement
  const lastShown = useRef<AchievementKey | null>(null)

  useEffect(() => {
    if (!shown) return
    lastShown.current = shown
    audio.play('achievementPop')
    const showing = window.setTimeout(finishAnnouncement, TOAST_SHOW_SECONDS * 1000)
    return () => window.clearTimeout(showing)
  }, [shown])

  useEffect(() => {
    if (isHeld && announcement !== null && announcement === lastShown.current) finishAnnouncement()
  }, [isHeld, announcement])

  const transitions = useTransition(shown ? [shown] : [], {
    keys: announcementKey,
    from: HIDDEN_TOAST,
    enter: SHOWN_TOAST,
    leave: CLOSING_TOAST,
    config: TOAST_SPRING,
    exitBeforeEnter: true,
  })

  return transitions((motion, achievement) => {
    const { title, description } = ACHIEVEMENT_COPY[achievement]
    return (
      <animated.div className="achievement-toast" style={motion} role="status">
        <img className="achievement-toast__badge" src={ACHIEVEMENT_BADGE_URL} alt="" />
        <div className="achievement-toast__text">
          <span className="achievement-toast__eyebrow">{ACHIEVEMENT_TOAST_COPY.eyebrow}</span>
          <strong className="achievement-toast__title">{title}</strong>
          <span className="achievement-toast__description">{description}</span>
        </div>
      </animated.div>
    )
  })
}
