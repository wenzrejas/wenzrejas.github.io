import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.scss'
import App from './App'
import { muteFiberClockDeprecation } from './utils/threeConsole'

muteFiberClockDeprecation()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
