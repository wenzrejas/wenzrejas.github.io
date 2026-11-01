import { create } from 'zustand'

type InputMode = 'keyboard' | 'touch'

const finePointer = window.matchMedia('(any-pointer: fine)')

const TEXT_ENTRY = 'input, textarea, [contenteditable]'

export const hasFinePointer = () => finePointer.matches

interface InputState {
  mode: InputMode
  joystick: { x: number; y: number; isActive: boolean }
}

export const useInputStore = create<InputState>(() => ({
  mode: hasFinePointer() ? 'keyboard' : 'touch',
  joystick: { x: 0, y: 0, isActive: false },
}))

function switchTo(mode: InputMode) {
  if (useInputStore.getState().mode !== mode) useInputStore.setState({ mode })
}

const followPress = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse') switchTo('touch')
}

const followMouse = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') switchTo('keyboard')
}

const followKey = (event: KeyboardEvent) => {
  if (event.target instanceof Element && event.target.closest(TEXT_ENTRY)) return
  switchTo('keyboard')
}

export function trackInputMode() {
  const root = document.documentElement
  root.dataset.input = useInputStore.getState().mode
  useInputStore.subscribe(({ mode }) => {
    root.dataset.input = mode
  })

  window.addEventListener('pointerdown', followPress, true)
  window.addEventListener('pointermove', followMouse, true)
  window.addEventListener('keydown', followKey, true)
}
