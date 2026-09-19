import type { IslandConfig, IslandKey } from './constants'

export interface IslandBodyProps {
  islandKey: IslandKey
  config: IslandConfig
  hovered: boolean
}
