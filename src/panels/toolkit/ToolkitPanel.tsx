import { TOOLKIT_COPY } from '@/data/panelCopy'
import type { GroveKey } from '@/store/panelStore'
import IslandPanel, { type PanelBodyProps } from '../shared/island-panel/IslandPanel'
import { GROVE_TOOLS, TOOLKIT_PAINTING_URL } from './constants'
import ToolGrid from './ToolGrid'

interface ToolkitPanelProps extends PanelBodyProps {
  grove: GroveKey
}

export default function ToolkitPanel({ grove, motion }: ToolkitPanelProps) {
  const { title, tagline, lead } = TOOLKIT_COPY.groves[grove]

  return (
    <IslandPanel
      title={title}
      subtitle={tagline}
      paintingUrl={TOOLKIT_PAINTING_URL}
      motion={motion}
      intro={<p className="island-panel__lead">{lead}</p>}
      hasFloatingArt
    >
      <section className="island-panel__section">
        <h3 className="island-panel__heading island-panel__heading--ornate">
          {TOOLKIT_COPY.toolsHeading}
        </h3>
        <ToolGrid tools={GROVE_TOOLS[grove]} />
      </section>
    </IslandPanel>
  )
}
