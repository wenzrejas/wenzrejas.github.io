import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWeatherStore, type WeatherType } from '../../../store/weatherStore'
import { useDebugStore } from '../../../store/debugStore'
import { PARAMS, TRANSITION, STABLE_MIN, pickOther, lerpParam } from './weatherParams'
import CloudShadows from './CloudShadows'
import RainRipples from './RainRipples'
import Rain from './Rain'
import OceanSparkles from './OceanSparkles'

interface Props {
  shipRef: React.RefObject<THREE.Group | null>
}

export default function WeatherSystem({ shipRef }: Props) {
  const currentType = useRef<WeatherType>('sunny')
  const nextType = useRef<WeatherType>(pickOther(currentType.current))
  const transitionT = useRef(0)
  const isBlending = useRef(false)
  const stableTimer = useRef(STABLE_MIN)

  // Lightning state
  const nextLightning = useRef(6 + Math.random() * 10)
  const flashPhase = useRef(0) // 0=idle 1=main 2=gap 3=secondary
  const flashTimer = useRef(0)

  // priority -2 so WeatherSystem writes before DayNightCycle (-1) reads
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { weather: ctrl } = useDebugStore.getState()
    const w = useWeatherStore.getState()

    if (!ctrl.weatherEnabled) {
      w.type = 'sunny'
      w.lightMult = 1.0
      w.moonMult = 1.0
      w.waveAmpMult = 1.0
      w.windMult = 1.0
      w.rainIntensity = 0.0
      w.overcastAmount = 0.0
      w.cloudShadow = 0.0
    } else if (ctrl.weatherType !== 'auto') {
      const p = PARAMS[ctrl.weatherType as WeatherType]
      w.type = ctrl.weatherType as WeatherType
      w.lightMult = p.lightMult
      w.moonMult = p.moonMult
      w.waveAmpMult = p.waveAmpMult
      w.windMult = p.windMult
      w.rainIntensity = p.rainIntensity
      w.overcastAmount = p.overcastAmount
      w.cloudShadow = p.cloudShadow
    } else {
      if (!isBlending.current) {
        stableTimer.current -= dt
        if (stableTimer.current <= 0) {
          nextType.current = pickOther(currentType.current)
          isBlending.current = true
          transitionT.current = 0
        }
      } else {
        transitionT.current = Math.min(1, transitionT.current + dt / TRANSITION)
        if (transitionT.current >= 1) {
          currentType.current = nextType.current
          isBlending.current = false
          stableTimer.current = STABLE_MIN
        }
      }

      const t = isBlending.current ? transitionT.current : 0
      const s = t * t * (3 - 2 * t)
      const cur = PARAMS[currentType.current]
      const nxt = PARAMS[nextType.current]

      w.type = t > 0.5 ? nextType.current : currentType.current
      w.lightMult = lerpParam(cur.lightMult, nxt.lightMult, s)
      w.moonMult = lerpParam(cur.moonMult, nxt.moonMult, s)
      w.waveAmpMult = lerpParam(cur.waveAmpMult, nxt.waveAmpMult, s)
      w.windMult = lerpParam(cur.windMult, nxt.windMult, s)
      w.rainIntensity = lerpParam(cur.rainIntensity, nxt.rainIntensity, s)
      w.overcastAmount = lerpParam(cur.overcastAmount, nxt.overcastAmount, s)
      w.cloudShadow = lerpParam(cur.cloudShadow, nxt.cloudShadow, s)
    }

    // ── Lightning — always evaluated after weather state is set ─────────
    if (w.type === 'rainy') {
      nextLightning.current -= dt
      const phase = flashPhase.current

      if (phase === 0 && nextLightning.current <= 0) {
        flashPhase.current = 1
        flashTimer.current = 0
        w.lightningFlash = 1.0
      } else if (phase === 1) {
        flashTimer.current += dt
        w.lightningFlash = Math.max(0, 1.0 - flashTimer.current * 8)
        if (flashTimer.current > 0.15) {
          flashPhase.current = Math.random() < 0.6 ? 2 : 0
          flashTimer.current = 0
          if (flashPhase.current === 0) nextLightning.current = 5 + Math.random() * 12
        }
      } else if (phase === 2) {
        flashTimer.current += dt
        w.lightningFlash = 0
        if (flashTimer.current > 0.08) {
          flashPhase.current = 3
          flashTimer.current = 0
          w.lightningFlash = 0.55
        }
      } else if (phase === 3) {
        flashTimer.current += dt
        w.lightningFlash = Math.max(0, 0.55 - flashTimer.current * 6)
        if (flashTimer.current > 0.12) {
          flashPhase.current = 0
          nextLightning.current = 5 + Math.random() * 12
        }
      }
    } else {
      w.lightningFlash = 0
      flashPhase.current = 0
    }
  }, -2)

  return (
    <>
      <CloudShadows />
      <Rain shipRef={shipRef} />
      <RainRipples shipRef={shipRef} />
      <OceanSparkles shipRef={shipRef} />
    </>
  )
}
