import { Leva } from 'leva'
import { DebugProvider } from './components/Debug/DebugControls'
import Experience from './components/Experience/Experience'
import { IS_DEBUG } from './components/Experience/constants'

export default function App() {
  return (
    <DebugProvider>
      <Leva hidden={!IS_DEBUG} collapsed />
      <Experience />
    </DebugProvider>
  )
}
