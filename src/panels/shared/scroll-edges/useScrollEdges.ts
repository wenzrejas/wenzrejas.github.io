import { useLayoutEffect, useState, type RefObject } from 'react'
import { SCROLL_EDGE_SLACK_PIXELS } from './constants'

interface ScrollEdges {
  isAtStart: boolean
  isAtEnd: boolean
}

const UNSCROLLED: ScrollEdges = { isAtStart: true, isAtEnd: true }

export function useScrollEdges(
  trackRef: RefObject<HTMLElement | null>,
  slackPixels = SCROLL_EDGE_SLACK_PIXELS
) {
  const [edges, setEdges] = useState<ScrollEdges>(UNSCROLLED)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measureEdges = () => {
      const isAtStart = track.scrollLeft <= slackPixels
      const isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - slackPixels
      setEdges((previous) =>
        previous.isAtStart === isAtStart && previous.isAtEnd === isAtEnd
          ? previous
          : { isAtStart, isAtEnd }
      )
    }
    const observer = new ResizeObserver(measureEdges)
    observer.observe(track)
    for (const child of track.children) observer.observe(child)
    track.addEventListener('scroll', measureEdges, { passive: true })
    return () => {
      observer.disconnect()
      track.removeEventListener('scroll', measureEdges)
    }
  }, [trackRef, slackPixels])

  return edges
}
