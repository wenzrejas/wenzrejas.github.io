import { useEffect, useState } from 'react'

export function useFontLoaded(font: string) {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    let isCurrent = true
    const markLoaded = () => {
      if (isCurrent) setLoaded(true)
    }
    void document.fonts.load(font).then(markLoaded, markLoaded)
    return () => {
      isCurrent = false
    }
  }, [font])

  return isLoaded
}
