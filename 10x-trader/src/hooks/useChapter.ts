import { useActiveSection } from '@/hooks/useActiveSection'
import { proofReady } from '@/lib/placeholders'

/** The chapters the counter, nav and mobile CTA track, in page order (Proof only once it is filled in). */
export const SECTION_IDS = [
  'top',
  'problem',
  'model',
  'compare',
  'calculator',
  'process',
  'ladder',
  'features',
  'plans',
  ...(proofReady ? ['proof'] : []),
  'faq',
]

/** Index of the chapter currently in the middle of the card (one observer for nav, counter and mobile CTA). */
export function useChapter() {
  return useActiveSection(SECTION_IDS)
}
