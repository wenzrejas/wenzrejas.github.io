import { useEffect, useState } from 'react'

export function useFontLoaded(font: string) {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true
    document.fonts.load(font).finally(() => {
      if (isCurrent) setLoaded(true)
    })
    return () => {
      isCurrent = false
    }
  }, [font])

  return isLoaded
}
