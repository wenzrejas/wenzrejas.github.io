import { useEffect, useEffectEvent, useState, type RefObject } from 'react'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { holdSeconds, messageAt, progressCeiling } from './loadingMessages'
import { advanceProgress } from './loadingProgress'

interface MessageQueue {
  shown: number
  fading: number | null
  isSettled: boolean
}

export function useLoadingPace(
  target: number,
  canWrite: boolean,
  gaugeRef: RefObject<HTMLElement | null>
) {
  const [latestMessage, setLatestMessage] = useState(0)
  const [messages, setMessages] = useState<MessageQueue>({
    shown: 0,
    fading: null,
    isSettled: false,
  })

  if (messages.isSettled && latestMessage > messages.shown) {
    setMessages({ shown: messages.shown + 1, fading: messages.shown, isSettled: false })
  }

  const readGoal = useEffectEvent(() =>
    Math.min(target, progressCeiling(messages.shown, messages.isSettled))
  )

  useEffect(() => {
    let shown = 0
    let previousTime = performance.now()
    let frame = 0
    const step = (time: number) => {
      const seconds = Math.min(Math.max(0, (time - previousTime) / 1000), MAX_FRAME_SECONDS)
      previousTime = time
      shown = advanceProgress(shown, readGoal(), seconds)
      gaugeRef.current?.style.setProperty('--progress', shown.toFixed(4))
      setLatestMessage(messageAt(shown))
      if (shown < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [gaugeRef])

  const { shown, fading } = messages
  useEffect(() => {
    if (!canWrite) return
    const timer = window.setTimeout(
      () => setMessages((current) => ({ ...current, isSettled: true })),
      holdSeconds(shown, fading !== null) * 1000
    )
    return () => window.clearTimeout(timer)
  }, [canWrite, shown, fading])

  return messages
}
