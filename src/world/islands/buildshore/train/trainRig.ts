import * as THREE from 'three'
import { wrapAngle } from '@/utils/math'
import { nodeNamed, nodesNamed } from '@/utils/meshes'
import { CONNECTING_ROD_ROLE, CRANK_PIN_NAME, TRAIN_ROUTE_NODE } from './constants'
import { buildRailRoute, sampleRoute, type RailRoute, type RailTrack } from './railRoute'
import type { TrainMotion } from './trainMotion'

interface RailwayVehicle {
  node: string
  distance_behind_locomotive: number
  wheel_axles: { node: string; radius: number; axis: number[]; position_vehicle_local: number[] }[]
  bogies: { node: string; position_vehicle_local: number[] }[]
}

interface RailwayPlan {
  space: { parent_node: string }
  route: RailTrack
  stations: { distance: number }[]
  train: { root_node: string; coupler_nodes: string[]; vehicles: RailwayVehicle[] }
}

interface Axle {
  node: THREE.Object3D
  axis: THREE.Vector3
  radius: number
  offset: number
}

interface Bogie {
  node: THREE.Object3D
  offset: number
}

interface Vehicle {
  node: THREE.Object3D
  behind: number
  front: number
  rear: number
  bogies: Bogie[]
  axles: Axle[]
}

interface Coupler {
  node: THREE.Object3D
  behind: number
  height: number
}

interface CrankFollower {
  node: THREE.Object3D
  hub: THREE.Vector3
  rest: THREE.Vector3
  radius: number
}

export interface TrainRig {
  route: RailRoute
  stationDistance: number
  routeToRoot: THREE.Matrix4
  rootToModel: THREE.Matrix4
  locomotive: Vehicle
  vehicles: Vehicle[]
  couplers: Coupler[]
  cranks: CrankFollower[]
}

const _front = new THREE.Vector3()
const _rear = new THREE.Vector3()
const _point = new THREE.Vector3()
const _tangent = new THREE.Vector3()

const yawOf = (direction: THREE.Vector3) => Math.atan2(-direction.z, direction.x)

// ── Rig ───────────────────────────────────────────────────────────────────────

function findVehicle(model: THREE.Object3D, entry: RailwayVehicle): Vehicle | null {
  const node = nodeNamed(model, entry.node)
  if (!node) return null

  const bogies = entry.bogies.flatMap(({ node: name, position_vehicle_local }) => {
    const bogie = nodeNamed(model, name)
    return bogie ? [{ node: bogie, offset: position_vehicle_local[0] }] : []
  })
  const axles = entry.wheel_axles.flatMap(
    ({ node: name, radius, axis, position_vehicle_local }) => {
      const axle = nodeNamed(model, name)
      return axle
        ? [
            {
              node: axle,
              axis: new THREE.Vector3().fromArray(axis),
              radius,
              offset: position_vehicle_local[0],
            },
          ]
        : []
    }
  )
  const trackOffsets = (bogies.length > 0 ? bogies : axles).map(({ offset }) => offset)

  return {
    node,
    behind: entry.distance_behind_locomotive,
    front: Math.max(...trackOffsets),
    rear: Math.min(...trackOffsets),
    bogies,
    axles,
  }
}

function findCranks({ node, axles }: Vehicle): CrankFollower[] {
  if (axles.length === 0) return []
  return node.children
    .filter(
      (child) => child.userData.role === CONNECTING_ROD_ROLE || child.name.includes(CRANK_PIN_NAME)
    )
    .map((follower) => {
      const hub = axles.reduce((nearest, axle) =>
        Math.abs(axle.node.position.x - follower.position.x) <
        Math.abs(nearest.node.position.x - follower.position.x)
          ? axle
          : nearest
      )
      return {
        node: follower,
        hub: hub.node.position.clone(),
        rest: follower.position.clone(),
        radius: hub.radius,
      }
    })
}

export function findTrainRig(model: THREE.Object3D): TrainRig | null {
  const routeJson = model.getObjectByName(TRAIN_ROUTE_NODE)?.userData.route_json
  if (typeof routeJson !== 'string') return null

  const plan = JSON.parse(routeJson) as RailwayPlan
  const mainIsland = nodeNamed(model, plan.space.parent_node)
  const root = nodeNamed(model, plan.train.root_node)
  const vehicles = plan.train.vehicles
    .map((entry) => findVehicle(model, entry))
    .filter((vehicle) => vehicle !== null)
  if (!mainIsland || !root || vehicles.length === 0) return null

  model.updateMatrixWorld(true)
  const toRoot = root.matrixWorld.clone().invert()
  const locomotive = vehicles.reduce((first, vehicle) =>
    vehicle.behind < first.behind ? vehicle : first
  )
  const couplers = nodesNamed(model, plan.train.coupler_nodes).map((node) => ({
    node,
    behind: locomotive.node.position.x - node.position.x,
    height: node.position.y,
  }))

  return {
    route: buildRailRoute(plan.route),
    stationDistance: plan.stations[0].distance,
    routeToRoot: toRoot.clone().multiply(mainIsland.matrixWorld),
    rootToModel: model.matrixWorld.clone().invert().multiply(root.matrixWorld),
    locomotive,
    vehicles,
    couplers,
    cranks: findCranks(locomotive),
  }
}

// ── Pose ──────────────────────────────────────────────────────────────────────

function sampleInRoot(
  rig: TrainRig,
  distance: number,
  position: THREE.Vector3,
  tangent: THREE.Vector3
): void {
  sampleRoute(rig.route, distance, position, tangent)
  position.applyMatrix4(rig.routeToRoot)
  tangent.transformDirection(rig.routeToRoot)
}

function poseVehicle(rig: TrainRig, vehicle: Vehicle, motion: TrainMotion): void {
  const distance = motion.distance - vehicle.behind
  sampleInRoot(rig, distance + vehicle.front, _front, _tangent)
  sampleInRoot(rig, distance + vehicle.rear, _rear, _tangent)
  const yaw = yawOf(_point.subVectors(_front, _rear))
  vehicle.node.position.lerpVectors(_rear, _front, -vehicle.rear / (vehicle.front - vehicle.rear))
  vehicle.node.rotation.set(0, yaw, 0)

  for (const bogie of vehicle.bogies) {
    sampleInRoot(rig, distance + bogie.offset, _point, _tangent)
    bogie.node.rotation.set(0, wrapAngle(yawOf(_tangent) - yaw), 0)
  }
  for (const axle of vehicle.axles) {
    axle.node.quaternion.setFromAxisAngle(axle.axis, motion.travel / axle.radius)
  }
}

function poseCoupler(rig: TrainRig, coupler: Coupler, motion: TrainMotion): void {
  sampleInRoot(rig, motion.distance - coupler.behind, _point, _tangent)
  coupler.node.position.set(_point.x, _point.y + coupler.height, _point.z)
  coupler.node.rotation.set(0, yawOf(_tangent), 0)
}

function poseCrank(crank: CrankFollower, travel: number): void {
  const angle = travel / crank.radius
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const offsetX = crank.rest.x - crank.hub.x
  const offsetY = crank.rest.y - crank.hub.y
  crank.node.position.set(
    crank.hub.x + offsetX * cos + offsetY * sin,
    crank.hub.y - offsetX * sin + offsetY * cos,
    crank.rest.z
  )
}

export function poseTrain(rig: TrainRig, motion: TrainMotion): void {
  for (const vehicle of rig.vehicles) poseVehicle(rig, vehicle, motion)
  for (const coupler of rig.couplers) poseCoupler(rig, coupler, motion)
  for (const crank of rig.cranks) poseCrank(crank, motion.travel)
}

export function pointOnVehicle(
  rig: TrainRig,
  vehicle: Vehicle,
  local: THREE.Vector3Like,
  out: THREE.Vector3
): THREE.Vector3 {
  return out
    .set(local.x, local.y, local.z)
    .applyQuaternion(vehicle.node.quaternion)
    .add(vehicle.node.position)
    .applyMatrix4(rig.rootToModel)
}
