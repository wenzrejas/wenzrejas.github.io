import { useId } from 'react'

export const useSvgId = () => useId().replace(/[^\w-]/g, '')
