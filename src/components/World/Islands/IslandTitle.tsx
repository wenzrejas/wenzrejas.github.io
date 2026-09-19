import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { REVEAL_TITLE_IN, WORLD_LOCATIONS } from './constants'
import { useRevealStore } from '../../../store/revealStore'
import { useDebugStore } from '../../../store/debugStore'
import './IslandTitle.scss'

export default function IslandTitle() {
  const activeKey = useRevealStore((s) => s.activeKey)
  const previewCard = useDebugStore((s) => s.reveal.previewCard)
  const cardRef = useRef<HTMLDivElement>(null)

  const pinned = previewCard !== 'off'
  const key = pinned ? previewCard : activeKey

  useEffect(() => {
    const card = cardRef.current
    if (!key || !card) return

    if (pinned) {
      card.style.opacity = '1'
      card.style.transform = 'none'
      return
    }

    let frame = 0
    const tick = () => {
      const t = THREE.MathUtils.smoothstep(useRevealStore.getState().blend, REVEAL_TITLE_IN, 1)
      card.style.opacity = String(t)
      card.style.transform = `translateY(${(1 - t) * 16}px)`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [key, pinned])

  if (!key) return null
  const island = WORLD_LOCATIONS[key]

  return (
    <div
      className="island-title"
      ref={cardRef}
      style={{ '--island-color': island.color } as React.CSSProperties}
    >
      <span className="island-title__tag">{island.description}</span>
      <h2 className="island-title__name">{island.label}</h2>
    </div>
  )
}
