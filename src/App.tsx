import { useState } from 'react'
import { Leva } from 'leva'
import { DebugProvider } from './components/Debug/DebugControls'
import Experience from './components/Experience/Experience'
import IslandPanel from './components/World/Islands/IslandPanel'
import { IS_DEBUG } from './components/Experience/constants'
import type { IslandKey } from './components/World/Islands/constants'

export default function App() {
  const [selectedIsland, setSelectedIsland] = useState<IslandKey | null>(null)

  return (
    <DebugProvider>
      <Leva hidden={!IS_DEBUG} collapsed />
      <Experience onIslandSelect={setSelectedIsland} />
      <IslandPanel selectedKey={selectedIsland} onClose={() => setSelectedIsland(null)} />
    </DebugProvider>
  )
}
