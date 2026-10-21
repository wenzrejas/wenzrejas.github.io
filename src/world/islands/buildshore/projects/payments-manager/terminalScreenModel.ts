import * as THREE from 'three'
import { onceFor } from '@/utils/cache'
import { displayColorOf } from '@/utils/color'
import { floatDefines } from '@/utils/glsl'
import {
  CHECK_DISC_REACH,
  CHECK_STROKE_WIDTH,
  SCREEN_APPROVED_COLOR,
  SCREEN_CHECK_COLOR,
  SCREEN_IDLE_COLOR,
} from './constants'
import TERMINAL_SCREEN_VERT from './shaders/terminalScreen.vert.glsl'
import TERMINAL_SCREEN_FRAG from './shaders/terminalScreen.frag.glsl'

export interface ScreenUniforms {
  uCheck: { value: number }
  uStroke: { value: number }
}

const approvalScreens = new WeakMap<THREE.Mesh, ScreenUniforms>()

export const dressTerminalScreen = (screen: THREE.Mesh) =>
  onceFor(approvalScreens, screen, () => {
    screen.geometry.computeBoundingBox()
    const bounds = screen.geometry.boundingBox!
    const uniforms: ScreenUniforms = { uCheck: { value: 0 }, uStroke: { value: 0 } }
    screen.material = new THREE.ShaderMaterial({
      vertexShader: TERMINAL_SCREEN_VERT,
      fragmentShader: TERMINAL_SCREEN_FRAG,
      defines: floatDefines({ DISC_REACH: CHECK_DISC_REACH, STROKE_WIDTH: CHECK_STROKE_WIDTH }),
      uniforms: {
        ...uniforms,
        uIdleColor: { value: displayColorOf(SCREEN_IDLE_COLOR) },
        uApprovedColor: { value: displayColorOf(SCREEN_APPROVED_COLOR) },
        uCheckColor: { value: displayColorOf(SCREEN_CHECK_COLOR) },
        uHalfHeight: { value: (bounds.max.y - bounds.min.y) / 2 },
      },
    })
    return uniforms
  })

export function updateTerminalScreen(screen: ScreenUniforms, check: number, stroke: number): void {
  screen.uCheck.value = check
  screen.uStroke.value = stroke
}
