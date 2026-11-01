import { decodeImage } from '@/utils/image'
import { MAP_SCROLL_URL, PANEL_FLAG_URL, PANEL_ROPE_URL } from './islands-panel/constants'
import { ISLAND_ATLAS_URL } from './map-art/constants'

const WORLD_MAP_IMAGES = [ISLAND_ATLAS_URL, PANEL_FLAG_URL, PANEL_ROPE_URL, MAP_SCROLL_URL]

let preloading: Promise<unknown> | null = null

export const preloadWorldMap = () =>
  (preloading ??= Promise.allSettled(WORLD_MAP_IMAGES.map(decodeImage)))
