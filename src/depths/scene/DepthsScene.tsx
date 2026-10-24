import { useEffect, useMemo } from 'react'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { warmShaders } from '@/loading/shaderWarmup'
import { clearDepthsStage, failDepths, markDepthsReady, showDepthsStage } from '@/store/depthsStore'
import { isDepthsScene, isMapUnfolded, isSurfacingScene, useViewStore } from '@/store/viewStore'
import { createWallClock, tickWallClock } from '@/utils/time'
import { advanceArrival, createArrival } from './arrival/arrival'
import ArrivalDarkness from './arrival/ArrivalDarkness'
import DepthsCameraRig from './camera-rig/DepthsCameraRig'
import { DEPTHS_CAMERA_FAR, DEPTHS_CAMERA_FOV, DEPTHS_CAMERA_NEAR } from './camera-rig/constants'
import { DEPTHS_CLOCK_FRAME_PRIORITY } from './constants'
import { buildSparkleGeometry, createSparkleMaterial } from './deep-sparkles/deepSparklesModel'
import DepthEnvironment from './depth-environment/DepthEnvironment'
import { buildMoteGeometry, createMoteMaterial } from './depth-particles/depthParticlesModel'
import DepthsShip from './depths-ship/DepthsShip'
import FishSchools from './fish-schools/FishSchools'
import Jellyfish from './jellyfish/Jellyfish'
import LightRays from './light-rays/LightRays'
import MilestonePanels from './milestone-panels/MilestonePanels'
import PlungeSplash from './plunge-splash/PlungeSplash'
import SceneryKit from './scenery-kit/SceneryKit'
import DepthPoints from './shared/DepthPoints'
import SunkenRuins from './sunken-ruins/SunkenRuins'
import { advanceSurfacing, createSurfacing } from './surfacing/surfacing'
import { createTimeline } from './timeline/timeline'
import WhaleSilhouette from './whale-silhouette/WhaleSilhouette'

export default function DepthsScene() {
  const gl = useThree((state) => state.gl)
  const scene = useMemo(() => new THREE.Scene(), [])
  const camera = useMemo(
    () => new THREE.PerspectiveCamera(DEPTHS_CAMERA_FOV, 1, DEPTHS_CAMERA_NEAR, DEPTHS_CAMERA_FAR),
    []
  )
  const clock = useMemo(() => createWallClock(), [])
  const timeline = useMemo(() => createTimeline(), [])
  const arrival = useMemo(() => createArrival(), [])
  const surfacing = useMemo(() => createSurfacing(), [])
  const focus = useMemo(() => new THREE.Vector3(), [])
  const shipSpot = useMemo(() => new THREE.Vector3(), [])
  const plazaSpot = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    let isCurrent = true
    showDepthsStage(scene, camera, timeline)
    warmShaders(gl, scene, camera).then(
      () => {
        if (isCurrent) markDepthsReady()
      },
      (error: unknown) => {
        console.error(error)
        if (isCurrent) failDepths()
      }
    )
    return () => {
      isCurrent = false
      clearDepthsStage()
    }
  }, [gl, scene, camera, timeline])

  useFrame(() => {
    const view = useViewStore.getState()
    tickWallClock(clock, isMapUnfolded(view))
    advanceArrival(arrival, clock.delta, isDepthsScene(view))
    advanceSurfacing(surfacing, clock.delta, isSurfacingScene(view), timeline)
  }, DEPTHS_CLOCK_FRAME_PRIORITY)

  return createPortal(
    <>
      <DepthEnvironment timeline={timeline} clock={clock} />
      <LightRays clock={clock} />
      <DepthPoints
        buildGeometry={buildMoteGeometry}
        createMaterial={createMoteMaterial}
        clock={clock}
      />
      <DepthPoints
        buildGeometry={buildSparkleGeometry}
        createMaterial={createSparkleMaterial}
        clock={clock}
      />
      <Jellyfish clock={clock} />
      <FishSchools clock={clock} />
      <WhaleSilhouette timeline={timeline} camera={camera} clock={clock} />
      <SceneryKit clock={clock} />
      <SunkenRuins timeline={timeline} surfacing={surfacing} plazaSpot={plazaSpot} clock={clock} />
      <DepthsShip
        arrival={arrival}
        timeline={timeline}
        surfacing={surfacing}
        focus={focus}
        shipSpot={shipSpot}
        plazaSpot={plazaSpot}
        clock={clock}
      />
      <PlungeSplash arrival={arrival} shipSpot={shipSpot} clock={clock} />
      <ArrivalDarkness arrival={arrival} />
      <MilestonePanels timeline={timeline} clock={clock} />
      <DepthsCameraRig
        camera={camera}
        focus={focus}
        clock={clock}
        timeline={timeline}
        surfacing={surfacing}
      />
    </>,
    scene,
    { camera }
  )
}
