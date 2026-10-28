import { SETTINGS_COPY } from '@/data/settingsCopy'

const { about } = SETTINGS_COPY
const CREDITED_GROUPS = about.credits.filter(({ names }) => names.length > 0)

export default function AboutTab() {
  return (
    <>
      <p className="settings__about">{about.description}</p>
      <dl>
        {CREDITED_GROUPS.map(({ heading, names }) => (
          <div key={heading} className="settings__row settings__credit">
            <dt className="settings__label">{heading}</dt>
            <dd className="settings__credit-names">{names.join(about.nameSeparator)}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}
