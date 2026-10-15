import { SUPPORT_COPY } from '@/data/panelCopy'
import SocialLinks from '../shared/social-links/SocialLinks'
import { SUPPORT_LINKS } from './constants'

export default function SupportContent() {
  return (
    <div className="island-panel__beside-splash">
      <p className="island-panel__lead">{SUPPORT_COPY.lead}</p>
      <section className="island-panel__section">
        <h3 className="island-panel__heading">{SUPPORT_COPY.linksHeading}</h3>
        <SocialLinks links={SUPPORT_LINKS} />
      </section>
    </div>
  )
}
