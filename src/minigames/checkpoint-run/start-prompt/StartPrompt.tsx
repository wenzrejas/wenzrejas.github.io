import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import { acceptPrompt, closePrompt, useCheckpointStore } from '@/store/checkpointStore'
import { medalFor } from '../checkpointRun'
import { COURSES } from '../courses'
import MedalDisc from '../medal-disc/MedalDisc'
import RaceCard from '../race-card/RaceCard'
import { useCardTransition } from '../race-card/useCardTransition'
import { useCardKeys } from '../useCardKeys'
import './StartPrompt.scss'

const copy = CHECKPOINT_RUN_COPY.prompt

export default function StartPrompt() {
  const prompt = useCheckpointStore((state) => state.prompt)
  const bests = useCheckpointStore((state) => state.bests)
  const transitions = useCardTransition(prompt)

  useCardKeys(prompt !== null, acceptPrompt, closePrompt)

  return transitions((motion, course) => {
    const { rings, goldSeconds } = COURSES[course]
    const best = bests[course]
    const medal = medalFor(course, best)
    return (
      <RaceCard
        motion={motion}
        className="start-prompt"
        course={course}
        actionLabel={copy.start}
        onAction={acceptPrompt}
        onClose={closePrompt}
      >
        <p className="start-prompt__details">{copy.details(rings.length, goldSeconds)}</p>
        {best !== undefined && (
          <div className="race-card__medal-row race-card__medal-row--small">
            {medal && (
              <MedalDisc medal={medal} label={CHECKPOINT_RUN_COPY.results.medalName(medal)} />
            )}
            <span className="race-card__medal-name start-prompt__best-time">{copy.best(best)}</span>
          </div>
        )}
      </RaceCard>
    )
  })
}
