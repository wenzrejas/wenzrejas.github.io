import type { IslandKey } from '../islands/shared/constants'
import type { CoastFields } from './shoreField'
import CoastCollider from './CoastCollider'
import CoastlineChart from './CoastlineChart'
import Shoreline from './Shoreline'

interface CoastProps {
  islandKey: IslandKey
  fields: CoastFields
  islandScale: number
  offsetY: number
}

export default function Coast({ islandKey, fields, islandScale, offsetY }: CoastProps) {
  return (
    <>
      <Shoreline field={fields.shoreline} islandScale={islandScale} offsetY={offsetY} />
      <CoastCollider islandKey={islandKey} field={fields.collision} islandScale={islandScale} />
      <CoastlineChart islandKey={islandKey} field={fields.shoreline} islandScale={islandScale} />
    </>
  )
}
