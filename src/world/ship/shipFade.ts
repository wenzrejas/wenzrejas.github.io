import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { raceShipFade } from '@/store/checkpointStore'
import { meshesOf, sinkBehindCoplanar } from '@/utils/meshes'
import { patchShader } from '@/world/islands/shared/materialPatch'
import SHIP_FADE_PARS from './shaders/shipFadePars.frag.glsl'
import SHIP_FADE from './shaders/shipFade.frag.glsl'

export const shipFadeUniforms = {
  uShipFade: { value: 1 },
}

export function dressShipFade(material: THREE.Material) {
  material.blending = THREE.CustomBlending
  material.blendSrcAlpha = THREE.OneFactor
  material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor
  material.forceSinglePass = true
  patchShader(material, {
    uniforms: shipFadeUniforms,
    fragment: { common: SHIP_FADE_PARS, clipping_planes_fragment: SHIP_FADE },
  })
}

export const isShipHidden = () => raceShipFade() === 0

export function createDepthPass(side: THREE.Side) {
  const material = new THREE.MeshBasicMaterial({
    side,
    transparent: true,
    colorWrite: false,
    forceSinglePass: true,
    visible: false,
  })
  sinkBehindCoplanar(material, 1)
  return material
}

export function buildShipFadePass(model: THREE.Object3D) {
  const meshes = meshesOf(model)
  const materials = new Set<THREE.Material>()
  const depthPasses = new Map<THREE.Side, THREE.Material>()
  for (const mesh of meshes) {
    const material = mesh.material as THREE.Material
    materials.add(material)
    if (!depthPasses.has(material.side)) {
      depthPasses.set(material.side, createDepthPass(material.side))
    }
    const depthPass = new THREE.Mesh(mesh.geometry, depthPasses.get(material.side))
    depthPass.renderOrder = RENDER_LAYER.shipFadeDepth
    mesh.add(depthPass)
  }
  return { meshes, materials: [...materials], depthPasses: [...depthPasses.values()] }
}

type ShipFadePass = ReturnType<typeof buildShipFadePass>

function showShipFade({ meshes, materials, depthPasses }: ShipFadePass, fade: number) {
  shipFadeUniforms.uShipFade.value = fade
  if (materials[0].opacity === fade) return
  const isFading = fade < 1
  const isShown = fade > 0
  for (const material of materials) {
    material.transparent = isFading
    material.opacity = fade
    material.visible = isShown
  }
  for (const mesh of meshes) mesh.renderOrder = isFading ? RENDER_LAYER.shipFade : 0
  for (const depthPass of depthPasses) depthPass.visible = isFading && isShown
}

export function useShipFade(pass: ShipFadePass) {
  useFrame(() => showShipFade(pass, raceShipFade()))
}
