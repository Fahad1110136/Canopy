import { useEffect, useState } from 'react'

/**
 * Tracks scroll position within a target element (by ref) and returns
 * a 0–1 progress value representing how far the user has scrolled past it.
 * Used to drive the CanopyTree's "growth" animation and other scroll effects.
 */
export function useScrollGrowth(ref, { start = 0, end = 600 } = {}) {
  const [progress, setProgress] = useState(0.15)

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY
      const value = (y - start) / (end - start)
      setProgress(Math.min(1, Math.max(0.15, value)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [start, end])

  return progress
}
