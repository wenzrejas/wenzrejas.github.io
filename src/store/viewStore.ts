import { create } from 'zustand'

type ScenePhase = 'world' | 'diving' | 'depths' | 'surfacing'
type MapPhase = 'closed' | 'unfolding' | 'open' | 'folding'
type RenderedScene = 'world' | 'depths' | null

interface ViewState {
  scenePhase: ScenePhase
  mapPhase: MapPhase
  hasMapOpened: boolean
}

export const useViewStore = create<ViewState>(() => ({
  scenePhase: 'world',
  mapPhase: 'closed',
  hasMapOpened: false,
}))

export const isWorldScene = ({ scenePhase }: ViewState) => scenePhase === 'world'

export const isDepthsScene = ({ scenePhase }: ViewState) => scenePhase === 'depths'

export const isSurfacingScene = ({ scenePhase }: ViewState) => scenePhase === 'surfacing'

const isSceneChanging = ({ scenePhase }: ViewState) =>
  scenePhase === 'diving' || scenePhase === 'surfacing'

export const isBelowSurface = ({ scenePhase }: ViewState) =>
  scenePhase === 'diving' || scenePhase === 'depths'

export const isDepthsMounted = ({ scenePhase }: ViewState) => scenePhase !== 'world'

export const openWorldMap = () =>
  useViewStore.setState((view) =>
    isSceneChanging(view)
      ? view
      : { mapPhase: view.mapPhase === 'open' ? 'open' : 'unfolding', hasMapOpened: true }
  )

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

const changeScene = (from: ScenePhase, to: ScenePhase) =>
  useViewStore.setState((view) =>
    view.scenePhase === from && view.mapPhase === 'closed' ? { scenePhase: to } : view
  )

export const beginDive = () => changeScene('world', 'diving')

export const arriveInDepths = () => changeScene('diving', 'depths')

export const abortDive = () => changeScene('diving', 'world')

export const beginSurfacing = () => changeScene('depths', 'surfacing')

export const arriveAtSurface = () => changeScene('surfacing', 'world')

export const leaveDepths = () =>
  useViewStore.setState((view) => (isDepthsScene(view) ? { scenePhase: 'world' } : view))

export const isDiving = () => useViewStore.getState().scenePhase === 'diving'

export const isMapUnfolded = ({ mapPhase }: ViewState) =>
  mapPhase === 'unfolding' || mapPhase === 'open'

export const isWorldPaused = (view: ViewState) =>
  isMapUnfolded(view) || view.scenePhase === 'depths' || view.scenePhase === 'surfacing'

export function isWorldInView() {
  const { scenePhase, mapPhase } = useViewStore.getState()
  return scenePhase === 'world' && mapPhase === 'closed'
}

export function isDepthsInView() {
  const { scenePhase, mapPhase } = useViewStore.getState()
  return scenePhase === 'depths' && mapPhase === 'closed'
}

export function renderedScene(): RenderedScene {
  const { scenePhase, mapPhase } = useViewStore.getState()
  if (mapPhase === 'open') return null
  return scenePhase === 'world' || scenePhase === 'diving' ? 'world' : 'depths'
}
