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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp')
        keys.current.forward = true
      if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown')
        keys.current.backward = true
      if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft')
        keys.current.left = true
      if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight')
        keys.current.right = true
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp')
        keys.current.forward = false
      if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown')
        keys.current.backward = false
      if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft')
        keys.current.left = false
      if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight')
        keys.current.right = false
    }
    const release = () => {
      keys.current.forward = false
      keys.current.backward = false
      keys.current.left = false
      keys.current.right = false
    }
    const releaseWhenHidden = () => {
      if (document.hidden) release()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', release)
    document.addEventListener('visibilitychange', releaseWhenHidden)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', release)
      document.removeEventListener('visibilitychange', releaseWhenHidden)
    }
  }, [])

  return keys
}
