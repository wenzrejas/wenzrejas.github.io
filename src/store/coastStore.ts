import { create } from 'zustand'
import type { CoastCollision } from '../world/shore/coastCollision'
import type { Coastline } from '../world/shore/coastline'
import type { Waterline } from '../world/shore/shoreField'

interface CoastState {
  collisions: CoastCollision[]
  coastlines: Coastline[]
  waterlines: Waterline[]
}

export const useCoastStore = create<CoastState>(() => ({
  collisions: [],
  coastlines: [],
  waterlines: [],
}))
