import type { Medal } from '../checkpointRun'
import { MEDAL_ART_URLS } from './constants'
import './MedalDisc.scss'

interface MedalDiscProps {
  medal: Medal | null
  label: string
}

export default function MedalDisc({ medal, label }: MedalDiscProps) {
  if (!medal) return <span className="medal-disc medal-disc--empty" role="img" aria-label={label} />
  return <img className="medal-disc" src={MEDAL_ART_URLS[medal]} alt={label} draggable={false} />
}
