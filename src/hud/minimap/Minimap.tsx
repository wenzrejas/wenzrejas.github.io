import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MINIMAP_COPY } from '@/data/hudCopy'
import {
  ALL_BOTTLES,
  BOTTLE_SPOTS,
  isBottleAfloat,
  LAST_BOTTLE,
} from '@/minigames/message-in-a-bottle/bottleSpots'
import { BOTTLE_CHART_REACH } from '@/minigames/message-in-a-bottle/constants'
import { useBottleStore } from '@/store/bottleStore'
import { useCoastStore } from '@/store/coastStore'
import { useShipStore } from '@/store/shipStore'
import { bearingDegrees } from '../north'
import { chartIslands, chartPercent } from './chart'
import './Minimap.scss'

const _shipPercent = new THREE.Vector2()

const BOTTLE_DOTS = ALL_BOTTLES.map((bottle) => {
  const { x, z } = BOTTLE_SPOTS[bottle]
  const { x: left, y: top } = chartPercent(x, z, new THREE.Vector2())
  return { bottle, style: { left: `${left}%`, top: `${top}%` } }
})

function showNearbyBottles(dots: (HTMLSpanElement | null)[], shipX: number, shipZ: number) {
  const { found } = useBottleStore.getState()
  ALL_BOTTLES.forEach((bottle, index) => {
    const dot = dots[index]
    if (!dot) return
    const { x, z } = BOTTLE_SPOTS[bottle]
    const isInReach =
      bottle === LAST_BOTTLE || Math.hypot(x - shipX, z - shipZ) < BOTTLE_CHART_REACH
    dot.style.visibility = isInReach && isBottleAfloat(bottle, found) ? 'visible' : 'hidden'
  })
}

export default function Minimap() {
  const shipRef = useRef<HTMLSpanElement>(null)
  const bottleDotsRef = useRef<(HTMLSpanElement | null)[]>([])
  const coastlines = useCoastStore((state) => state.coastlines)
  const islands = useMemo(() => chartIslands(coastlines), [coastlines])

  useEffect(() => {
    const ship = shipRef.current
    if (!ship) return

    let frame = 0
    const tick = () => {
      const { x, z, heading } = useShipStore.getState()
      chartPercent(x, z, _shipPercent)
      ship.style.left = `${_shipPercent.x}%`
      ship.style.top = `${_shipPercent.y}%`
      ship.style.rotate = `${bearingDegrees(heading)}deg`
      showNearbyBottles(bottleDotsRef.current, x, z)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="minimap">
      <div className="minimap__chart">
        <svg className="minimap__islands" viewBox="0 0 100 100">
          {islands.map(({ key, path }) => (
            <path key={key} className="minimap__land" d={path} />
          ))}
        </svg>
        {BOTTLE_DOTS.map(({ bottle, style }, index) => (
          <span
            key={bottle}
            className="minimap__bottle"
            style={style}
            ref={(dot) => {
              bottleDotsRef.current[index] = dot
            }}
          />
        ))}
        <span className="minimap__ship" ref={shipRef} />
      </div>
      <span className="minimap__tick minimap__tick--east" />
      <span className="minimap__tick minimap__tick--south" />
      <span className="minimap__tick minimap__tick--west" />
      <span className="minimap__needle" />
      <span className="minimap__north">{MINIMAP_COPY.north}</span>
    </div>
  )
}
