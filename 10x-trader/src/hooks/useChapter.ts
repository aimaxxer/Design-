import { useActiveSection } from '@/hooks/useActiveSection'

/** The eight chapters the counter, nav and mobile CTA track, in page order. */
export const SECTION_IDS = ['top', 'features', 'model', 'process', 'calculator', 'plans', 'compare', 'faq']

/** Index of the chapter currently in the middle of the card (one observer for nav, counter and mobile CTA). */
export function useChapter() {
  return useActiveSection(SECTION_IDS)
}
