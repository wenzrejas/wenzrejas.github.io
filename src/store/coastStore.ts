import { create } from 'zustand'
import type { CoastCollision } from '../world/shore/coastCollision'

interface CoastState {
  collisions: CoastCollision[]
}

export const useCoastStore = create<CoastState>(() => ({
  collisions: [],
}))
