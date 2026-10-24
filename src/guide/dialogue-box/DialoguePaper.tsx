import { useMemo, useRef, useState } from 'react'
import { useResizeEffect } from '@/hooks/useResizeEffect'
import { PAPER_MIN_HEIGHT, PAPER_WIDTH } from './constants'
import { paperOutlines, paperStretch, tabFoldOf } from './paperOutline'

export default function DialoguePaper({ isTailLeft }: { isTailLeft: boolean }) {
  const paperRef = useRef<SVGSVGElement>(null)
  const [stretch, setStretch] = useState(0)
  const outlines = useMemo(() => paperOutlines(stretch), [stretch])

  useResizeEffect(paperRef, (_, height) => {
    const box = paperRef.current?.parentElement
    if (box) setStretch(paperStretch(height, parseFloat(getComputedStyle(box).minHeight)))
  })

  return (
    <svg
      ref={paperRef}
      className="dialogue-box__paper"
      viewBox={`0 0 ${PAPER_WIDTH} ${PAPER_MIN_HEIGHT + stretch}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="dialogue-box__shadow" d={outlines.shadow} />
      <path className="dialogue-box__sheet" d={outlines.sheet} />
      <path className="dialogue-box__crease" d={tabFoldOf(isTailLeft)} />
    </svg>
  )
}
