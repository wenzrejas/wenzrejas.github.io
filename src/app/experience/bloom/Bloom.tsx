import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { isLoaderShowing } from '@/store/loadingStore'
import { isGraphicsSharp } from '@/store/settingsStore'
import { renderedScene } from '@/store/viewStore'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { bloomStrength, bloomThreshold } from './bloomLook'
import { createBloomChain, disposeBloomChain } from './bloomModel'
import { drawBloom, warmBloom } from './bloomPasses'
import { BLOOM_FRAME_PRIORITY } from './constants'

export default function Bloom() {
  const gl = useThree((state) => state.gl)
  const chain = useMemo(() => createBloomChain(), [])
  const shownSeconds = useRef(0)

  useEffect(() => () => disposeBloomChain(chain), [chain])

  useEffect(() => {
    const warmFrame = requestAnimationFrame(() => warmBloom(chain, gl))
    return () => cancelAnimationFrame(warmFrame)
  }, [chain, gl])

  useFrame(({ gl }, delta) => {
    const scene = renderedScene()
    if (scene === null || isLoaderShowing()) return
    shownSeconds.current += Math.min(delta, MAX_FRAME_SECONDS)
    if (!isGraphicsSharp()) return
    const strength = bloomStrength(scene, shownSeconds.current)
    if (strength > 0) drawBloom(chain, gl, strength, bloomThreshold(scene))
  }, BLOOM_FRAME_PRIORITY)

  return null
}
