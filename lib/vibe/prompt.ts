import { Review, LocalAreaData } from '@/types';

export function buildVibePrompt(reviews: Review[], localData: LocalAreaData): string {
  const reviewExcerpts = reviews
    .slice(0, 3)
    .map(r => `"${r.text.substring(0, 100)}..."`)
    .join('\n');

  return `Reviews:\n${reviewExcerpts}\n\nLocal data: noise=${localData.noiseLevel}, nightlife=${localData.nightlifeDensity}, distance_to_beach=${localData.distanceToBeachKm}km, family_share=${localData.familyGuestPct}%`;
}

export const SYSTEM_PROMPT = `You write a single honest one-line neighborhood summary (max 15 words) for a rental listing, based only on the data given. Avoid marketing language.`;