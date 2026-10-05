import { create } from 'zustand'
import type { CoastCollision } from '../world/shore/coastCollision'
import type { Coastline } from '../world/shore/coastline'

interface CoastState {
  collisions: CoastCollision[]
  coastlines: Coastline[]
}

export const useCoastStore = create<CoastState>(() => ({
  collisions: [],
  coastlines: [],
}))
