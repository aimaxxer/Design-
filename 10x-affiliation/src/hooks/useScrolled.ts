import { useEffect, useState } from 'react'
import { useScrollContext } from '@/providers/ScrollProvider'

/** Id of the 1px marker App places near the top of the content (see App.tsx). */
export const SCROLL_SENTINEL_ID = 'scroll-sentinel'

/** True once the top-of-page sentinel has left the card, i.e. the visitor has started scrolling. */
export function useScrolled() {
  const { scroller } = useScrollContext()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById(SCROLL_SENTINEL_ID)
    if (!sentinel) return
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { root: scroller })
    io.observe(sentinel)
    return () => io.disconnect()
  }, [scroller])

  return scrolled
}
