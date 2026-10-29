import { useRef, useState, type ReactNode } from 'react'
import { PROJECT_PANEL_COPY } from '@/data/panelCopy'
import { useResizeEffect } from '@/hooks/useResizeEffect'
import ArrowButton from './ArrowButton'
import { CAROUSEL_EDGE_SLACK_PIXELS } from './constants'
import { useDragToScroll } from './useDragToScroll'
import './ScreenshotCarousel.scss'

interface ScreenshotCarouselProps {
  children: ReactNode
}

interface TrackEdges {
  isAtStart: boolean
  isAtEnd: boolean
}

export default function ScreenshotCarousel({ children }: ScreenshotCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState<TrackEdges>({ isAtStart: true, isAtEnd: true })

  const measureEdges = () => {
    const track = trackRef.current
    if (!track) return
    const isAtStart = track.scrollLeft <= CAROUSEL_EDGE_SLACK_PIXELS
    const isAtEnd =
      track.scrollLeft + track.clientWidth >= track.scrollWidth - CAROUSEL_EDGE_SLACK_PIXELS
    setEdges((previous) =>
      previous.isAtStart === isAtStart && previous.isAtEnd === isAtEnd
        ? previous
        : { isAtStart, isAtEnd }
    )
  }
  useResizeEffect(trackRef, measureEdges)

  const scrollToThumbnail = (shift: number) => {
    const track = trackRef.current
    const thumbnail = track?.firstElementChild
    if (!track || !(thumbnail instanceof HTMLElement)) return
    const step = thumbnail.offsetWidth + parseFloat(getComputedStyle(track).columnGap)
    const index = Math.round(track.scrollLeft / step) + shift
    track.scrollTo({ left: index * step, behavior: 'smooth' })
  }

  const { isDragging, dragHandlers } = useDragToScroll(trackRef, () => scrollToThumbnail(0))
  const isScrollable = !(edges.isAtStart && edges.isAtEnd)

  return (
    <div className="screenshot-carousel">
      <ul
        ref={trackRef}
        className={
          isDragging
            ? 'screenshot-carousel__track screenshot-carousel__track--dragging'
            : 'screenshot-carousel__track'
        }
        onScroll={measureEdges}
        {...dragHandlers}
      >
        {children}
      </ul>
      {isScrollable && (
        <>
          <ArrowButton
            direction="previous"
            label={PROJECT_PANEL_COPY.previousScreenshots}
            isDisabled={edges.isAtStart}
            onClick={() => scrollToThumbnail(-1)}
          />
          <ArrowButton
            direction="next"
            label={PROJECT_PANEL_COPY.nextScreenshots}
            isDisabled={edges.isAtEnd}
            onClick={() => scrollToThumbnail(1)}
          />
        </>
      )}
    </div>
  )
}
