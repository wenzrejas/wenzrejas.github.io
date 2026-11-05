import type { ReactNode } from 'react'
import Coast from '@/world/shore/Coast'
import type { CoastFields } from '@/world/shore/shoreField'
import type { IslandKey } from './constants'
import type { IslandModel } from './islandModel'
import type { ContactBlob, IslandModelTuning } from './islandSpec'
import type { IslandPlacement } from './islandTransform'
import IslandShadow from './IslandShadow'

interface IslandFrameProps {
  islandKey: IslandKey
  radius: number
  tuning: IslandModelTuning
  island: IslandModel
  placement: IslandPlacement
  coast: CoastFields | null
  blob?: ContactBlob
  children?: ReactNode
}

export default function IslandFrame({
  islandKey,
  radius,
  tuning,
  island,
  placement,
  coast,
  blob,
  children,
}: IslandFrameProps) {
  return (
    <>
      {blob && <IslandShadow radius={radius} tuning={tuning} blob={blob} />}
      <group {...placement}>
        <primitive object={island.model} />
        {coast && (
          <Coast
            islandKey={islandKey}
            fields={coast}
            islandScale={placement.scale}
            offsetY={tuning.offsetY}
          />
        )}
        {children}
      </group>
    </>
  )
}
