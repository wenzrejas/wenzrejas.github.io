import type { CSSProperties } from 'react'
import { ACHIEVEMENT_KEYS } from '@/achievements/constants'
import { nextRankOf, rankOf } from '@/achievements/ranks'
import { ACHIEVEMENTS_TAB_COPY, RANK_NAMES } from '@/data/achievementCopy'

const copy = ACHIEVEMENTS_TAB_COPY

export default function RankHeader({ earnedCount }: { earnedCount: number }) {
  const rank = rankOf(earnedCount)
  const nextRank = nextRankOf(earnedCount)
  const rankShare = nextRank ? (earnedCount - rank.earned) / (nextRank.earned - rank.earned) : 1

  return (
    <header className="achievements__rank">
      <span className="achievements__eyebrow">{copy.rank}</span>
      <span className="achievements__tally">
        {copy.tally(earnedCount, ACHIEVEMENT_KEYS.length)}
      </span>
      <strong className="achievements__rank-name">{RANK_NAMES[rank.rank]}</strong>
      <span
        className="achievements__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={ACHIEVEMENT_KEYS.length}
        aria-valuenow={earnedCount}
        style={{ '--rank-share': rankShare } as CSSProperties}
      />
      <span className="achievements__next-rank">
        {nextRank
          ? copy.nextRank(nextRank.earned - earnedCount, RANK_NAMES[nextRank.rank])
          : copy.topRank}
      </span>
    </header>
  )
}
