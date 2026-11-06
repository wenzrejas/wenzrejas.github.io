import { useRef, type ReactNode } from 'react'
import { PROJECT_PANEL_COPY } from '@/data/panelCopy'
import { scrollBehavior } from '@/store/settingsStore'
import { useDragToScroll } from '../shared/drag-to-scroll/useDragToScroll'
import { useScrollEdges } from '../shared/scroll-edges/useScrollEdges'
import ArrowButton from './ArrowButton'
import './ScreenshotCarousel.scss'

interface ScreenshotCarouselProps {
  children: ReactNode
}

export default function ScreenshotCarousel({ children }: ScreenshotCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const edges = useScrollEdges(trackRef)

  const scrollToThumbnail = (shift: number) => {
    const track = trackRef.current
    const thumbnail = track?.firstElementChild
    if (!track || !(thumbnail instanceof HTMLElement)) return
    const step = thumbnail.offsetWidth + parseFloat(getComputedStyle(track).columnGap)
    const index = Math.round(track.scrollLeft / step) + shift
    track.scrollTo({ left: index * step, behavior: scrollBehavior() })
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
