import type * as THREE from 'three'
import { noteReveal } from '@/achievements/storeEvents'
import { isRaceUnderway } from '@/store/checkpointStore'
import { isCinematicPlaying } from '@/store/cinematicStore'
import { useDebugStore } from '@/store/debugStore'
import { isLoaderShowing } from '@/store/loadingStore'
import { useRevealStore } from '@/store/revealStore'
import { rememberedItems, rememberItem } from '@/store/visitorMemory'
import { isSheetLayout } from '@/utils/layout'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import type { IslandKey } from './constants'
import { ISLAND_KEYS } from './islandSpecs'
import {
  enterReachedIsland,
  islandInReach,
  REVEAL_TOTAL,
  revealBlend,
  revealFocus,
  revealScreenTop,
} from './revealTimeline'
import { sampleGroundFrame } from './viewReach'

const NOT_PLAYING = -1

interface RevealWatch {
  seen: Set<IslandKey>
  isPrimed: boolean
  elapsed: number
}

export const createRevealWatch = (): RevealWatch => ({
  seen: new Set(rememberedItems('revealedIslands', ISLAND_KEYS)),
  isPrimed: false,
  elapsed: NOT_PLAYING,
})

const isPlaying = ({ elapsed }: RevealWatch) => elapsed >= 0

function stopPlaying(watch: RevealWatch) {
  watch.elapsed = NOT_PLAYING
  useRevealStore.setState({ blend: 0, activeKey: null })
}

export function cancelReveal(watch: RevealWatch) {
  if (isPlaying(watch)) stopPlaying(watch)
}

const isWatchPaused = () =>
  useDebugStore.getState().camera.topView ||
  isCinematicPlaying() ||
  isLoaderShowing() ||
  isRaceUnderway()

function startReachedReveal(
  watch: RevealWatch,
  { x, z }: THREE.Vector3,
  camera: THREE.Camera,
  isSkipped: boolean
): boolean {
  if (isWatchPaused()) return false
  sampleGroundFrame(camera)
  const tuning = useDebugStore.getState().islands
  const { nearbyIsland } = useRevealStore.getState()
  const nearby = islandInReach(nearbyIsland, x, z, tuning)
  if (nearby !== nearbyIsland) useRevealStore.setState({ nearbyIsland: nearby })
  const trigger = enterReachedIsland(watch.seen, x, z, tuning, watch.isPrimed)
  watch.isPrimed = true
  if (!trigger) return false

  rememberItem('revealedIslands', trigger.key)
  if (isSkipped) {
    noteReveal(trigger.key)
    return false
  }
  revealFocus(trigger, tuning[trigger.key], useRevealStore.getState().target)
  useRevealStore.setState({
    activeKey: trigger.key,
    islandScreenTop: revealScreenTop(trigger, tuning[trigger.key]),
  })
  watch.elapsed = 0
  return true
}

export function stepRevealWatch(
  watch: RevealWatch,
  shipPosition: THREE.Vector3,
  camera: THREE.Camera,
  delta: number
) {
  const isSkipped = isSheetLayout()
  if (isSkipped && isPlaying(watch)) {
    watch.elapsed = NOT_PLAYING
    useRevealStore.setState({ blend: 0, activeKey: null, islandScreenTop: null })
  }

  if (!isPlaying(watch) && !startReachedReveal(watch, shipPosition, camera, isSkipped)) return

  watch.elapsed += Math.min(delta, MAX_FRAME_SECONDS)
  if (watch.elapsed >= REVEAL_TOTAL) {
    stopPlaying(watch)
    return
  }
  useRevealStore.getState().blend = revealBlend(watch.elapsed)
}
