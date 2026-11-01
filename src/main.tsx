import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.scss'
import DesktopOnlyNotice from './loading/desktop-only/DesktopOnlyNotice'
import { trackInputMode } from './store/inputStore'
import { muteFiberClockDeprecation } from './utils/threeConsole'

const isNarrowScreen = !import.meta.env.DEV && window.matchMedia('(max-width: 1023px)').matches

muteFiberClockDeprecation()
trackInputMode()

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
