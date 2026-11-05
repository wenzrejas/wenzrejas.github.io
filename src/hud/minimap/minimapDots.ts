import * as THREE from 'three'
import { nextGateOf } from '@/minigames/checkpoint-run/checkpointRun'
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
import { useShipStore } from '@/store/shipStore'
import { bearingDegrees } from '../north'
import { chartPercent } from './chart'

const _dotPercent = new THREE.Vector2()

export const LANTERN_DOTS = Array.from({ length: LANTERN_AFLOAT_COUNT }, (_, index) => index)

export const BOTTLE_DOTS = ALL_BOTTLES.map((bottle) => {
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

export function placeShip(dot: HTMLElement) {
  const { x, z, heading } = useShipStore.getState()
  chartPercent(x, z, _dotPercent)
  dot.style.left = `${_dotPercent.x}%`
  dot.style.top = `${_dotPercent.y}%`
  dot.style.rotate = `${bearingDegrees(heading)}deg`
}

export function showNearbyBottles(dots: (HTMLSpanElement | null)[]) {
  const { x: shipX, z: shipZ } = useShipStore.getState()
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

export function showUnlitLanterns(dots: (HTMLSpanElement | null)[]) {
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

export function placeNextRing(dot: HTMLElement) {
  const { run } = useCheckpointStore.getState()
  if (!run) {
    placeDot(dot, 0, 0, false)
    return
  }
  const { x, z } = nextGateOf(run)
  placeDot(dot, x, z, true)
}

export function placeGhost(dot: HTMLElement) {
  const { x, z, isShown } = useCheckpointStore.getState().ghostSpot
  placeDot(dot, x, z, isShown)
}
