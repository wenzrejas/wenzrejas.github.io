import { useRef } from 'react'
import { CONTACT_COPY } from '@/data/panelCopy'
import { WEBGL_FAILURE_COPY } from '@/data/webglFailureCopy'
import { SHIP_IMAGE_URL } from '@/loading/constants'
import MapImagery from '@/loading/map-imagery/MapImagery'
import MapPaper from '@/loading/map-paper/MapPaper'
import { CONTACT_LINKS } from '@/panels/contact/constants'
import Cartouche from '@/panels/shared/cartouche/Cartouche'
import SocialLinks from '@/panels/shared/social-links/SocialLinks'
import { useIsTouchInput } from '@/store/inputStore'
import { useSheetLayout } from '@/utils/layout'
import './WebglFailureScreen.scss'

const reloadPage = () => window.location.reload()

export default function WebglFailureScreen() {
  const isSmallScreen = useSheetLayout()
  const isTouch = useIsTouchInput()
  const paperRef = useRef<HTMLCanvasElement>(null)

  return (
    <main className="webgl-failure">
      <div className="webgl-failure__map">
        <MapPaper ref={paperRef} />
        {!isSmallScreen && <MapImagery isCharted />}
      </div>
      <div className="webgl-failure__notice">
        <div className="webgl-failure__heading">
          <img className="webgl-failure__ship" src={SHIP_IMAGE_URL} alt="" draggable={false} />
          <h1 className="webgl-failure__title">{WEBGL_FAILURE_COPY.title}</h1>
        </div>
        <div className="webgl-failure__details">
          <p className="webgl-failure__message" role="alert">
            {isTouch ? WEBGL_FAILURE_COPY.touchMessage : WEBGL_FAILURE_COPY.message}
          </p>
          <button type="button" className="webgl-failure__retry" onClick={reloadPage}>
            <Cartouche />
            <span className="webgl-failure__retry-label">{WEBGL_FAILURE_COPY.tryAgain}</span>
          </button>
          <section className="webgl-failure__links">
            <h2 className="webgl-failure__links-heading">{CONTACT_COPY.linksHeading}</h2>
            <SocialLinks links={CONTACT_LINKS} />
          </section>
        </div>
      </div>
    </main>
  )
}
