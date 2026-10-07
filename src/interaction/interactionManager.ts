import * as THREE from 'three'
import { useShipStore } from '../store/shipStore'
import { hullGap } from '../world/ship/hullCollision'
import {
  BASE_TOUCH_REACH,
  INTERACTION_LAYER,
  KEYBOARD_TARGETS,
  SHIP_HOVER_REACH,
} from './constants'

interface InteractionHandlers {
  onHover: (isHovered: boolean) => void
  onActivate?: () => void
  shipReach?: number
  baseGap?: (x: number, z: number) => number
}

class InteractionManager {
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private hits: THREE.Intersection[] = []
  private hitAreaPosition = new THREE.Vector3()
  private hitAreas: THREE.Object3D[] = []
  private handlers = new Map<THREE.Object3D, InteractionHandlers>()
  private canvas: HTMLCanvasElement | null = null
  private camera: THREE.Camera | null = null
  private hasPointerMoved = false
  private isHeld = false
  private hovered: THREE.Object3D | null = null
  private approached: THREE.Object3D | null = null
  private highlighted = new Set<THREE.Object3D>()
  private pressed: THREE.Object3D | null = null

  constructor() {
    this.raycaster.layers.set(INTERACTION_LAYER)
  }

  install(canvas: HTMLCanvasElement): () => void {
    this.canvas = canvas
    canvas.addEventListener('pointermove', this.trackPointer)
    canvas.addEventListener('pointerdown', this.press)
    canvas.addEventListener('pointerleave', this.leave)
    canvas.addEventListener('click', this.activate)
    window.addEventListener('keydown', this.activateApproached)

    return () => {
      canvas.removeEventListener('pointermove', this.trackPointer)
      canvas.removeEventListener('pointerdown', this.press)
      canvas.removeEventListener('pointerleave', this.leave)
      canvas.removeEventListener('click', this.activate)
      window.removeEventListener('keydown', this.activateApproached)
      this.hover(null)
      this.canvas = null
    }
  }

  register(hitArea: THREE.Object3D, handlers: InteractionHandlers): () => void {
    this.hitAreas.push(hitArea)
    this.handlers.set(hitArea, handlers)

    return () => {
      if (this.hovered === hitArea) this.hover(null)
      if (this.approached === hitArea) this.approach(null)
      if (this.pressed === hitArea) this.pressed = null
      this.hitAreas.splice(this.hitAreas.indexOf(hitArea), 1)
      this.handlers.delete(hitArea)
    }
  }

  hold(): void {
    this.isHeld = true
    this.hasPointerMoved = false
    this.pressed = null
    this.hover(null)
    this.approach(null)
  }

  update(camera: THREE.Camera): void {
    this.isHeld = false
    this.camera = camera
    if (this.hasPointerMoved) this.hover(this.pick())
    else if (this.hovered && this.pick() !== this.hovered) this.hover(null)
    this.hasPointerMoved = false
    this.approach(this.closestToShip())
  }

  private closestToShip(): THREE.Object3D | null {
    const ship = useShipStore.getState()
    let closest: THREE.Object3D | null = null
    let closestDistance = Infinity
    for (const [hitArea, { shipReach, baseGap }] of this.handlers) {
      const reach = shipReach ?? (baseGap ? BASE_TOUCH_REACH : SHIP_HOVER_REACH)
      const distance = baseGap ? hullGap(baseGap) : this.centerDistance(hitArea, ship.x, ship.z)
      if (distance >= reach || distance >= closestDistance) continue
      closest = hitArea
      closestDistance = distance
    }
    return closest
  }

  private centerDistance(hitArea: THREE.Object3D, shipX: number, shipZ: number): number {
    const { x, z } = hitArea.getWorldPosition(this.hitAreaPosition)
    return Math.hypot(x - shipX, z - shipZ)
  }

  private pick(): THREE.Object3D | null {
    if (!this.camera) return null
    this.raycaster.setFromCamera(this.pointer, this.camera)
    this.hits.length = 0
    this.raycaster.intersectObjects(this.hitAreas, false, this.hits)
    return this.hits[0]?.object ?? null
  }

  private hover(hitArea: THREE.Object3D | null): void {
    if (hitArea === this.hovered) return
    const previous = this.hovered
    this.hovered = hitArea
    this.refreshHighlight(previous)
    this.refreshHighlight(hitArea)
    if (this.canvas) this.canvas.style.cursor = hitArea ? 'pointer' : ''
  }

  private approach(hitArea: THREE.Object3D | null): void {
    if (hitArea === this.approached) return
    const previous = this.approached
    this.approached = hitArea
    this.refreshHighlight(previous)
    this.refreshHighlight(hitArea)
  }

  private refreshHighlight(hitArea: THREE.Object3D | null): void {
    if (!hitArea) return
    const isHighlighted = hitArea === this.hovered || hitArea === this.approached
    if (isHighlighted === this.highlighted.has(hitArea)) return
    if (isHighlighted) this.highlighted.add(hitArea)
    else this.highlighted.delete(hitArea)
    this.handlers.get(hitArea)?.onHover(isHighlighted)
  }

  private locatePointer(event: MouseEvent): void {
    if (!this.canvas) return
    this.pointer.set(
      (event.offsetX / this.canvas.clientWidth) * 2 - 1,
      -(event.offsetY / this.canvas.clientHeight) * 2 + 1
    )
  }

  private trackPointer = (event: PointerEvent): void => {
    this.locatePointer(event)
    this.hasPointerMoved = true
  }

  private press = (event: PointerEvent): void => {
    if (this.isHeld) return
    this.trackPointer(event)
    this.pressed = this.pick()
  }

  private activate = (event: MouseEvent): void => {
    if (this.isHeld) return
    this.locatePointer(event)
    const hitArea = this.pick()
    if (hitArea && hitArea === this.pressed) this.handlers.get(hitArea)?.onActivate?.()
    this.pressed = null
  }

  private activateApproached = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' || event.repeat || this.isHeld || !this.approached) return
    if (event.target instanceof Element && event.target.closest(KEYBOARD_TARGETS)) return
    this.handlers.get(this.approached)?.onActivate?.()
  }

  private leave = (): void => {
    this.hasPointerMoved = false
    this.hover(null)
  }
}

export const interactions = new InteractionManager()
