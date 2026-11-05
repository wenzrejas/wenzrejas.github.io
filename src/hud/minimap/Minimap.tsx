import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MINIMAP_COPY } from '@/data/hudCopy'
import { buoyOf, nextGateOf } from '@/minigames/checkpoint-run/checkpointRun'
import { LANTERN_AFLOAT_COUNT } from '@/minigames/lantern-night/constants'
import { flock, isWaitingToBeLit } from '@/minigames/lantern-night/lanternFlock'
import {
  ALL_BOTTLES,
  BOTTLE_SPOTS,
  isBottleAfloat,
  LAST_BOTTLE,
} from '@/minigames/message-in-a-bottle/bottleSpots'
import { BOTTLE_CHART_REACH } from '@/minigames/message-in-a-bottle/constants'
import { useBottleStore } from '@/store/bottleStore'
import { isRaceUnderway, useCheckpointStore } from '@/store/checkpointStore'
import { useCoastStore } from '@/store/coastStore'
import { useShipStore } from '@/store/shipStore'
import { bearingDegrees } from '../north'
import { chartIslands, chartPercent } from './chart'
import './Minimap.scss'

const _shipPercent = new THREE.Vector2()
const _dotPercent = new THREE.Vector2()

const LANTERN_DOTS = Array.from({ length: LANTERN_AFLOAT_COUNT }, (_, index) => index)

const BOTTLE_DOTS = ALL_BOTTLES.map((bottle) => {
  const { x, z } = BOTTLE_SPOTS[bottle]
  const { x: left, y: top } = chartPercent(x, z, new THREE.Vector2())
  return { bottle, style: { left: `${left}%`, top: `${top}%` } }
})

function showDot(dot: HTMLElement, isShown: boolean) {
  const visibility = isShown ? 'visible' : 'hidden'
  if (dot.style.visibility !== visibility) dot.style.visibility = visibility
}

function placeDot(dot: HTMLElement, x: number, z: number, isShown: boolean) {
  showDot(dot, isShown)
  if (!isShown) return
  chartPercent(x, z, _dotPercent)
  dot.style.left = `${_dotPercent.x}%`
  dot.style.top = `${_dotPercent.y}%`
}

function showNearbyBottles(dots: (HTMLSpanElement | null)[], shipX: number, shipZ: number) {
  const { found } = useBottleStore.getState()
  const isRacing = isRaceUnderway()
  ALL_BOTTLES.forEach((bottle, index) => {
    const dot = dots[index]
    if (!dot) return
    const { x, z } = BOTTLE_SPOTS[bottle]
    const isInReach =
      bottle === LAST_BOTTLE || Math.hypot(x - shipX, z - shipZ) < BOTTLE_CHART_REACH
    showDot(dot, isInReach && isBottleAfloat(bottle, found) && !isRacing)
  })
}

function showUnlitLanterns(dots: (HTMLSpanElement | null)[]) {
  let shown = 0
  if (!isRaceUnderway()) {
    for (const lantern of flock) {
      if (!isWaitingToBeLit(lantern)) continue
      const dot = dots[shown++]
      if (dot) placeDot(dot, lantern.x, lantern.z, true)
    }
  }
  for (; shown < dots.length; shown++) {
    const dot = dots[shown]
    if (dot) showDot(dot, false)
  }
}

function placeNextRing(dot: HTMLElement) {
  const { run } = useCheckpointStore.getState()
  if (!run) {
    placeDot(dot, 0, 0, false)
    return
  }
  const { x, z } = nextGateOf(run)
  placeDot(dot, x, z, true)
}

function placeGhost(dot: HTMLElement) {
  const { x, z, isShown } = useCheckpointStore.getState().ghostSpot
  placeDot(dot, x, z, isShown)
}

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

    let frame = 0
    const tick = () => {
      const { x, z, heading } = useShipStore.getState()
      chartPercent(x, z, _shipPercent)
      ship.style.left = `${_shipPercent.x}%`
      ship.style.top = `${_shipPercent.y}%`
      ship.style.rotate = `${bearingDegrees(heading)}deg`
      showNearbyBottles(bottleDotsRef.current, x, z)
      showUnlitLanterns(lanternDotsRef.current)
      placeNextRing(nextRing)
      placeGhost(ghost)
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
