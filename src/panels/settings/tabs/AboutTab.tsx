import { Fragment } from 'react'
import { SETTINGS_COPY, type CreditName } from '@/data/settingsCopy'

const { about } = SETTINGS_COPY
const CREDITED_GROUPS = about.credits.filter(({ names }) => names.length > 0)

function Credit({ name }: { name: CreditName }) {
  if (typeof name === 'string') return name
  return (
    <a className="settings__credit-link" href={name.url} target="_blank" rel="noreferrer">
      {name.label}
    </a>
  )
}

export default function AboutTab() {
  return (
    <>
      <p className="settings__about">{about.description}</p>
      <dl>
        {CREDITED_GROUPS.map(({ heading, names }) => (
          <div key={heading} className="settings__row settings__credit">
            <dt className="settings__label">{heading}</dt>
            <dd className="settings__credit-names">
              {names.map((name, index) => (
                <Fragment key={index}>
                  {index > 0 && about.nameSeparator}
                  <Credit name={name} />
                </Fragment>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
