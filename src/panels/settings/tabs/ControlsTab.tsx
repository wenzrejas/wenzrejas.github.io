import { SETTINGS_COPY } from '@/data/settingsCopy'
import KeyText from '@/panels/shared/key-cap/KeyText'
import { SAILING_CHOICES } from '../constants'
import SettingChoiceRow from '../rows/SettingChoiceRow'

const { controls } = SETTINGS_COPY

export default function ControlsTab() {
  return (
    <>
      <SettingChoiceRow
        label={controls.sailingSpeed}
        setting="sailingSpeed"
        choices={SAILING_CHOICES}
        names={controls.sailingChoices}
      />
      <dl>
        {controls.hints.map(({ keys, action }) => (
          <div key={action} className="settings__row">
            <dt className="settings__label">{action}</dt>
            <dd className="settings__keys">
              <KeyText text={keys} />
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
