import { Leva } from 'leva'
import { DebugSync } from './DebugControls'

export default function DebugTools() {
  return (
    <>
      <DebugSync />
      <Leva collapsed />
    </>
  )
}
