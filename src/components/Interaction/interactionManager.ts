import * as THREE from 'three'
import { INTERACTION_LAYER } from './constants'

interface InteractionHandlers {
  onHover: (isHovered: boolean) => void
  onActivate?: () => void
}

class InteractionManager {
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private hits: THREE.Intersection[] = []
  private hitAreas: THREE.Object3D[] = []
  private handlers = new Map<THREE.Object3D, InteractionHandlers>()
  private canvas: HTMLCanvasElement | null = null
  private camera: THREE.Camera | null = null
  private hasPointerMoved = false
  private hovered: THREE.Object3D | null = null
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

    return () => {
      canvas.removeEventListener('pointermove', this.trackPointer)
      canvas.removeEventListener('pointerdown', this.press)
      canvas.removeEventListener('pointerleave', this.leave)
      canvas.removeEventListener('click', this.activate)
      this.hover(null)
      this.canvas = null
    }
  }

  register(hitArea: THREE.Object3D, handlers: InteractionHandlers): () => void {
    this.hitAreas.push(hitArea)
    this.handlers.set(hitArea, handlers)

    return () => {
      if (this.hovered === hitArea) this.hover(null)
      if (this.pressed === hitArea) this.pressed = null
      this.hitAreas.splice(this.hitAreas.indexOf(hitArea), 1)
      this.handlers.delete(hitArea)
    }
  }

  update(camera: THREE.Camera): void {
    this.camera = camera
    if (this.hasPointerMoved) this.hover(this.pick())
    else if (this.hovered && this.pick() !== this.hovered) this.hover(null)
    this.hasPointerMoved = false
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
    if (this.hovered) this.handlers.get(this.hovered)?.onHover(false)
    this.hovered = hitArea
    if (hitArea) this.handlers.get(hitArea)?.onHover(true)
    const isActivatable = hitArea !== null && this.handlers.get(hitArea)?.onActivate !== undefined
    if (this.canvas) this.canvas.style.cursor = isActivatable ? 'pointer' : ''
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
    this.trackPointer(event)
    this.pressed = this.pick()
  }

  private activate = (event: MouseEvent): void => {
    this.locatePointer(event)
    const hitArea = this.pick()
    if (hitArea && hitArea === this.pressed) this.handlers.get(hitArea)?.onActivate?.()
    this.pressed = null
  }

  private leave = (): void => {
    this.hasPointerMoved = false
    this.hover(null)
  }
}

export const interactions = new InteractionManager()
