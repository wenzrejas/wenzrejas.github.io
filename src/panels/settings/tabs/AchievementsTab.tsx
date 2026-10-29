import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_KEYS,
  ACHIEVEMENTS,
  CROWNING_ACHIEVEMENT,
} from '@/achievements/constants'
import { ACHIEVEMENTS_TAB_COPY } from '@/data/achievementCopy'
import { useAchievementStore } from '@/store/achievementStore'
import AchievementRow from '../achievements/AchievementRow'
import LiveryRow from '../achievements/LiveryRow'
import RankHeader from '../achievements/RankHeader'
import '../achievements/Achievements.scss'

const copy = ACHIEVEMENTS_TAB_COPY

const CATEGORY_GROUPS = ACHIEVEMENT_CATEGORIES.map((category) => ({
  category,
  achievements: ACHIEVEMENT_KEYS.filter((key) => ACHIEVEMENTS[key].category === category),
}))

export default function AchievementsTab() {
  const earned = useAchievementStore((state) => state.earned)
  const progress = useAchievementStore((state) => state.progress)

  return (
    <>
      <RankHeader earnedCount={earned.length} />
      {earned.includes(CROWNING_ACHIEVEMENT) && (
        <aside className="achievements__note">
          <h3 className="achievements__note-heading">{copy.legendNote.heading}</h3>
          {copy.legendNote.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </aside>
      )}
      <LiveryRow earnedCount={earned.length} />
      {CATEGORY_GROUPS.map(({ category, achievements }) => (
        <section key={category} className="achievements__group">
          <h3 className="achievements__heading">{copy.categories[category]}</h3>
          <ul className="achievements__list">
            {achievements.map((key) => (
              <AchievementRow
                key={key}
                achievement={key}
                isEarned={earned.includes(key)}
                itemsDone={progress[key]?.length ?? 0}
              />
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
