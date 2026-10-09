import * as THREE from 'three'
import { SCARF_BAND, SCARF_CLASP, SCARF_CLOTH, SCARF_KNOT, SCARF_TAILS } from './constants'

function buildClothGeometry(
  lengthSegments: number,
  widthSegments: number,
  getPosition: (length: number, width: number) => THREE.Vector3
) {
  const positions: number[] = []
  const indices: number[] = []
  for (let i = 0; i <= lengthSegments; i++) {
    for (let j = 0; j <= widthSegments; j++) {
      const position = getPosition(i / lengthSegments, j / widthSegments)
      positions.push(position.x, position.y, position.z)
      if (i === lengthSegments || j === widthSegments) continue
      const vertex = i * (widthSegments + 1) + j
      const nextRow = vertex + widthSegments + 1
      indices.push(vertex, nextRow, vertex + 1, vertex + 1, nextRow, nextRow + 1)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function buildBandGeometry() {
  return buildClothGeometry(SCARF_BAND.segments, SCARF_BAND.heightSegments, (length, width) => {
    const angle = length * Math.PI * 2
    const horizontal = Math.sin(angle)
    const depth = Math.cos(angle)
    const radius = THREE.MathUtils.lerp(SCARF_BAND.topRadius, SCARF_BAND.bottomRadius, width)
    const fold = Math.sin(width * Math.PI * SCARF_BAND.foldCount + angle)
    return new THREE.Vector3(
      Math.sign(horizontal) *
        Math.pow(Math.abs(horizontal), SCARF_BAND.crossSectionExponent) *
        (radius + fold * SCARF_BAND.foldDepth),
      SCARF_BAND.centerHeight +
        (0.5 - width) * SCARF_BAND.height +
        depth * SCARF_BAND.hemRise -
        Math.pow(Math.max(depth, 0), 2) * SCARF_BAND.frontDrop,
      Math.sign(depth) *
        Math.pow(Math.abs(depth), SCARF_BAND.crossSectionExponent) *
        (SCARF_BAND.depth + fold * SCARF_BAND.foldDepth) +
        SCARF_BAND.frontOffset
    )
  })
}

function buildTailGeometry(tail: (typeof SCARF_TAILS)[number]) {
  const centerline = new THREE.CatmullRomCurve3(
    tail.points.map((point) => new THREE.Vector3(...point))
  )
  return buildClothGeometry(
    SCARF_CLOTH.lengthSegments,
    SCARF_CLOTH.widthSegments,
    (length, width) => {
      const position = centerline.getPoint(length)
      const tangent = centerline.getTangent(length)
      const lateral = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize()
      const widthIndex = length * (tail.widths.length - 1)
      const lowerIndex = Math.floor(widthIndex)
      const upperIndex = Math.min(lowerIndex + 1, tail.widths.length - 1)
      const halfWidth = THREE.MathUtils.lerp(
        tail.widths[lowerIndex],
        tail.widths[upperIndex],
        widthIndex - lowerIndex
      )
      position.addScaledVector(lateral, (width * 2 - 1) * halfWidth)
      position.z +=
        Math.sin(
          width * Math.PI * SCARF_CLOTH.foldCount + length * SCARF_CLOTH.foldTwist + tail.foldPhase
        ) *
        SCARF_CLOTH.foldDepth *
        Math.sin(length * Math.PI)
      return position
    }
  )
}

function buildCompassClasp() {
  const clasp = new THREE.Group()
  clasp.position.set(...SCARF_CLASP.position)
  clasp.rotation.z = SCARF_CLASP.rotation
  const gold = new THREE.MeshStandardMaterial({
    color: SCARF_CLASP.gold,
    roughness: SCARF_CLASP.roughness,
    metalness: SCARF_CLASP.metalness,
  })
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(
      SCARF_CLASP.radius,
      SCARF_CLASP.rimThickness,
      SCARF_CLASP.radialSegments,
      SCARF_CLASP.ringSegments
    ),
    gold
  )
  const inset = new THREE.Mesh(
    new THREE.CylinderGeometry(
      SCARF_CLASP.insetRadius,
      SCARF_CLASP.insetRadius,
      SCARF_CLASP.insetDepth,
      SCARF_CLASP.ringSegments
    ),
    new THREE.MeshStandardMaterial({
      color: SCARF_CLASP.inset,
      roughness: SCARF_CLASP.roughness,
      metalness: SCARF_CLASP.metalness,
    })
  )
  inset.rotation.x = Math.PI / 2
  const starShape = new THREE.Shape()
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4
    const radius = i % 2 === 0 ? SCARF_CLASP.starRadius : SCARF_CLASP.starInnerRadius
    const x = Math.sin(angle) * radius
    const y = Math.cos(angle) * radius
    if (i === 0) starShape.moveTo(x, y)
    else starShape.lineTo(x, y)
  }
  starShape.closePath()
  const star = new THREE.Mesh(new THREE.ShapeGeometry(starShape), gold)
  star.position.z = SCARF_CLASP.starDepth
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(
      SCARF_CLASP.ringRadius,
      SCARF_CLASP.ringThickness,
      SCARF_CLASP.radialSegments,
      SCARF_CLASP.ringSegments
    ),
    gold
  )
  ring.position.y = SCARF_CLASP.ringHeight
  clasp.add(rim, inset, star, ring)
  return clasp
}

export function buildScarfModel(): THREE.Group {
  const scarf = new THREE.Group()
  scarf.name = 'Orbi red scarf'
  const cloth = new THREE.MeshStandardMaterial({
    color: SCARF_CLOTH.color,
    roughness: SCARF_CLOTH.roughness,
    side: THREE.DoubleSide,
  })
  const tailCloth = cloth.clone()
  tailCloth.color.setHex(SCARF_CLOTH.tailColor)
  scarf.add(new THREE.Mesh(buildBandGeometry(), cloth))
  for (const tail of SCARF_TAILS) {
    scarf.add(new THREE.Mesh(buildTailGeometry(tail), tailCloth))
  }
  const knot = new THREE.Mesh(
    new THREE.SphereGeometry(1, SCARF_KNOT.segments, SCARF_KNOT.segments),
    cloth
  )
  knot.position.set(...SCARF_KNOT.position)
  knot.scale.set(...SCARF_KNOT.scale)
  knot.rotation.z = SCARF_KNOT.rotation
  scarf.add(knot, buildCompassClasp())
  return scarf
}
