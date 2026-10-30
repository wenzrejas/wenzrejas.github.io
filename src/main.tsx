import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.scss'
import DesktopOnlyNotice from './loading/desktop-only/DesktopOnlyNotice'
import { muteFiberClockDeprecation } from './utils/threeConsole'

const isNarrowScreen = window.matchMedia('(max-width: 1023px)').matches

muteFiberClockDeprecation()

const root = createRoot(document.getElementById('root')!)

if (isNarrowScreen) {
  root.render(
    <StrictMode>
      <DesktopOnlyNotice />
    </StrictMode>
  )
} else {
  import('./App').then(({ default: App }) =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  )
}
