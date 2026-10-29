import { ACHIEVEMENTS, type AchievementKey } from '@/achievements/constants'
import { ACHIEVEMENT_COPY, ACHIEVEMENTS_TAB_COPY } from '@/data/achievementCopy'

const copy = ACHIEVEMENTS_TAB_COPY

interface AchievementRowProps {
  achievement: AchievementKey
  isEarned: boolean
  itemsDone: number
}

export default function AchievementRow({ achievement, isEarned, itemsDone }: AchievementRowProps) {
  const { isSecret, items } = ACHIEVEMENTS[achievement]
  const { title, description } = isSecret && !isEarned ? copy.secret : ACHIEVEMENT_COPY[achievement]

  return (
    <li
      className={isEarned ? 'achievements__item' : 'achievements__item achievements__item--locked'}
    >
      <span
        className={isEarned ? 'achievements__seal' : 'achievements__seal achievements__seal--blank'}
        role="img"
        aria-label={isEarned ? copy.earned : copy.notEarned}
      />
      <div className="achievements__text">
        <span className="achievements__title">{title}</span>
        <span className="achievements__description">{description}</span>
      </div>
      {items && !isEarned && (
        <span className="achievements__tally">{copy.tally(itemsDone, items.length)}</span>
      )}
    </li>
  )
}
