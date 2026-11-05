import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MINIMAP_COPY } from '@/data/hudCopy'
import { buoyOf } from '@/minigames/checkpoint-run/checkpointRun'
import { useCheckpointStore } from '@/store/checkpointStore'
import { useCoastStore } from '@/store/coastStore'
import { loopAnimationFrames } from '@/utils/time'
import { chartIslands, chartPercent } from './chart'
import {
  BOTTLE_DOTS,
  LANTERN_DOTS,
  placeGhost,
  placeNextRing,
  placeShip,
  showNearbyBottles,
  showUnlitLanterns,
} from './minimapDots'
import './Minimap.scss'

function CourseFlags() {
  const seenCourses = useCheckpointStore((state) => state.seenCourses)
  return seenCourses.map((course) => {
    const buoy = buoyOf(course)
    const spot = chartPercent(buoy.x, buoy.z, new THREE.Vector2())
    return (
      <span
        key={course}
        className="minimap__course"
        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      />
    )
  })
}

export default function Minimap() {
  const shipRef = useRef<HTMLSpanElement>(null)
  const nextRingRef = useRef<HTMLSpanElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
  const bottleDotsRef = useRef<(HTMLSpanElement | null)[]>([])
  const lanternDotsRef = useRef<(HTMLSpanElement | null)[]>([])
  const coastlines = useCoastStore((state) => state.coastlines)
  const islands = useMemo(() => chartIslands(coastlines), [coastlines])

  useEffect(() => {
    const ship = shipRef.current
    const nextRing = nextRingRef.current
    const ghost = ghostRef.current
    if (!ship || !nextRing || !ghost) return

    return loopAnimationFrames(() => {
      placeShip(ship)
      showNearbyBottles(bottleDotsRef.current)
      showUnlitLanterns(lanternDotsRef.current)
      placeNextRing(nextRing)
      placeGhost(ghost)
    })
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
        {LANTERN_DOTS.map((index) => (
          <span
            key={index}
            className="minimap__lantern"
            ref={(dot) => {
              lanternDotsRef.current[index] = dot
            }}
          />
        ))}
        <CourseFlags />
        <span className="minimap__next-ring" ref={nextRingRef} />
        <span className="minimap__ghost" ref={ghostRef} />
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
