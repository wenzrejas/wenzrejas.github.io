import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={1.1} radius={0.65} luminanceThreshold={0.8} />
    </EffectComposer>
  )
}
