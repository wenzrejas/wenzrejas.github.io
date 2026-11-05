import CourseBuoys from './CourseBuoys'
import CourseRings from './CourseRings'
import RaceGhost from './ghost/RaceGhost'
import RaceEffects from './RaceEffects'
import { useCheckpointRun } from './useCheckpointRun'

export default function CheckpointRuns() {
  useCheckpointRun()

  return (
    <>
      <CourseBuoys />
      <CourseRings />
      <RaceEffects />
      <RaceGhost />
    </>
  )
}
