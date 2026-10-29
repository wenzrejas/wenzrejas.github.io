import { useState } from 'react'
import { earnAchievement } from '@/store/achievementStore'
import { GALLERY_MIN_SLOT_COUNT } from './constants'
import GalleryShot from './GalleryShot'
import ScreenshotCarousel from './ScreenshotCarousel'
import ScreenshotPreview from './ScreenshotPreview'
import './ProjectGallery.scss'

interface ProjectGalleryProps {
  screenshots: string[]
}

export default function ProjectGallery({ screenshots }: ProjectGalleryProps) {
  const [previewIndex, showPreview] = useState<number | null>(null)
  const slotCount = Math.max(GALLERY_MIN_SLOT_COUNT, screenshots.length)
  const thumbnailUrls = Array.from({ length: slotCount - 1 }, (_, i) => screenshots[i + 1])

  const expandShot = (index: number) => {
    showPreview(index)
    earnAchievement('closerLook')
  }

  return (
    <>
      <div className="project-gallery">
        <GalleryShot url={screenshots[0]} onExpand={() => expandShot(0)} />
        <ScreenshotCarousel>
          {thumbnailUrls.map((url, i) => (
            <li key={i}>
              <GalleryShot url={url} onExpand={() => expandShot(i + 1)} />
            </li>
          ))}
        </ScreenshotCarousel>
      </div>
      {previewIndex !== null && (
        <ScreenshotPreview
          screenshots={screenshots}
          index={previewIndex}
          onShow={showPreview}
          onClose={() => showPreview(null)}
        />
      )}
    </>
  )
}
