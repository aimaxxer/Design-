import { useActiveSection } from '@/hooks/useActiveSection'

/** The six chapters the counter and nav track, in page order. */
export const SECTION_IDS = ['top', 'problems', 'results', 'calculator', 'trader', 'apply']

/** Index of the chapter currently in the middle of the card (one observer for nav, counter and mobile CTA). */
export function useChapter() {
  return useActiveSection(SECTION_IDS)
}
