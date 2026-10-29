import { useEffect, useEffectEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { PANEL_COPY, PROJECT_PANEL_COPY } from '@/data/panelCopy'
import CloseButton from '../shared/close-button/CloseButton'
import ArrowButton from './ArrowButton'
import './ScreenshotPreview.scss'

interface ScreenshotPreviewProps {
  screenshots: string[]
  index: number
  onShow: (index: number) => void
  onClose: () => void
}

export default function ScreenshotPreview({
  screenshots,
  index,
  onShow,
  onClose,
}: ScreenshotPreviewProps) {
  const hasPrevious = index > 0
  const hasNext = index < screenshots.length - 1

  const showNeighbor = (shift: number) => {
    const neighbor = index + shift
    if (neighbor >= 0 && neighbor < screenshots.length) onShow(neighbor)
  }

  const handleKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose()
    else if (event.key === 'ArrowLeft') showNeighbor(-1)
    else if (event.key === 'ArrowRight') showNeighbor(1)
    else return
    event.stopPropagation()
  })

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const closeOnBackdrop = (event: MouseEvent) => {
    if (event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div
      className="screenshot-preview"
      role="dialog"
      aria-modal="true"
      aria-label={PROJECT_PANEL_COPY.screenshot}
      onClick={closeOnBackdrop}
    >
      <figure className="screenshot-preview__frame">
        <img
          className="screenshot-preview__image"
          src={screenshots[index]}
          alt={PROJECT_PANEL_COPY.screenshot}
        />
        {screenshots.length > 1 && (
          <>
            <ArrowButton
              direction="previous"
              label={PROJECT_PANEL_COPY.previousScreenshot}
              isDisabled={!hasPrevious}
              onClick={() => showNeighbor(-1)}
            />
            <ArrowButton
              direction="next"
              label={PROJECT_PANEL_COPY.nextScreenshot}
              isDisabled={!hasNext}
              onClick={() => showNeighbor(1)}
            />
          </>
        )}
        <CloseButton
          className="screenshot-preview__close"
          label={PANEL_COPY.close}
          onClose={onClose}
        />
      </figure>
    </div>,
    document.body
  )
}
