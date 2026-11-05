import { useEffect } from 'react'
import { beginDescent, dismissLoader } from '@/store/loadingStore'
import { toMilliseconds } from '@/utils/time'
import { DISSOLVE_SECONDS } from '../mist-dissolve/constants'
import { DESCENT_DELAY_SECONDS, DESCENT_SECONDS } from './constants'

const ARRIVAL_SECONDS = Math.max(DESCENT_DELAY_SECONDS + DESCENT_SECONDS, DISSOLVE_SECONDS)

export function useCloudDescent(hasSetSail: boolean) {
  useEffect(() => {
    if (!hasSetSail) return
    const descent = window.setTimeout(beginDescent, toMilliseconds(DESCENT_DELAY_SECONDS))
    const arrival = window.setTimeout(dismissLoader, toMilliseconds(ARRIVAL_SECONDS))
    return () => {
      window.clearTimeout(descent)
      window.clearTimeout(arrival)
    }
  }, [hasSetSail])
}
