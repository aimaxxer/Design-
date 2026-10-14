import { proof } from '@/content'

/** True while a copy value still holds a "[...]" placeholder waiting for real figures. */
export const hasPlaceholder = (value: string) => value.includes('[')

/**
 * The Proof section ships only once every figure and testimonial is real. Until then it renders
 * nothing and drops out of the chapter list, so the counter and nav never point at it.
 */
export const proofReady = ![
  proof.title,
  ...proof.stats.map((s) => s.value),
  ...proof.testimonials.flatMap((t) => [t.name, t.country, t.since, t.from, t.to, t.quote]),
].some(hasPlaceholder)
