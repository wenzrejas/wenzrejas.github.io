import { Leva } from 'leva'
import Experience from './components/Experience/Experience'
import IslandPanel from './components/World/Islands/IslandPanel'
import { DebugSync } from './components/Debug/DebugControls'
import { IS_DEBUG } from './components/Experience/constants'
import { useUIStore } from './store/uiStore'

export default function App() {
  const selectedIsland = useUIStore((s) => s.selectedIsland)
  const clearIsland = useUIStore((s) => s.clearIsland)

  return (
    <>
      <DebugSync />
      <Leva hidden={!IS_DEBUG} collapsed />
      <Experience />
      <IslandPanel selectedKey={selectedIsland} onClose={clearIsland} />
    </>
  )
}
