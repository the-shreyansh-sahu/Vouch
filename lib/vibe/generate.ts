import { Review, LocalAreaData } from '@/types';
import { getReviewsByListingId, getLocalAreaDataByArea, getTrustResult, saveTrustResult } from '@/lib/data';
import { buildVibePrompt, SYSTEM_PROMPT } from './prompt';

const FALLBACK_VIBES: Record<string, { summary: string; confidence: number }> = {
  'Santa Monica': { summary: 'Beachside charm with lively pier, moderate noise, family-friendly days.', confidence: 85 },
  'Downtown LA': { summary: 'Urban energy, vibrant nightlife, noisy weekends, limited beach access.', confidence: 85 },
  'Pasadena': { summary: 'Quiet residential area, family-oriented, far from beach, low nightlife.', confidence: 85 }
};

// NVIDIA NIM API configuration
const NIM_API_BASE = process.env.NIM_API_BASE || 'https://integrate.api.nvidia.com/v1';
const NIM_MODEL = process.env.NIM_MODEL || 'meta/llama-3.3-70b-instruct';

export function getFastVibe(area: string, reviewCount: number): { vibeSummary: string; vibeConfidence: number } {
  const fallback = FALLBACK_VIBES[area] || { summary: 'Vibrant neighborhood with local character.', confidence: 70 };
  let confidence = fallback.confidence;
  if (reviewCount === 0) confidence = 40;
  else if (reviewCount < 2) confidence = 60;
  return { vibeSummary: fallback.summary, vibeConfidence: confidence };
}

export async function generateVibe(listingId: string, area: string): Promise<{ vibeSummary: string; vibeConfidence: number }> {
  const cached = getTrustResult(listingId);
  if (cached?.vibeSummary) {
    return { vibeSummary: cached.vibeSummary, vibeConfidence: cached.vibeConfidence };
  }

  const reviews = getReviewsByListingId(listingId);
  const localData = getLocalAreaDataByArea(area);

  if (!localData) {
    const fallback = FALLBACK_VIBES[area] || { summary: 'Area data unavailable.', confidence: 30 };
    return { vibeSummary: fallback.summary, vibeConfidence: fallback.confidence };
  }

  let confidence = 100;
  if (reviews.length === 0) confidence = 40;
  else if (reviews.length < 2) confidence = 60;
  else if (reviews.length < 4) confidence = 80;

  const apiKey = process.env.NIM_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const fallback = FALLBACK_VIBES[area] || { summary: 'Vibrant neighborhood with local character.', confidence: Math.min(confidence, 60) };
    return { vibeSummary: fallback.summary, vibeConfidence: fallback.confidence };
  }

  try {
    const prompt = buildVibePrompt(reviews, localData);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second max timeout

    const response = await fetch(`${NIM_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: NIM_MODEL,
        max_tokens: 50,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const vibeSummary = data.choices?.[0]?.message?.content?.trim() || FALLBACK_VIBES[area]?.summary || 'Neighborhood vibe unavailable.';

    return { vibeSummary, vibeConfidence: confidence };
  } catch (error) {
    const fallback = FALLBACK_VIBES[area] || { summary: 'Neighborhood vibe unavailable.', confidence: Math.min(confidence, 70) };
    return { vibeSummary: fallback.summary, vibeConfidence: fallback.confidence };
  }
}