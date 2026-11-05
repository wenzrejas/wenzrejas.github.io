import { BOTTLE_LINKS, BOTTLE_NOTES, bottlePanelLabel } from '@/data/bottleCopy'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import {
  BOTTLE_PANELS,
  LAST_BOTTLE,
  type BottleKey,
} from '@/minigames/message-in-a-bottle/bottleSpots'
import { openBottlePanel } from '@/store/bottleStore'
import { isWorldScene, useViewStore } from '@/store/viewStore'

const copy = SETTINGS_COPY.keepsakes

interface BottleRowProps {
  bottle: BottleKey
  isFound: boolean
}

export default function BottleRow({ bottle, isFound }: BottleRowProps) {
  const isInWorld = useViewStore(isWorldScene)

  if (!isFound) {
    return (
      <li className="keepsakes__bottle keepsakes__bottle--afloat">
        {bottle === LAST_BOTTLE ? copy.lastBottleHint : copy.stillAfloat}
      </li>
    )
  }

  const { title, text } = BOTTLE_NOTES[bottle]
  const panel = BOTTLE_PANELS[bottle]
  const link = BOTTLE_LINKS[bottle]

  return (
    <li className="keepsakes__bottle">
      <details>
        <summary className="keepsakes__title">{title}</summary>
        <div className="keepsakes__body">
          <div className="keepsakes__rule" aria-hidden="true" />
          <p className="keepsakes__text">{text}</p>
          {panel && isInWorld && (
            <button
              type="button"
              className="keepsakes__link"
              onClick={() => openBottlePanel(panel)}
            >
              {bottlePanelLabel(panel)}
            </button>
          )}
          {link && (
            <a className="keepsakes__link" href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          )}
        </div>
      </details>
    </li>
  )
}
