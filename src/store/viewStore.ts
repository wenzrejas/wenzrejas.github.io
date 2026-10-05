import { create } from 'zustand'

type SceneKey = 'world' | 'depths'

interface ViewState {
  activeScene: SceneKey
  isMapOpen: boolean
}

export const useViewStore = create<ViewState>(() => ({
  activeScene: 'world',
  isMapOpen: false,
}))

export const openWorldMap = () => useViewStore.setState({ isMapOpen: true })

export const closeWorldMap = () => useViewStore.setState({ isMapOpen: false })

export const enterDepths = () => useViewStore.setState({ activeScene: 'depths' })

export const leaveDepths = () => useViewStore.setState({ activeScene: 'world' })

export const isDepthsScene = ({ activeScene }: ViewState) => activeScene === 'depths'

export const isInDepths = () => isDepthsScene(useViewStore.getState())

export function isWorldInView() {
  const { activeScene, isMapOpen } = useViewStore.getState()
  return activeScene === 'world' && !isMapOpen
}
