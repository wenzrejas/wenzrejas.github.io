import * as THREE from 'three'
import { useShipStore } from '../store/shipStore'
import { useInputStore } from '../store/inputStore'
import { hullGap } from '@/world/ship/hullCollision'
import {
  BASE_TOUCH_REACH,
  INTERACTION_LAYER,
  KEYBOARD_TARGETS,
  SHIP_HOVER_REACH,
  TOUCH_PICK_RADIUS,
} from './constants'

interface InteractionHandlers {
  onHover: (isHovered: boolean) => void
  onActivate?: () => void
  shipReach?: number
  baseGap?: (x: number, z: number) => number
}

const isTouchPointer = ({ pointerType }: PointerEvent) => pointerType !== 'mouse'

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
  private pressedPointerId: number | null = null
  private isTouchPress = false

  constructor() {
    this.raycaster.layers.set(INTERACTION_LAYER)
  }

  install(canvas: HTMLCanvasElement): () => void {
    this.canvas = canvas
    canvas.addEventListener('pointermove', this.trackPointer)
    canvas.addEventListener('pointerdown', this.press)
    canvas.addEventListener('pointerleave', this.leave)
    canvas.addEventListener('pointercancel', this.cancelPress)
    canvas.addEventListener('click', this.activate)
    window.addEventListener('keydown', this.activateApproached)

    return () => {
      canvas.removeEventListener('pointermove', this.trackPointer)
      canvas.removeEventListener('pointerdown', this.press)
      canvas.removeEventListener('pointerleave', this.leave)
      canvas.removeEventListener('pointercancel', this.cancelPress)
      canvas.removeEventListener('click', this.activate)
      window.removeEventListener('keydown', this.activateApproached)
      this.hold()
      this.canvas = null
      this.camera = null
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
    this.pressedPointerId = null
    this.hover(null)
    this.approach(null)
  }

  update(camera: THREE.Camera): void {
    this.isHeld = false
    this.camera = camera
    if (useInputStore.getState().joystick.isActive) this.hover(null)
    else if (this.hasPointerMoved) this.hover(this.pick())
    else if (this.hovered && this.pick() !== this.hovered) this.hover(null)
    this.hasPointerMoved = false
    this.approach(this.closestToShip())
  }

  isMarkerAt(event: PointerEvent): boolean {
    if (this.isHeld) return false
    this.locatePointer(event.clientX, event.clientY)
    return this.pick(isTouchPointer(event)) !== null
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

  private pick(allowTouchFallback = false): THREE.Object3D | null {
    if (!this.camera) return null
    this.raycaster.setFromCamera(this.pointer, this.camera)
    this.hits.length = 0
    this.raycaster.intersectObjects(this.hitAreas, false, this.hits)
    const direct = this.hits[0]?.object
    if (direct) return direct
    if (!allowTouchFallback || !this.canvas) return null

    const bounds = this.canvas.getBoundingClientRect()
    let nearest: THREE.Object3D | null = null
    let nearestDistance = TOUCH_PICK_RADIUS
    for (const hitArea of this.hitAreas) {
      if (!hitArea.visible) continue
      const projected = hitArea.getWorldPosition(this.hitAreaPosition).project(this.camera)
      if (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1)
        continue
      const distance = Math.hypot(
        ((projected.x - this.pointer.x) * bounds.width) / 2,
        ((projected.y - this.pointer.y) * bounds.height) / 2
      )
      if (distance > nearestDistance) continue
      nearest = hitArea
      nearestDistance = distance
    }
    return nearest
  }

  private hover(hitArea: THREE.Object3D | null): void {
    if (hitArea === this.hovered) return
    const previous = this.hovered
    this.hovered = hitArea
    this.refreshHighlight(previous)
    this.refreshHighlight(hitArea)
    if (this.canvas) this.canvas.style.cursor = hitArea ? 'var(--cursor-hand)' : ''
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

  private locatePointer(clientX: number, clientY: number): void {
    if (!this.canvas) return
    const bounds = this.canvas.getBoundingClientRect()
    this.pointer.set(
      ((clientX - bounds.left) / bounds.width) * 2 - 1,
      -((clientY - bounds.top) / bounds.height) * 2 + 1
    )
  }

  private trackPointer = (event: PointerEvent): void => {
    this.locatePointer(event.clientX, event.clientY)
    this.hasPointerMoved = true
  }

  private press = (event: PointerEvent): void => {
    if (this.isHeld) return
    this.trackPointer(event)
    this.isTouchPress = isTouchPointer(event)
    this.pressedPointerId = event.pointerId
    this.pressed = this.pick(this.isTouchPress)
  }

  private activate = (event: MouseEvent): void => {
    if (this.isHeld) return
    if (event instanceof PointerEvent && event.pointerId !== this.pressedPointerId) return
    this.locatePointer(event.clientX, event.clientY)
    const hitArea = this.pick(this.isTouchPress)
    if (hitArea && hitArea === this.pressed) this.handlers.get(hitArea)?.onActivate?.()
    this.pressed = null
    this.pressedPointerId = null
  }

  private cancelPress = (event: PointerEvent): void => {
    if (event.pointerId !== this.pressedPointerId) return
    this.pressed = null
    this.pressedPointerId = null
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
