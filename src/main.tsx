import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.scss'
import App from './App'
import { trackInputMode } from './store/inputStore'
import { muteFiberClockDeprecation } from './utils/threeConsole'

muteFiberClockDeprecation()
trackInputMode()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
