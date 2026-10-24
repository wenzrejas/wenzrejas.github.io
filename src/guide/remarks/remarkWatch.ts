import type { RemarkKey } from '@/data/guideCopy'
import { MODAL_DIALOGUES } from '../constants'
import {
  MAP_REMARKS,
  ONCE_EVER_REMARKS,
  REMARK_BREATHER_SECONDS,
  REMARK_GAP_SECONDS,
  REMARK_REPEAT_SECONDS,
  REMARK_SHOW_SECONDS,
  REMARK_WAIT_SECONDS,
} from './constants'
import {
  countMoments,
  createMomentCounters,
  noticeMoment,
  restartCounterOf,
  type MomentCounters,
  type RemarkStage,
  type WorldReading,
} from './remarkMoments'

interface WaitingRemark {
  remark: RemarkKey
  since: number
  isFirstTime: boolean
}

interface RemarkWatch {
  previous: WorldReading | null
  lastSeconds: number
  counters: MomentCounters
  waiting: WaitingRemark[]
  shown: RemarkKey | null
  shownSince: number
  remarkedAt: Partial<Record<RemarkKey, number>>
}

export const createRemarkWatch = (
  seconds: number,
  opening: RemarkKey | null,
  heardBefore: RemarkKey[]
): RemarkWatch => ({
  previous: null,
  lastSeconds: seconds,
  counters: createMomentCounters(),
  waiting: opening ? [{ remark: opening, since: seconds, isFirstTime: true }] : [],
  shown: null,
  shownSince: seconds,
  remarkedAt: Object.fromEntries(heardBefore.map((remark) => [remark, -Infinity])),
})

const stageOf = (remark: RemarkKey): RemarkStage => (MAP_REMARKS.includes(remark) ? 'map' : 'world')

function queueMoment(watch: RemarkWatch, moment: RemarkKey, seconds: number) {
  if (watch.waiting.some(({ remark }) => remark === moment)) return
  const remarkedAt = watch.remarkedAt[moment]
  const isFirstTime = remarkedAt === undefined
  if (!isFirstTime && ONCE_EVER_REMARKS.includes(moment)) return
  if (isFirstTime || seconds - remarkedAt >= REMARK_REPEAT_SECONDS)
    watch.waiting.push({ remark: moment, since: seconds, isFirstTime })
}

function isReady({ isFirstTime }: WaitingRemark, watch: RemarkWatch, seconds: number) {
  const quietSeconds = seconds - watch.shownSince
  if (!isFirstTime) return quietSeconds >= REMARK_GAP_SECONDS
  return watch.shown === null || quietSeconds >= REMARK_BREATHER_SECONDS
}

function takeRemark(
  watch: RemarkWatch,
  seconds: number,
  isAllowed: (waiting: WaitingRemark) => boolean
) {
  const allowed = watch.waiting.filter(isAllowed)
  const next = allowed.find(({ isFirstTime }) => isFirstTime) ?? allowed[0]
  if (!next) return null
  watch.waiting.splice(watch.waiting.indexOf(next), 1)
  watch.shown = next.remark
  watch.shownSince = seconds
  watch.remarkedAt[next.remark] = seconds
  return next.remark
}

function watchWorld(watch: RemarkWatch, world: WorldReading, seconds: number, stage: RemarkStage) {
  const { previous, counters, lastSeconds } = watch
  watch.previous = world
  watch.lastSeconds = seconds
  if (!previous) return null
  const counted = countMoments(counters, previous, world, seconds - lastSeconds, stage)
  const moment = noticeMoment(previous, world, counters, counted)
  watch.counters = moment ? restartCounterOf(moment, counted) : counted
  return moment
}

type RemarkStep = RemarkKey | 'close' | 'dismiss' | null

export function stepRemarks(
  watch: RemarkWatch,
  world: WorldReading,
  seconds: number,
  dialogue: string | null,
  stage: RemarkStage
): RemarkStep {
  const moment = watchWorld(watch, world, seconds, stage)
  if (moment) queueMoment(watch, moment, seconds)
  watch.waiting = watch.waiting.filter(({ since }) => seconds - since <= REMARK_WAIT_SECONDS)
  const fitsStage = ({ remark }: WaitingRemark) => stageOf(remark) === stage

  if (dialogue !== null && dialogue === watch.shown) {
    const isCoveredByMap = stageOf(watch.shown) === 'world' && world.isMapUnfolded
    if (isCoveredByMap) return 'dismiss'
    if (stageOf(watch.shown) !== stage) return 'close'
    if (MODAL_DIALOGUES.includes(watch.shown)) return null
    if (seconds - watch.shownSince < REMARK_SHOW_SECONDS) return null
    const next = takeRemark(watch, seconds, (waiting) => waiting.isFirstTime && fitsStage(waiting))
    return next ?? 'close'
  }
  if (dialogue !== null || stage === 'none') return null
  return takeRemark(
    watch,
    seconds,
    (waiting) => fitsStage(waiting) && isReady(waiting, watch, seconds)
  )
}
