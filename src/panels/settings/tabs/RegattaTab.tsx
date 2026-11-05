import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import { medalFor } from '@/minigames/checkpoint-run/checkpointRun'
import { COURSE_KEYS } from '@/minigames/checkpoint-run/courses'
import MedalDisc from '@/minigames/checkpoint-run/medal-disc/MedalDisc'
import { useCheckpointStore } from '@/store/checkpointStore'
import '../regatta/Regatta.scss'

const copy = CHECKPOINT_RUN_COPY

export default function RegattaTab() {
  const bests = useCheckpointStore((state) => state.bests)
  const seenCourses = useCheckpointStore((state) => state.seenCourses)

  return (
    <ul className="regatta">
      {COURSE_KEYS.map((course) => {
        const best = bests[course]
        const medal = medalFor(course, best)
        const isFound = best !== undefined || seenCourses.includes(course)
        return (
          <li key={course} className="regatta__course">
            <MedalDisc medal={medal} label={copy.results.medalName(medal)} />
            <span className="regatta__name">
              {isFound ? copy.courses[course] : copy.records.undiscovered}
            </span>
            {best === undefined ? (
              <span className="regatta__not-raced">{copy.records.notRaced}</span>
            ) : (
              <span className="regatta__time">{copy.time(best)}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
