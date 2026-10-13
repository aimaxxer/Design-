import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Elements marked [data-reveal] inside the section rise into place as they enter the card,
 * in small batches so a row of cards staggers. Reduced motion: everything is simply there.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const els = scope.current?.querySelectorAll<HTMLElement>('[data-reveal]')
      if (!els?.length) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(els, { autoAlpha: 0, y: 28 })
        ScrollTrigger.batch(els, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
        })
      })
      return () => mm.revert()
    },
    { scope },
  )
}
