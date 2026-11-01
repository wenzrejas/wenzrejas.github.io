import { SETTINGS_COPY } from '@/data/settingsCopy'
import KeyText from '@/panels/shared/key-cap/KeyText'
import { useInputStore } from '@/store/inputStore'

const { controls } = SETTINGS_COPY

export default function ControlsTab() {
  const isTouch = useInputStore((state) => state.mode === 'touch')
  const hints = isTouch ? controls.touchHints : controls.hints

  return (
    <dl>
      {hints.map(({ keys, action }) => (
        <div key={action} className="settings__row">
          <dt className="settings__label">{action}</dt>
          <dd className="settings__keys">
            <KeyText text={keys} />
          </dd>
        </div>
      ))}
    </dl>
  )
}
