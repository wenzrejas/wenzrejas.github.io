import { WORLD_LOCATIONS, type IslandKey } from './constants'
import './IslandPanel.scss'

interface IslandPanelProps {
  selectedKey: IslandKey | null
  onClose: () => void
}

export default function IslandPanel({ selectedKey, onClose }: IslandPanelProps) {
  const island = selectedKey ? WORLD_LOCATIONS[selectedKey] : null

  return (
    <aside className={`island-panel${selectedKey ? ' island-panel--open' : ''}`}>
      <div className="island-panel__inner">
        <button className="island-panel__close" onClick={onClose} aria-label="Close panel">
          ✕
        </button>

        {island && (
          <>
            <div className="island-panel__header">
              <span
                className="island-panel__tag"
                style={{ color: island.color, borderColor: island.color }}
              >
                {island.description}
              </span>
              <h2 className="island-panel__title">{island.label}</h2>
            </div>

            <div className="island-panel__divider" style={{ background: island.color }} />

            <div className="island-panel__body">
              <p className="island-panel__placeholder">Content coming soon.</p>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
