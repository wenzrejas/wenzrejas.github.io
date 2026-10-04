import { ISLAND_COPY } from '@/data/islandCopy'
import { CONTACT_COPY } from '@/data/panelCopy'
import IslandPanel, { type PanelBodyProps } from '../shared/island-panel/IslandPanel'
import SocialLinks from '../shared/social-links/SocialLinks'
import { CONTACT_LINKS, CONTACT_PAINTING_URL } from './constants'
import ContactForm from './ContactForm'

export default function ContactPanel({ motion }: PanelBodyProps) {
  return (
    <IslandPanel
      title={ISLAND_COPY.lumina.label}
      subtitle={ISLAND_COPY.lumina.description}
      paintingUrl={CONTACT_PAINTING_URL}
      motion={motion}
      intro={
        <>
          <p className="island-panel__lead">{CONTACT_COPY.lead}</p>
          <section className="island-panel__section">
            <h3 className="island-panel__heading">{CONTACT_COPY.linksHeading}</h3>
            <SocialLinks links={CONTACT_LINKS} />
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
