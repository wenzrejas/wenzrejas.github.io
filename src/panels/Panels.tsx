import { useEffect } from 'react'
import { useTransition } from '@react-spring/web'
import { audio } from '@/audio/audioManager'
import { usePanelStore } from '@/store/panelStore'
import { isMapUnfolded, useViewStore } from '@/store/viewStore'
import { useSheetLayout } from '@/utils/layout'
import {
  SHEET_CLOSE_SPRING,
  SHEET_SLIDE_PIXELS,
  SHEET_SPRING,
  SHEET_TILT_DEGREES,
} from './constants'
import { PANEL_SPECS } from './panelSpecs'
import IslandPanel from './shared/island-panel/IslandPanel'

const HIDDEN_SHEET = { opacity: 0, x: SHEET_SLIDE_PIXELS, y: 0, rotate: SHEET_TILT_DEGREES }
const HIDDEN_BOTTOM_SHEET = { opacity: 0, x: 0, y: SHEET_SLIDE_PIXELS, rotate: 0 }
const SHOWN_SHEET = { opacity: 1, x: 0, y: 0, rotate: 0 }

export default function Panels() {
  const activePanel = usePanelStore((state) => state.activePanel)
  const isSheet = useSheetLayout()
  const hidden = isSheet ? HIDDEN_BOTTOM_SHEET : HIDDEN_SHEET
  const transitions = useTransition(activePanel, {
    from: hidden,
    enter: SHOWN_SHEET,
    leave: { ...hidden, config: SHEET_CLOSE_SPRING },
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
