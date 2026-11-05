import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import { dismissResult, startRun, useCheckpointStore } from '@/store/checkpointStore'
import { COURSES } from '../courses'
import MedalDisc from '../medal-disc/MedalDisc'
import RaceCard from '../race-card/RaceCard'
import { useCardTransition } from '../race-card/useCardTransition'
import { useCardKeys } from '../useCardKeys'
import './RunResults.scss'

const copy = CHECKPOINT_RUN_COPY.results

export default function RunResults() {
  const result = useCheckpointStore((state) => state.result)
  const transitions = useCardTransition(result)

  useCardKeys(
    result !== null,
    () => result && startRun(result.course),
    dismissResult,
    CHECKPOINT_RUN_COPY.hud.restartKey.toLowerCase()
  )

  return transitions((motion, { course, seconds, medal, bestSeconds, isNewBest, perfects }) => (
    <RaceCard
      motion={motion}
      className="run-results"
      course={course}
      actionLabel={copy.raceAgain}
      onAction={() => startRun(course)}
      onClose={dismissResult}
    >
      <div className="race-card__medal-row">
        <MedalDisc medal={medal} label={copy.medalName(medal)} />
        <span className="race-card__medal-name" aria-hidden="true">
          {copy.medalName(medal)}
        </span>
      </div>
      <dl className="run-results__times">
        <div className="run-results__time">
          <dt>{copy.time}</dt>
          <dd>{CHECKPOINT_RUN_COPY.time(seconds)}</dd>
        </div>
        <div className="run-results__time">
          <dt>{copy.best}</dt>
          <dd>
            {CHECKPOINT_RUN_COPY.time(bestSeconds)}
            {isNewBest && <span className="run-results__new-best">{copy.newBest}</span>}
          </dd>
        </div>
        <div className="run-results__time">
          <dt>{copy.perfect}</dt>
          <dd>{copy.perfects(perfects, COURSES[course].rings.length)}</dd>
        </div>
      </dl>
    </RaceCard>
  ))
}
