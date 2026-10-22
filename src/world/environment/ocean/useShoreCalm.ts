import { useEffect } from 'react'
import { useCoastStore } from '@/store/coastStore'
import { paintShoreCalm } from './shoreCalmModel'

export function useShoreCalm() {
  useEffect(() => {
    paintShoreCalm(useCoastStore.getState().waterlines)
    return useCoastStore.subscribe((state, previous) => {
      if (state.waterlines !== previous.waterlines) paintShoreCalm(state.waterlines)
    })
  }, [])
}
