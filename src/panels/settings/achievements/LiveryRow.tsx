import type { CSSProperties } from 'react'
import { unlockingRankOf } from '@/achievements/ranks'
import { ACHIEVEMENTS_TAB_COPY, LIVERY_NAMES, RANK_NAMES } from '@/data/achievementCopy'
import { chooseLivery, useAchievementStore } from '@/store/achievementStore'
import { ORIGINAL_CANVAS, SHIP_LIVERIES, type LiveryKey } from '@/world/ship/constants'
import { LIVERY_CHOICES } from '../constants'

const copy = ACHIEVEMENTS_TAB_COPY

function swatchStyle(livery: LiveryKey) {
  const { cloth, accent } = SHIP_LIVERIES[livery] ?? ORIGINAL_CANVAS
  return { '--cloth': cloth, '--accent': accent } as CSSProperties
}

export default function LiveryRow({ earnedCount }: { earnedCount: number }) {
  const chosen = useAchievementStore((state) => state.livery)

  return (
    <div className="settings__row achievements__livery-row">
      <span className="settings__label">{copy.liveries}</span>
      <div className="achievements__liveries" role="group" aria-label={copy.liveries}>
        {LIVERY_CHOICES.map((livery) => {
          const unlockingRank = unlockingRankOf(livery)
          const isLocked = unlockingRank.earned > earnedCount
          return (
            <button
              key={livery}
              type="button"
              className="achievements__livery"
              aria-pressed={livery === chosen}
              disabled={isLocked}
              title={isLocked ? copy.lockedLivery(RANK_NAMES[unlockingRank.rank]) : undefined}
              onClick={() => livery !== chosen && chooseLivery(livery)}
            >
              <span className="achievements__swatch" style={swatchStyle(livery)} />
              <span>{LIVERY_NAMES[livery]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
