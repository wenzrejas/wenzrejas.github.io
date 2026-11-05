import { useRef, useEffect } from 'react'

export interface Keys {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

const NO_KEYS: Keys = { forward: false, backward: false, left: false, right: false }

const DIRECTION_BY_KEY = new Map<string, keyof Keys>([
  ['w', 'forward'],
  ['W', 'forward'],
  ['ArrowUp', 'forward'],
  ['s', 'backward'],
  ['S', 'backward'],
  ['ArrowDown', 'backward'],
  ['a', 'left'],
  ['A', 'left'],
  ['ArrowLeft', 'left'],
  ['d', 'right'],
  ['D', 'right'],
  ['ArrowRight', 'right'],
])

export function useKeyboardInput(): React.RefObject<Keys> {
  const keys = useRef<Keys>({ ...NO_KEYS })

  useEffect(() => {
    const setKey = ({ key }: KeyboardEvent, isDown: boolean) => {
      const direction = DIRECTION_BY_KEY.get(key)
      if (direction) keys.current[direction] = isDown
    }
    const release = () => Object.assign(keys.current, NO_KEYS)
    const releaseWhenHidden = () => {
      if (document.hidden) release()
    }
    const listening = new AbortController()
    const { signal } = listening
    window.addEventListener('keydown', (event) => setKey(event, true), { signal })
    window.addEventListener('keyup', (event) => setKey(event, false), { signal })
    window.addEventListener('blur', release, { signal })
    document.addEventListener('visibilitychange', releaseWhenHidden, { signal })
    return () => listening.abort()
  }, [])

  return keys
}
