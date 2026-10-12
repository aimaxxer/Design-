import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

type ScrollContextValue = {
  /** The inset card's scroll container: the page never scrolls the document itself. */
  scroller: HTMLElement | null
  lenis: Lenis | null
  scrollTo: (target: HTMLElement | string | number) => void
}

const ScrollContext = createContext<ScrollContextValue | null>(null)

/** For components that only mount once the scroller exists (App gates them on it). */
export function useScrollContext() {
  const ctx = useContext(ScrollContext)
  if (!ctx?.scroller) throw new Error('useScrollContext needs <ScrollProvider> with a mounted scroller')
  return ctx as ScrollContextValue & { scroller: HTMLElement }
}

/**
 * Smooth scroll for the inner scroll container.
 * One animation loop for the page: Lenis runs on GSAP's ticker, and ScrollTrigger reads the
 * smoothed position, so scrubs stay locked to what the visitor sees. Lenis already maps input 1:1
 * for prefers-reduced-motion users.
 *
 * Always rendered (so the tree never re-parents); it starts working once both elements exist.
 */
export function ScrollProvider({
  scroller,
  content,
  children,
}: {
  scroller: HTMLElement | null
  content: HTMLElement | null
  children: ReactNode
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (!scroller || !content) return
    const instance = new Lenis({ wrapper: scroller, content, lerp: 0.1, autoRaf: false })
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)

    // Keyboard scrolling (arrows, space, page keys) needs focus inside the scroll container.
    if (document.activeElement === document.body) scroller.focus({ preventScroll: true })

    // Late fonts and images shift layout: re-measure every trigger once they settle.
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [scroller, content])

  const scrollTo = useCallback(
    (target: HTMLElement | string | number) => {
      if (lenis) {
        lenis.start()
        lenis.scrollTo(target, { duration: 1.4 })
        return
      }
      if (typeof target === 'number') scroller?.scrollTo({ top: target })
      else (typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target)?.scrollIntoView()
    },
    [lenis, scroller],
  )

  // Own every in-page "#section" link so the browser's native hash jump never fights Lenis.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]')
      const hash = link?.getAttribute('href')
      if (!link || !hash) return
      const target = hash === '#' || hash === '#top' ? 0 : document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target === null) return
      e.preventDefault()
      scrollTo(target)
      // Skip links and apply buttons also move keyboard focus to where they lead.
      if (target !== 0 && link.hasAttribute('data-move-focus')) target.focus({ preventScroll: true })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [scrollTo])

  const value = useMemo(() => ({ scroller, lenis, scrollTo }), [scroller, lenis, scrollTo])
  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
}
