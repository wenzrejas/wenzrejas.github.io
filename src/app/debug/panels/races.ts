import { button, useControls } from 'leva'
import { buoyOf } from '@/minigames/checkpoint-run/checkpointRun'
import { COURSE_KEYS, type CourseKey } from '@/minigames/checkpoint-run/courses'
import { startRun } from '@/store/checkpointStore'
import { placeShip } from '@/store/shipStore'

const SAIL_UP_FROM = 200

function sailUpTo(course: CourseKey) {
  const { x, z } = buoyOf(course)
  placeShip(x, z + SAIL_UP_FROM, Math.PI)
}

const COURSE_BUTTONS = Object.fromEntries(
  COURSE_KEYS.flatMap((course) => [
    [`sail up to ${course}`, button(() => sailUpTo(course))],
    [`race ${course}`, button(() => startRun(course))],
  ])
)

export function useRaceControls() {
  useControls('Regatta', COURSE_BUTTONS, { collapsed: true })
}
