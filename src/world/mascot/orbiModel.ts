import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import compassFont from 'three/examples/fonts/helvetiker_bold.typeface.json'
import GLOW_VERTEX from '@/shaders/uvQuad.vert.glsl'
import GLOW_FRAGMENT from './shaders/eyeGlow.frag.glsl'
import {
  BACK,
  BEVEL_SEGMENTS,
  BEZEL,
  BODY_PROFILE,
  DETAIL_SEGMENTS,
  FACE,
  HARDWARE,
  MARKINGS,
  MATERIAL,
  ORBI_SCALE,
  ROUND_SEGMENTS,
} from './constants'
import { buildScarfModel } from './scarf/scarfModel'
import { createPatinaTexture } from './patinaTexture'

function createMaterials() {
  const patina = createPatinaTexture()

  return {
    brass: new THREE.MeshStandardMaterial({
      color: '#e5ad55',
      map: patina,
      metalness: MATERIAL.brassMetalness,
      roughness: MATERIAL.brassRoughness,
    }),
    edge: new THREE.MeshStandardMaterial({
      color: '#f5ce84',
      metalness: MATERIAL.edgeMetalness,
      roughness: MATERIAL.edgeRoughness,
    }),
    bronze: new THREE.MeshStandardMaterial({
      color: '#906137',
      metalness: MATERIAL.brassMetalness,
      roughness: MATERIAL.brassRoughness,
    }),
    casing: new THREE.MeshStandardMaterial({
      color: '#3e5260',
      metalness: MATERIAL.casingMetalness,
      roughness: MATERIAL.casingRoughness,
    }),
    seam: new THREE.MeshStandardMaterial({
      color: '#1e2a36',
      roughness: MATERIAL.casingRoughness,
    }),
    face: new THREE.MeshPhysicalMaterial({
      color: '#281b18',
      metalness: MATERIAL.faceMetalness,
      roughness: MATERIAL.faceRoughness,
      clearcoat: MATERIAL.faceClearcoat,
      clearcoatRoughness: MATERIAL.faceClearcoatRoughness,
    }),
    eyes: new THREE.MeshStandardMaterial({
      color: '#ffe7ad',
      emissive: '#ffc36a',
      emissiveIntensity: FACE.eyeGlow,
    }),
    eyeHalo: new THREE.ShaderMaterial({
      vertexShader: GLOW_VERTEX,
      fragmentShader: GLOW_FRAGMENT,
      uniforms: {
        uColor: { value: new THREE.Color('#ff9d3e') },
        uOpacity: { value: FACE.haloOpacity },
        uFalloff: { value: FACE.haloFalloff },
        uFadeStart: { value: FACE.haloFadeStart },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    engraving: new THREE.MeshStandardMaterial({
      color: '#6b4224',
      roughness: MATERIAL.engravingRoughness,
    }),
    back: new THREE.MeshStandardMaterial({
      color: '#d4b98a',
      map: patina,
      metalness: MATERIAL.backMetalness,
      roughness: MATERIAL.backRoughness,
    }),
  }
}

type OrbiMaterials = ReturnType<typeof createMaterials>

function addMesh(
  parent: THREE.Group,
  name: string,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number] = [0, 0, 0]
) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)
  parent.add(mesh)
  return mesh
}

function ringGeometry(radius: number, thickness: number) {
  return new THREE.TorusGeometry(radius, thickness, DETAIL_SEGMENTS, ROUND_SEGMENTS)
}

function buildCase(materials: OrbiMaterials) {
  const body = new THREE.Group()
  body.name = 'Compass case'
  const profile = BODY_PROFILE.map(([radius, depth]) => new THREE.Vector2(radius, depth))
  const shell = addMesh(
    body,
    'Navy case',
    new THREE.LatheGeometry(profile, ROUND_SEGMENTS),
    materials.casing
  )
  shell.rotation.x = Math.PI / 2

  const bezelShape = new THREE.Shape()
  bezelShape.absarc(0, 0, BEZEL.outerRadius, 0, Math.PI * 2, false)
  const opening = new THREE.Path()
  opening.absarc(0, 0, BEZEL.innerRadius, 0, Math.PI * 2, true)
  bezelShape.holes.push(opening)
  addMesh(
    body,
    'Solid brass bezel',
    new THREE.ExtrudeGeometry(bezelShape, {
      depth: BEZEL.depth,
      bevelEnabled: true,
      bevelSegments: BEVEL_SEGMENTS,
      steps: 1,
      bevelSize: BEZEL.bevel,
      bevelThickness: BEZEL.bevel,
      curveSegments: ROUND_SEGMENTS,
    }),
    materials.brass,
    [0, 0, BEZEL.front]
  )
  addMesh(
    body,
    'Inner bronze lip',
    ringGeometry(BEZEL.lipRadius, BEZEL.lipThickness),
    materials.bronze,
    [0, 0, BEZEL.lipFront]
  )
  addMesh(
    body,
    'Polished bezel edge',
    ringGeometry(BEZEL.edgeRadius, BEZEL.edgeThickness),
    materials.edge,
    [0, 0, BEZEL.edgeFront]
  )

  for (let i = 0; i < BACK.seamCount; i++) {
    const angle = (i / BACK.seamCount) * Math.PI * 2
    const seam = addMesh(
      body,
      'Case panel joint',
      new THREE.BoxGeometry(BACK.seamThickness, BACK.seamThickness, BACK.seamDepth),
      materials.seam,
      [Math.sin(angle) * BACK.seamRadius, Math.cos(angle) * BACK.seamRadius, 0]
    )
    seam.rotation.z = -angle
  }
  return body
}

function buildFace(materials: OrbiMaterials) {
  const face = new THREE.Group()
  face.name = 'Face'
  const sphere = new THREE.SphereGeometry(1, ROUND_SEGMENTS, DETAIL_SEGMENTS)
  const glass = addMesh(face, 'Dark domed face', sphere, materials.face, [0, 0, FACE.centerFront])
  glass.scale.set(FACE.radius, FACE.radius, FACE.depth)

  const haloGeometry = new THREE.PlaneGeometry(FACE.haloWidth, FACE.haloHeight)
  for (const side of [-1, 1]) {
    addMesh(face, 'Warm eye halo', haloGeometry, materials.eyeHalo, [
      side * FACE.eyeSpacing,
      FACE.eyeHeight,
      FACE.haloFront,
    ])
    const eye = addMesh(face, side < 0 ? 'Left eye' : 'Right eye', sphere, materials.eyes, [
      side * FACE.eyeSpacing,
      FACE.eyeHeight,
      FACE.eyeFront,
    ])
    eye.scale.set(FACE.eyeWidth, FACE.eyeLength, FACE.eyeDepth)
    const cheek = addMesh(face, 'Face glint', sphere, materials.brass, [
      side * FACE.cheekSpacing,
      FACE.cheekHeight,
      FACE.cheekFront,
    ])
    cheek.scale.setScalar(FACE.cheekRadius)
  }
  return face
}

function buildMarkings(materials: OrbiMaterials) {
  const markings = new THREE.Group()
  markings.name = 'Compass markings'
  const font = new FontLoader().parse(compassFont)
  for (const [letter, angle] of [
    ['N', 0],
    ['E', Math.PI / 2],
    ['S', Math.PI],
    ['W', -Math.PI / 2],
  ] as const) {
    const geometry = new THREE.ShapeGeometry(font.generateShapes(letter, MARKINGS.letterSize))
    geometry.center()
    const marking = addMesh(markings, `${letter} engraving`, geometry, materials.engraving, [
      Math.sin(angle) * MARKINGS.letterRadius,
      Math.cos(angle) * MARKINGS.letterRadius,
      MARKINGS.front,
    ])
    marking.rotation.z = -angle
  }

  for (let i = 0; i < MARKINGS.tickCount; i++) {
    const angle = (i / MARKINGS.tickCount) * Math.PI * 2
    if (i % (MARKINGS.tickCount / 4) === 0) continue
    const length = i % 4 === 0 ? MARKINGS.majorTickLength : MARKINGS.tickLength
    const tick = addMesh(
      markings,
      'Engraved compass tick',
      new THREE.BoxGeometry(MARKINGS.tickWidth, length, MARKINGS.depth),
      materials.engraving,
      [Math.sin(angle) * MARKINGS.tickRadius, Math.cos(angle) * MARKINGS.tickRadius, MARKINGS.front]
    )
    tick.rotation.z = -angle
  }

  const rivetGeometry = new THREE.SphereGeometry(
    MARKINGS.rivetRadius,
    DETAIL_SEGMENTS,
    DETAIL_SEGMENTS
  )
  const slotGeometry = new THREE.BoxGeometry(
    MARKINGS.screwSlotWidth,
    MARKINGS.screwSlotLength,
    MARKINGS.depth
  )
  for (let i = 0; i < MARKINGS.rivetCount; i++) {
    const angle = ((i + 0.5) / MARKINGS.rivetCount) * Math.PI * 2
    const x = Math.sin(angle) * MARKINGS.rivetOrbit
    const y = Math.cos(angle) * MARKINGS.rivetOrbit
    const rivet = addMesh(markings, 'Bezel screw', rivetGeometry, materials.edge, [
      x,
      y,
      MARKINGS.rivetFront,
    ])
    rivet.scale.z = 0.5
    const slot = addMesh(markings, 'Screw slot', slotGeometry, materials.bronze, [
      x,
      y,
      MARKINGS.rivetFront + MARKINGS.rivetRadius * 0.5,
    ])
    slot.rotation.z = angle
  }
  return markings
}

function buildHardware(materials: OrbiMaterials) {
  const hardware = new THREE.Group()
  hardware.name = 'Loops and compass points'
  const loopBase = new THREE.CylinderGeometry(
    HARDWARE.loopBaseRadius,
    HARDWARE.loopBaseRadius,
    HARDWARE.loopBaseHeight,
    DETAIL_SEGMENTS
  )
  addMesh(hardware, 'Crown socket', loopBase, materials.brass, [
    0,
    HARDWARE.loopBaseCenter,
    HARDWARE.loopFront,
  ])
  addMesh(
    hardware,
    'Top loop',
    ringGeometry(HARDWARE.loopRadius, HARDWARE.loopTube),
    materials.brass,
    [0, HARDWARE.loopHeight, HARDWARE.loopFront]
  )
  addMesh(
    hardware,
    'Top loop bevel',
    ringGeometry(HARDWARE.loopEdgeRadius, HARDWARE.loopEdgeTube),
    materials.edge,
    [0, HARDWARE.loopHeight, HARDWARE.loopEdgeFront]
  )
  addMesh(hardware, 'Lower socket', loopBase, materials.brass, [
    0,
    HARDWARE.bottomBaseHeight,
    HARDWARE.bottomLoopFront,
  ])
  addMesh(
    hardware,
    'Bottom loop',
    ringGeometry(HARDWARE.bottomLoopRadius, HARDWARE.bottomLoopTube),
    materials.bronze,
    [0, HARDWARE.bottomLoopHeight, HARDWARE.bottomLoopFront]
  )
  addMesh(
    hardware,
    'Bottom loop bevel',
    ringGeometry(HARDWARE.bottomLoopRadius, HARDWARE.loopEdgeTube),
    materials.edge,
    [0, HARDWARE.bottomLoopHeight, HARDWARE.bottomLoopFront + HARDWARE.bottomLoopTube]
  )

  const mountGeometry = new THREE.CylinderGeometry(
    HARDWARE.sideMountRadius,
    HARDWARE.sideMountRadius,
    HARDWARE.sideMountDepth,
    DETAIL_SEGMENTS
  )
  const pointGeometry = new THREE.ConeGeometry(
    HARDWARE.sideTipRadius,
    HARDWARE.sideTipLength,
    HARDWARE.sideTipSegments
  )
  for (const side of [-1, 1]) {
    const mount = addMesh(hardware, 'Side point socket', mountGeometry, materials.bronze, [
      side * HARDWARE.sideMountCenter,
      0,
      0,
    ])
    mount.rotation.z = (-side * Math.PI) / 2
    const point = addMesh(hardware, 'Faceted compass point', pointGeometry, materials.brass, [
      side * HARDWARE.sideTipCenter,
      0,
      0,
    ])
    point.rotation.z = (-side * Math.PI) / 2
  }
  return hardware
}

function buildBack(materials: OrbiMaterials) {
  const back = new THREE.Group()
  back.name = 'Rear compass plate'
  const plate = addMesh(
    back,
    'Rounded rear plate',
    new THREE.SphereGeometry(1, ROUND_SEGMENTS, DETAIL_SEGMENTS),
    materials.back,
    [0, 0, BACK.plateCenter]
  )
  plate.scale.set(BACK.plateRadius, BACK.plateRadius, BACK.plateDepth)
  addMesh(back, 'Rear plate rim', ringGeometry(BACK.rimRadius, BACK.rimTube), materials.edge, [
    0,
    0,
    BACK.rimFront,
  ])

  const badge = new THREE.Group()
  badge.name = 'Rear compass rose'
  badge.position.z = BACK.badgeFront
  badge.rotation.y = Math.PI
  back.add(badge)
  const disc = new THREE.CylinderGeometry(
    BACK.badgeRadius,
    BACK.badgeRadius,
    BACK.badgeDepth,
    ROUND_SEGMENTS
  ).rotateX(Math.PI / 2)
  addMesh(badge, 'Navy compass inset', disc, materials.casing)
  addMesh(
    badge,
    'Compass inset rim',
    ringGeometry(BACK.badgeRadius, BACK.badgeRim),
    materials.brass
  )
  for (let i = 0; i < 8; i++) {
    const length = i % 2 === 0 ? BACK.compassRadius : BACK.compassShortRadius
    const ray = new THREE.Shape()
    ray.moveTo(0, length)
    ray.lineTo(BACK.compassWidth, 0)
    ray.lineTo(0, -BACK.compassWidth)
    ray.lineTo(-BACK.compassWidth, 0)
    ray.closePath()
    const needle = addMesh(
      badge,
      'Compass rose point',
      new THREE.ShapeGeometry(ray),
      i % 2 === 0 ? materials.edge : materials.brass,
      [0, 0, BACK.badgeDepth]
    )
    needle.rotation.z = (i * Math.PI) / 4
  }
  addMesh(
    badge,
    'Compass center pin',
    new THREE.SphereGeometry(BACK.compassCenterRadius, DETAIL_SEGMENTS, DETAIL_SEGMENTS),
    materials.edge,
    [0, 0, BACK.badgeDepth]
  )

  const rivetGeometry = new THREE.SphereGeometry(BACK.rivetRadius, DETAIL_SEGMENTS, DETAIL_SEGMENTS)
  for (let i = 0; i < BACK.rivetCount; i++) {
    const angle = ((i + 0.5) / BACK.rivetCount) * Math.PI * 2
    addMesh(back, 'Rear plate rivet', rivetGeometry, materials.brass, [
      Math.sin(angle) * BACK.rivetOrbit,
      Math.cos(angle) * BACK.rivetOrbit,
      BACK.rivetFront,
    ])
  }
  return back
}

export function buildOrbiModel(): THREE.Group {
  const materials = createMaterials()
  const model = new THREE.Group()
  model.name = 'Orbi'
  model.add(
    buildCase(materials),
    buildFace(materials),
    buildMarkings(materials),
    buildHardware(materials),
    buildBack(materials),
    buildScarfModel()
  )
  model.scale.setScalar(ORBI_SCALE)
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.castShadow = true
    object.receiveShadow = true
  })
  return model
}

export function disposeOrbiModel(model: THREE.Group): void {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    geometries.add(object.geometry)
    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material]
    meshMaterials.forEach((material) => materials.add(material))
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => {
    if (material instanceof THREE.MeshStandardMaterial && material.map) textures.add(material.map)
    material.dispose()
  })
  textures.forEach((texture) => texture.dispose())
}
