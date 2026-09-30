import { Leva } from 'leva'
import Experience from './components/Experience/Experience'
import IslandTitle from './components/World/Islands/IslandTitle'
import { DebugSync } from './components/Debug/DebugControls'
import { IS_DEBUG } from './components/Experience/constants'
import Soundscape from './components/Audio/Soundscape'

export default function App() {
  return (
    <>
      <DebugSync />
      <Soundscape />
      <Leva hidden={!IS_DEBUG} collapsed />
      <Experience />
      <IslandTitle />
    </>
  )
}
