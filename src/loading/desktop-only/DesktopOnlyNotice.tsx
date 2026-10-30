import { useRef } from 'react'
import { LOADING_COPY } from '@/data/loadingCopy'
import { HANDWRITING_FONT, SHIP_IMAGE_URL } from '../constants'
import MapPaper from '../map-paper/MapPaper'
import { useFontLoaded } from '../useFontLoaded'
import '../LoadingScreen.scss'
import './DesktopOnlyNotice.scss'

export default function DesktopOnlyNotice() {
  const paperRef = useRef<HTMLCanvasElement>(null)
  const isFontLoaded = useFontLoaded(HANDWRITING_FONT)

  return (
    <div className="loading-screen">
      <div className="loading-screen__map">
        <MapPaper ref={paperRef} />
        <img className="loading-screen__ship" src={SHIP_IMAGE_URL} alt="" draggable={false} />
      </div>
      <div className="loading-screen__caption">
        {isFontLoaded && <p className="desktop-only-message">{LOADING_COPY.desktopOnly}</p>}
      </div>
    </div>
  )
}
