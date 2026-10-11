import { create } from 'zustand'

type SceneKey = 'world' | 'depths'
type MapPhase = 'closed' | 'unfolding' | 'open' | 'folding'

interface ViewState {
  activeScene: SceneKey
  mapPhase: MapPhase
  hasMapOpened: boolean
}

export const useViewStore = create<ViewState>(() => ({
  activeScene: 'world',
  mapPhase: 'closed',
  hasMapOpened: false,
}))

export const openWorldMap = () =>
  useViewStore.setState(({ mapPhase }) => ({
    mapPhase: mapPhase === 'open' ? 'open' : 'unfolding',
    hasMapOpened: true,
  }))

export const closeWorldMap = () =>
  useViewStore.setState(({ mapPhase }) => ({
    mapPhase: mapPhase === 'closed' ? 'closed' : 'folding',
  }))

export const finishMapUnfold = () =>
  useViewStore.setState(({ mapPhase }) => ({
    mapPhase: mapPhase === 'unfolding' ? 'open' : mapPhase,
  }))

export const finishMapFold = () =>
  useViewStore.setState(({ mapPhase }) => ({
    mapPhase: mapPhase === 'folding' ? 'closed' : mapPhase,
  }))

export const enterDepths = () => useViewStore.setState({ activeScene: 'depths' })

export const leaveDepths = () => useViewStore.setState({ activeScene: 'world' })

export const isDepthsScene = ({ activeScene }: ViewState) => activeScene === 'depths'

export const isInDepths = () => isDepthsScene(useViewStore.getState())

export const isMapUnfolded = ({ mapPhase }: ViewState) =>
  mapPhase === 'unfolding' || mapPhase === 'open'

export function isWorldInView() {
  const { activeScene, mapPhase } = useViewStore.getState()
  return activeScene === 'world' && mapPhase === 'closed'
}

export function isWorldVisible() {
  const { activeScene, mapPhase } = useViewStore.getState()
  return activeScene === 'world' && mapPhase !== 'open'
}
