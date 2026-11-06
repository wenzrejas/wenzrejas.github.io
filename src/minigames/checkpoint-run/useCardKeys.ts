import { useEffect, useEffectEvent } from 'react'
import { audio } from '@/audio/audioManager'
import { KEYBOARD_TARGETS } from '@/interaction/constants'
import { isWorldInView } from '@/store/viewStore'

export function useCardKeys(
  isOpen: boolean,
  onEnter: () => void,
  onEscape: () => void,
  enterKeyToo?: string
) {
  const answer = useEffectEvent((event: KeyboardEvent) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
    if (!isWorldInView()) return
    if (event.key === 'Escape') {
      onEscape()
      return
    }
    if (event.target instanceof Element && event.target.closest(KEYBOARD_TARGETS)) return
    if (event.key === 'Enter' || event.key.toLowerCase() === enterKeyToo) {
      audio.play('click')
      onEnter()
    }
  })

  useEffect(() => {
    if (!isOpen) return
    const listen = (event: KeyboardEvent) => answer(event)
    document.addEventListener('keydown', listen)
    return () => document.removeEventListener('keydown', listen)
  }, [isOpen])
}
