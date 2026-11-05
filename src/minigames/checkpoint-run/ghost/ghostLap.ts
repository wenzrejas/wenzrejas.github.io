import type { Run } from '../checkpointRun'
import { GHOST_SPLIT_PRECISION, SPLIT_CALL_SECONDS } from '../constants'

export function noteSplit(run: Run) {
  if (run.rival) {
    run.splitGap = run.seconds - run.rival.splits[run.splits.length]
    run.splitSeconds = SPLIT_CALL_SECONDS
  }
  run.splits.push(Math.round(run.seconds * GHOST_SPLIT_PRECISION) / GHOST_SPLIT_PRECISION)
}
