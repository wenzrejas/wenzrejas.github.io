import { useEffect, useRef, type CSSProperties } from 'react'
import { JOYSTICK_KNOB_RADIUS, JOYSTICK_RADIUS } from '../constants'
import { bindJoystick } from './joystickDrag'
import './Joystick.scss'

const JOYSTICK_STYLE = {
  '--joystick-size': `${JOYSTICK_RADIUS * 2}px`,
  '--joystick-knob-size': `${JOYSTICK_KNOB_RADIUS * 2}px`,
} as CSSProperties

export default function Joystick() {
  const ringRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.experience canvas')
    const ring = ringRef.current
    const knob = knobRef.current
    if (!canvas || !ring || !knob) return
    return bindJoystick(canvas, ring, knob)
  }, [])

  return (
    <div ref={ringRef} className="joystick" style={JOYSTICK_STYLE} aria-hidden="true">
      <div ref={knobRef} className="joystick__knob" />
    </div>
  )
}
