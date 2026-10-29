import { PROJECT_PANEL_COPY } from '@/data/panelCopy'

interface GalleryShotProps {
  url?: string
  onExpand: () => void
}

export default function GalleryShot({ url, onExpand }: GalleryShotProps) {
  return (
    <div className="project-gallery__shot">
      {url ? (
        <button
          type="button"
          className="project-gallery__expand"
          aria-label={PROJECT_PANEL_COPY.expandScreenshot}
          onClick={onExpand}
        >
          <img
            className="project-gallery__image"
            src={url}
            alt={PROJECT_PANEL_COPY.screenshot}
            draggable={false}
          />
        </button>
      ) : (
        PROJECT_PANEL_COPY.screenshot
      )}
    </div>
  )
}
