import { useEffect, useState } from 'react'
import { useScrollContext } from '@/providers/ScrollProvider'

/** Index of the section currently crossing the middle of the scroll container. */
export function useActiveSection(ids: string[]) {
  const { scroller } = useScrollContext()
  const [active, setActive] = useState(0)
  const key = ids.join('|')

  useEffect(() => {
    const list = key.split('|')
    const els = list.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(list.indexOf(entry.target.id))
        }
      },
      // A one-pixel band through the middle of the card: exactly one section crosses it at a time.
      { root: scroller, rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [key, scroller])

  return active
}
