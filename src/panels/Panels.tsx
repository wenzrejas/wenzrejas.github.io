import { useEffect } from 'react'
import { useTransition } from '@react-spring/web'
import { audio } from '@/audio/audioManager'
import { usePanelStore } from '@/store/panelStore'
import { isMapUnfolded, useViewStore } from '@/store/viewStore'
import {
  SHEET_CLOSE_SPRING,
  SHEET_SLIDE_PIXELS,
  SHEET_SPRING,
  SHEET_TILT_DEGREES,
} from './constants'
import { PANEL_SPECS } from './panelSpecs'
import IslandPanel from './shared/island-panel/IslandPanel'

const HIDDEN_SHEET = { opacity: 0, x: SHEET_SLIDE_PIXELS, rotate: SHEET_TILT_DEGREES }
const SHOWN_SHEET = { opacity: 1, x: 0, rotate: 0 }
const CLOSING_SHEET = { ...HIDDEN_SHEET, config: SHEET_CLOSE_SPRING }

export default function Panels() {
  const activePanel = usePanelStore((state) => state.activePanel)
  const transitions = useTransition(activePanel, {
    from: HIDDEN_SHEET,
    enter: SHOWN_SHEET,
    leave: CLOSING_SHEET,
    config: SHEET_SPRING,
  })

  useEffect(
    () =>
      usePanelStore.subscribe((state, previous) => {
        const isPanelChange = state.activePanel !== previous.activePanel
        if (isPanelChange && !isMapUnfolded(useViewStore.getState())) audio.play('paperPanel')
      }),
    []
  )

  return transitions((motion, key) => {
    if (!key) return null
    const { title, subtitle, splashUrl, splashZoom, isCentered, Content } = PANEL_SPECS[key]
    return (
      <IslandPanel
        title={title}
        subtitle={subtitle}
        splashUrl={splashUrl}
        splashZoom={splashZoom}
        isCentered={isCentered}
        motion={motion}
      >
        <Content />
      </IslandPanel>
    )
  })
}
