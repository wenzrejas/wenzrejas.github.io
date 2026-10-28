import type { CSSProperties } from 'react'
import { alphaMaskUrl } from '../procedural/alphaMask'
import { MIST_HEIGHT, MIST_WIDTH } from './constants'
import { mistAlphas, type MistAlphas } from './mist'

export interface MistMasks {
  top: string
  bottom: string
}

let masks: MistMasks | null = null

export function cacheMistMasks({ top, bottom }: MistAlphas): MistMasks {
  masks ??= {
    top: alphaMaskUrl(top, MIST_WIDTH, MIST_HEIGHT),
    bottom: alphaMaskUrl(bottom, MIST_WIDTH, MIST_HEIGHT),
  }
  return masks
}

const mistMasks = () => masks ?? cacheMistMasks(mistAlphas())

export function mistMaskStyle(): CSSProperties {
  const { top, bottom } = mistMasks()
  return { '--mist-top': top, '--mist-bottom': bottom } as CSSProperties
}
