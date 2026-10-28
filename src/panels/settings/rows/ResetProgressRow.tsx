import { useState } from 'react'
import { SETTINGS_COPY } from '@/data/settingsCopy'
import { forgetProgress } from '@/store/visitorMemory'

const { world } = SETTINGS_COPY

function resetAndReload() {
  forgetProgress()
  window.location.reload()
}

export default function ResetProgressRow() {
  const [isConfirming, setConfirming] = useState(false)

  return (
    <div className="settings__row">
      <span className="settings__label">{world.progress}</span>
      <div className="settings__choices">
        {isConfirming ? (
          <>
            <button
              type="button"
              className="settings__choice settings__choice--warning"
              onClick={resetAndReload}
            >
              {world.confirmReset}
            </button>
            <button type="button" className="settings__choice" onClick={() => setConfirming(false)}>
              {world.cancelReset}
            </button>
          </>
        ) : (
          <button type="button" className="settings__choice" onClick={() => setConfirming(true)}>
            {world.resetProgress}
          </button>
        )}
      </div>
    </div>
  )
}
