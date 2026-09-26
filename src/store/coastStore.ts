import { create } from 'zustand'
import type { CoastCollision } from '../components/World/Shore/coastCollision'

interface CoastState {
  collisions: CoastCollision[]
}

export const useCoastStore = create<CoastState>(() => ({
  collisions: [],
}))
