import { useMemo } from 'react'
import { openPanel } from '@/store/panelStore'
import { setHovered } from '@/interaction/hover'
import InteractionMarker from '@/interaction/InteractionMarker'
import type { IslandModel } from '@/world/islands/shared/islandModel'
import type { DistanceField } from '@/world/shore/shoreField'
import BeeSigned from './bee-signed/BeeSigned'
import { useChooChooChain } from './choo-choo-chain/useChooChooChain'
import Gelify from './gelify/Gelify'
import { usePaymentsManager } from './payments-manager/usePaymentsManager'
import type { ProjectHovers } from './projectHovers'
import { findProjectSites } from './projectSites'
import Qoves from './qoves/Qoves'
import UIUXWorks from './uiux-works/UIUXWorks'

interface BuildshoreProjectsProps {
  island: IslandModel
  hovers: ProjectHovers
  collision: DistanceField | null
  islandScale: number
}

export default function BuildshoreProjects({
  island,
  hovers,
  collision,
  islandScale,
}: BuildshoreProjectsProps) {
  useChooChooChain(island.model, hovers.chooChooChain)
  usePaymentsManager(island.model, hovers.paymentsManager)
  const sites = useMemo(
    () => (collision ? findProjectSites(island.model, collision) : []),
    [island, collision]
  )

  return (
    <>
      <BeeSigned model={island.model} hover={hovers.beeSigned} islandScale={islandScale} />
      <UIUXWorks model={island.model} hover={hovers.uiuxWorks} islandScale={islandScale} />
      <Gelify model={island.model} hover={hovers.gelify} islandScale={islandScale} />
      <Qoves island={island} hover={hovers.qoves} islandScale={islandScale} />
      {sites.map((site) => (
        <InteractionMarker
          key={site.key}
          position={site.marker}
          label={site.label}
          description={site.description}
          onHover={(isHovered) => setHovered(hovers[site.key], isHovered)}
          onActivate={(markerSpot) => openPanel(site.key, markerSpot)}
          baseGap={site.baseGap}
        />
      ))}
    </>
  )
}
