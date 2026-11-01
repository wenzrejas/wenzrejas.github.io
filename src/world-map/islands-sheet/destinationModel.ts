import { MathUtils } from 'three'
import type { IslandKey } from '@/world/islands/shared/constants'
import { thumbnailStyle } from '../map-art/mapArtModel'
import {
  DESTINATION_TEXT_ROOM,
  DESTINATION_THUMBNAIL_HEIGHT_SHARE,
  DESTINATION_THUMBNAIL_MAX_WIDTH,
  DESTINATION_THUMBNAIL_MIN_WIDTH,
} from './constants'

export function destinationThumbnailStyle(island: IslandKey, cardWidth: number) {
  const width = MathUtils.clamp(
    cardWidth - DESTINATION_TEXT_ROOM,
    DESTINATION_THUMBNAIL_MIN_WIDTH,
    DESTINATION_THUMBNAIL_MAX_WIDTH
  )
  return thumbnailStyle(island, width, width * DESTINATION_THUMBNAIL_HEIGHT_SHARE)
}
