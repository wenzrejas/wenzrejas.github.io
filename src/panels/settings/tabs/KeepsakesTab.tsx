import { ACHIEVEMENTS_TAB_COPY } from '@/data/achievementCopy'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import {
  ALL_BOTTLES,
  COLLECTED_BOTTLES,
  collectedCount,
  hasLastBottleWashedUp,
} from '@/minigames/message-in-a-bottle/bottleSpots'
import { useBottlesInSettings } from '@/store/bottleStore'
import BottleRow from '../keepsakes/BottleRow'
import '../keepsakes/Keepsakes.scss'

const copy = SETTINGS_COPY.keepsakes

export default function KeepsakesTab() {
  const found = useBottlesInSettings()
  const isLastOut = hasLastBottleWashedUp(found)
  const shownBottles = isLastOut ? ALL_BOTTLES : COLLECTED_BOTTLES

  return (
    <section className="keepsakes">
      <header className="keepsakes__header">
        <h3 className="keepsakes__heading">{copy.bottles}</h3>
        <span className="keepsakes__tally">
          {ACHIEVEMENTS_TAB_COPY.tally(collectedCount(found), COLLECTED_BOTTLES.length)}
        </span>
      </header>
      <ul className="keepsakes__bottles">
        {shownBottles.map((bottle) => (
          <BottleRow key={bottle} bottle={bottle} isFound={found.includes(bottle)} />
        ))}
      </ul>
    </section>
  )
}
