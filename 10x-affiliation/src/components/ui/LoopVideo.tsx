import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/cn'

type Props = {
  /** Base name in /videos, e.g. "hero" -> /videos/hero.mp4 and /videos/posters/hero.webp */
  name: string
  /** Optional lighter encode for phones, e.g. "hero-sm" */
  mobileName?: string
  /** Describe the picture when it carries meaning; omit for decorative backgrounds. */
  alt?: string
  className?: string
  /** Above-the-fold videos start loading immediately; everything else waits until near the viewport. */
  eager?: boolean
}

/**
 * Silent, seamless loop (start frame = end frame). Plays only while on screen and
 * shows the still poster for prefers-reduced-motion users.
 */
export function LoopVideo({ name, mobileName, alt, className, eager = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true // set as a property too: React doesn't reliably reflect `muted` for autoplay
    if (reduce) {
      video.pause()
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [reduce])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload={eager ? 'auto' : 'none'}
      poster={asset(`/videos/posters/${name}.webp`)}
      className={cn('pointer-events-none', className)}
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
    >
      {mobileName && <source src={asset(`/videos/${mobileName}.mp4`)} type="video/mp4" media="(max-width: 767px)" />}
      <source src={asset(`/videos/${name}.mp4`)} type="video/mp4" />
    </video>
  )
}
