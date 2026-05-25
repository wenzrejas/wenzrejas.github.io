import { Sky as DreiSky } from '@react-three/drei'

export default function Sky() {
  return (
    <DreiSky
      distance={4500}
      sunPosition={[1, 0.3, 0]}
      inclination={0.55}
      azimuth={0.25}
      turbidity={4}
      rayleigh={0.8}
      mieCoefficient={0.004}
      mieDirectionalG={0.85}
    />
  )
}
