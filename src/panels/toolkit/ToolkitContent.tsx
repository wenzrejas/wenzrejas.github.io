import { TOOLKIT_COPY } from '@/data/panelCopy'
import type { GroveKey } from '@/store/panelStore'
import { GROVE_TOOLS } from './constants'
import ToolGrid from './ToolGrid'

interface ToolkitContentProps {
  grove: GroveKey
}

export default function ToolkitContent({ grove }: ToolkitContentProps) {
  return (
    <>
      <div className="island-panel__beside-splash">
        <p className="island-panel__lead">{TOOLKIT_COPY.groves[grove].lead}</p>
      </div>
      <section className="island-panel__section">
        <h3 className="island-panel__heading island-panel__heading--ornate">
          {TOOLKIT_COPY.toolsHeading}
        </h3>
        <ToolGrid tools={GROVE_TOOLS[grove]} />
      </section>
    </>
  )
}
