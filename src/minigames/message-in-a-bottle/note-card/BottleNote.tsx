import { useId, useRef } from 'react'
import { animated, type SpringValues } from '@react-spring/web'
import { BOTTLE_COPY, BOTTLE_LINKS, BOTTLE_NOTES, bottlePanelLabel } from '@/data/bottleCopy'
import { PANEL_COPY } from '@/data/panelCopy'
import Cartouche from '@/panels/shared/cartouche/Cartouche'
import CloseButton from '@/panels/shared/close-button/CloseButton'
import type { SheetMotion } from '@/panels/shared/island-panel/IslandPanel'
import { useCloseOnEscape } from '@/panels/shared/island-panel/useCloseOnEscape'
import { useDialogFocus } from '@/panels/shared/island-panel/useDialogFocus'
import Parchment from '@/panels/shared/parchment/Parchment'
import { openBottlePanel, useBottleStore } from '@/store/bottleStore'
import { closePanel } from '@/store/panelStore'
import { BOTTLE_PANELS, COLLECTED_BOTTLES, collectedCount, LAST_BOTTLE } from '../bottleSpots'
import { BOTTLE_SIGNATURE_URL } from '../constants'
import './BottleNote.scss'

const collectedTotal = COLLECTED_BOTTLES.length

export default function BottleNote({ motion }: { motion: SpringValues<SheetMotion> }) {
  const note = useBottleStore((state) => state.openNote)
  const foundCount = useBottleStore(({ found }) => collectedCount(found))
  const titleId = useId()
  const noteRef = useRef<HTMLElement>(null)
  useCloseOnEscape()
  useDialogFocus(noteRef)

  if (!note) return null
  const { title, text } = BOTTLE_NOTES[note]
  const panel = BOTTLE_PANELS[note]
  const link = BOTTLE_LINKS[note]

  return (
    <aside ref={noteRef} className="bottle-note" role="dialog" aria-labelledby={titleId}>
      <animated.div className="bottle-note__sheet" style={motion}>
        <Parchment shape="loose" />
        <CloseButton className="bottle-note__close" label={PANEL_COPY.close} onClose={closePanel} />
        <div className="bottle-note__content">
          <span className="bottle-note__count">
            {note === LAST_BOTTLE
              ? BOTTLE_COPY.lastBottle
              : BOTTLE_COPY.count(foundCount, collectedTotal)}
          </span>
          <h2 id={titleId} className="bottle-note__title">
            {title}
          </h2>
          <div className="bottle-note__rule" aria-hidden="true" />
          <p className="bottle-note__text">{text}</p>
          <img
            className="bottle-note__signature"
            src={BOTTLE_SIGNATURE_URL}
            alt={BOTTLE_COPY.signature}
          />
          {panel && (
            <button
              type="button"
              className="bottle-note__primary"
              onClick={() => openBottlePanel(panel)}
            >
              <Cartouche />
              <span className="bottle-note__primary-label">{bottlePanelLabel(panel)}</span>
            </button>
          )}
          {link && (
            <a className="bottle-note__primary" href={link.url} target="_blank" rel="noreferrer">
              <Cartouche />
              <span className="bottle-note__primary-label">{link.label}</span>
            </a>
          )}
        </div>
      </animated.div>
    </aside>
  )
}
