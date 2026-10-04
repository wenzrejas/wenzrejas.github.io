import { CONTACT_COPY } from '@/data/panelCopy'
import IslandPanel, { type PanelBodyProps } from '../shared/island-panel/IslandPanel'
import { CONTACT_PAINTING_URL } from './constants'
import ContactForm from './ContactForm'
import SocialLinks from './SocialLinks'

export default function ContactPanel({ motion }: PanelBodyProps) {
  return (
    <IslandPanel
      island="lumina"
      paintingUrl={CONTACT_PAINTING_URL}
      motion={motion}
      intro={
        <>
          <p className="island-panel__lead">{CONTACT_COPY.lead}</p>
          <section className="island-panel__section">
            <h3 className="island-panel__heading">{CONTACT_COPY.linksHeading}</h3>
            <SocialLinks />
          </section>
        </>
      }
    >
      <section className="island-panel__section">
        <h3 className="island-panel__heading island-panel__heading--ornate">
          {CONTACT_COPY.formHeading}
        </h3>
        <ContactForm />
      </section>
    </IslandPanel>
  )
}
