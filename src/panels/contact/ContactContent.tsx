import { CONTACT_COPY } from '@/data/panelCopy'
import SocialLinks from '../shared/social-links/SocialLinks'
import { CONTACT_LINKS } from './constants'
import ContactForm from './ContactForm'

export default function ContactContent() {
  return (
    <>
      <div className="island-panel__beside-splash">
        <p className="island-panel__lead">{CONTACT_COPY.lead}</p>
        <section className="island-panel__section">
          <h3 className="island-panel__heading">{CONTACT_COPY.linksHeading}</h3>
          <SocialLinks links={CONTACT_LINKS} />
        </section>
      </div>
      <section className="island-panel__section">
        <h3 className="island-panel__heading island-panel__heading--ornate">
          {CONTACT_COPY.formHeading}
        </h3>
        <ContactForm />
      </section>
    </>
  )
}
