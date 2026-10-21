import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { FLAG_WAVE_DEPTH, PAYMENTS_FLAG_NODE, PENNANT_NODE, PENNANT_WAVE_DEPTH } from './constants'
import { prepareWavingFlag, waveFlag } from './flagWave'

export function useWavingFlags(model: THREE.Object3D) {
  const flag = useMemo(() => prepareWavingFlag(model, PAYMENTS_FLAG_NODE), [model])
  const pennant = useMemo(() => prepareWavingFlag(model, PENNANT_NODE), [model])

  useFrame(({ clock }) => {
    const seconds = clock.getElapsedTime()
    if (flag) waveFlag(flag, seconds, FLAG_WAVE_DEPTH)
    if (pennant) waveFlag(pennant, seconds, PENNANT_WAVE_DEPTH)
  })
}
