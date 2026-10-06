import { LOADING_COPY } from '@/data/loadingCopy'
import {
  BLEED_SECONDS,
  MESSAGE_READ_SECONDS,
  SET_SAIL_DELAY_SECONDS,
  STAGE_START_PERCENTS,
  WORD_SECONDS,
  WRITE_DELAY_SECONDS,
} from './constants'

export const MESSAGES = [...LOADING_COPY.stages, LOADING_COPY.arrived]
export const ARRIVED_MESSAGE = MESSAGES.length - 1

const LAST_STAGE = STAGE_START_PERCENTS.length - 1

const stageStart = (stage: number) => STAGE_START_PERCENTS[stage] / 100
const stageEnd = (stage: number) => (stage < LAST_STAGE ? stageStart(stage + 1) : 1)

const stageAt = (share: number) =>
  STAGE_START_PERCENTS.filter((_, stage) => share >= stageStart(stage)).length - 1

export const messageAt = (share: number) => (share >= 1 ? ARRIVED_MESSAGE : stageAt(share))

export const messageWords = (message: number) => MESSAGES[message].split(' ')

const writeSeconds = (message: number) =>
  (messageWords(message).length - 1) * WORD_SECONDS + BLEED_SECONDS

export const writeDelaySeconds = (isReplacing: boolean) => (isReplacing ? WRITE_DELAY_SECONDS : 0)

export function holdSeconds(message: number, isReplacing: boolean) {
  const pause = message === ARRIVED_MESSAGE ? SET_SAIL_DELAY_SECONDS : MESSAGE_READ_SECONDS
  return writeDelaySeconds(isReplacing) + writeSeconds(message) + pause
}

export function stagePace(share: number) {
  const stage = stageAt(share)
  return (stageEnd(stage) - stageStart(stage)) / holdSeconds(stage, stage > 0)
}

export const progressCeiling = (shown: number, isSettled: boolean) =>
  isSettled ? 1 : stageEnd(Math.min(shown, LAST_STAGE))
