import { useId } from 'react'
import { DEPTHS_COPY } from '@/data/depthsCopy'
import { ISLAND_COPY } from '@/data/islandCopy'
import { isDepthsScene, leaveDepths, useViewStore } from '@/store/viewStore'
import './DepthsPlaceholder.scss'

export default function DepthsPlaceholder() {
  const isInDepths = useViewStore(isDepthsScene)
  const titleId = useId()

  if (!isInDepths) return null

  return (
    <section className="depths-placeholder" aria-labelledby={titleId}>
      <button type="button" className="depths-placeholder__surface" onClick={leaveDepths}>
        {DEPTHS_COPY.surface}
      </button>
      <p className="depths-placeholder__tag">{ISLAND_COPY.timewell.description}</p>
      <h2 id={titleId} className="depths-placeholder__title">
        {ISLAND_COPY.timewell.label}
      </h2>
    </section>
  )
}
