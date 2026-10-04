import { ISLAND_COPY } from '@/data/islandCopy'
import { SUPPORT_COPY } from '@/data/panelCopy'
import IslandPanel, { type PanelBodyProps } from '../shared/island-panel/IslandPanel'
import SocialLinks from '../shared/social-links/SocialLinks'
import { SUPPORT_LINKS, SUPPORT_PAINTING_URL } from './constants'

export default function SupportPanel({ motion }: PanelBodyProps) {
  return (
    <IslandPanel
      title={ISLAND_COPY.cozy.label}
      subtitle={ISLAND_COPY.cozy.description}
      paintingUrl={SUPPORT_PAINTING_URL}
      motion={motion}
      intro={
        <>
          <p className="island-panel__lead">{SUPPORT_COPY.lead}</p>
          <section className="island-panel__section">
            <h3 className="island-panel__heading">{SUPPORT_COPY.linksHeading}</h3>
            <SocialLinks links={SUPPORT_LINKS} />
          </section>
        </>
      }
    />
  )
}
