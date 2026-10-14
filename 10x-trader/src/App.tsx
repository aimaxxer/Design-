import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCallback, useState } from 'react'
import { MobileCta, PageIndicator, ScrollHint, TopNav } from '@/components/overlays/Overlays'
import { Benefits } from '@/components/sections/Benefits'
import { Calculator } from '@/components/sections/Calculator'
import { Comparison } from '@/components/sections/Comparison'
import { Faq } from '@/components/sections/Faq'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { Ladder } from '@/components/sections/Ladder'
import { Model } from '@/components/sections/Model'
import { Plans } from '@/components/sections/Plans'
import { Problem } from '@/components/sections/Problem'
import { Process } from '@/components/sections/Process'
import { Proof } from '@/components/sections/Proof'
import { useChapter } from '@/hooks/useChapter'
import { SCROLL_SENTINEL_ID } from '@/hooks/useScrolled'
import { ScrollProvider } from '@/providers/ScrollProvider'

function Overlays() {
  const active = useChapter()
  return (
    <>
      <TopNav active={active} />
      <PageIndicator active={active} />
      <ScrollHint />
      <MobileCta active={active} />
    </>
  )
}

/**
 * The framework's inset shell: a white margin around a rounded card. The page scrolls inside the
 * card (hidden scrollbar); the nav notch and the corner labels sit on top of it.
 */
export default function App() {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const [content, setContent] = useState<HTMLDivElement | null>(null)
  const ready = !!scroller && !!content

  // Point every ScrollTrigger at the card's scroller before any section mounts and creates one.
  const scrollerRef = useCallback((el: HTMLDivElement | null) => {
    if (el) ScrollTrigger.defaults({ scroller: el })
    setScroller(el)
  }, [])

  return (
    <div className="h-[100dvh] bg-white p-3 sm:p-5">
      <div className="relative isolate h-full w-full overflow-hidden rounded-[28px] bg-white sm:rounded-[36px]">
        <ScrollProvider scroller={scroller} content={content}>
          <div ref={scrollerRef} tabIndex={-1} className="no-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden outline-none">
            <div ref={setContent} className="relative">
              <span id={SCROLL_SENTINEL_ID} aria-hidden className="pointer-events-none absolute left-0 top-10 h-px w-px" />
              <a
                href="#problem"
                data-move-focus
                className="chamfer-10 absolute left-4 top-4 z-50 -translate-y-24 bg-navy px-4 py-3 text-[12px] font-medium text-white focus:translate-y-0"
              >
                Skip to content
              </a>
              {ready && (
                <>
                  <main>
                    <Hero />
                    <Problem />
                    <Model />
                    <Comparison />
                    <Calculator />
                    <Process />
                    <Ladder />
                    <Benefits />
                    <Plans />
                    <Proof />
                    <Faq />
                  </main>
                  <Footer />
                </>
              )}
            </div>
          </div>
          {ready && <Overlays />}
        </ScrollProvider>
      </div>
    </div>
  )
}
