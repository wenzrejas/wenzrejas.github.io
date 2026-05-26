import { useRef, useEffect } from 'react'

export interface Keys {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

export function useKeyboardInput(): React.RefObject<Keys> {
  const keys = useRef<Keys>({ forward: false, backward: false, left: false, right: false })

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.current.forward = true
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.current.backward = true
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.current.left = true
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.current.right = true
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.current.forward = false
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.current.backward = false
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.current.left = false
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys
}
