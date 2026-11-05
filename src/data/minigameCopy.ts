import type { Medal } from '@/minigames/checkpoint-run/checkpointRun'
import type { CourseKey } from '@/minigames/checkpoint-run/courses'

const raceTime = (seconds: number) => {
  const tenths = Math.round(seconds * 10)
  const minutes = Math.floor(tenths / 600)
  const rest = ((tenths - minutes * 600) / 10).toFixed(1).padStart(4, '0')
  return `${minutes}:${rest}`
}

const MEDAL_NAMES: Record<Medal, string> = {
  gold: 'Gold medal',
  silver: 'Silver medal',
  bronze: 'Bronze medal',
}

// ── Checkpoint runs ───────────────────────────────────────────────────────────
export const CHECKPOINT_RUN_COPY = {
  eyebrow: 'Regatta',
  courses: {
    openSeaSprint: 'Open Sea Sprint',
    islandHop: 'Island Hop',
    grandRegatta: 'Grand Regatta',
  } satisfies Record<CourseKey, string>,
  time: raceTime,
  startHint: 'Regatta',
  startBest: (seconds: number) => `Regatta · Best ${raceTime(seconds)}`,
  prompt: {
    details: (rings: number, goldSeconds: number) =>
      `${rings} rings · Gold ${raceTime(goldSeconds)}`,
    best: (seconds: number) => `Best ${raceTime(seconds)}`,
    start: 'Start',
  },
  hud: {
    ready: 'Ready',
    go: 'Go!',
    perfect: (boost: number) => `Perfect! +${boost}%`,
    ring: (passed: number, total: number) => `Ring ${passed} / ${total}`,
    finish: 'Finish',
    abandon: 'Abandon',
    abandonKey: 'Esc',
    restart: 'Restart',
    restartKey: 'R',
    split: (gap: number) => `${gap < 0 ? '−' : '+'}${Math.abs(gap).toFixed(1)}`,
  },
  results: {
    time: 'Time',
    best: 'Best',
    newBest: 'New best!',
    perfect: 'Perfect',
    perfects: (count: number, total: number) => `${count} / ${total}`,
    medalName: (medal: Medal | null) => (medal ? MEDAL_NAMES[medal] : 'No medal this time'),
    raceAgain: 'Race again',
  },
  records: {
    undiscovered: '???',
    notRaced: 'Not raced yet',
  },
}
