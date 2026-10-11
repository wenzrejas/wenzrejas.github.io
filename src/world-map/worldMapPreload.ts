import { decodeImage } from '@/utils/image'
import { CLOSE_BUTTON_URL, MAP_SCROLL_URL, SHEET_URL } from './islands-panel/constants'
import { ISLAND_ATLAS_URL } from './map-art/constants'

const WORLD_MAP_IMAGES = [ISLAND_ATLAS_URL, SHEET_URL, CLOSE_BUTTON_URL, MAP_SCROLL_URL]

let preloading: Promise<unknown> | null = null

export const preloadWorldMap = () =>
  (preloading ??= Promise.allSettled(WORLD_MAP_IMAGES.map(decodeImage)))
