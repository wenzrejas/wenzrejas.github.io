import { useEffect, useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { buildOrbiModel, disposeOrbiModel } from './orbiModel'

export default function Orbi(props: ThreeElements['group']) {
  const model = useMemo(() => buildOrbiModel(), [])

  useEffect(() => () => disposeOrbiModel(model), [model])

  return (
    <group {...props}>
      <primitive object={model} />
    </group>
  )
}
