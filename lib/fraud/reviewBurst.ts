import { Review } from '@/types';
import { getReviewsByListingId } from '@/lib/data';

export function checkReviewBurst(listingId: string, allReviews?: Review[]): { hasBurst: boolean; score: number; flag?: string } {
  const reviews = allReviews || getReviewsByListingId(listingId);

  if (reviews.length < 3) {
    return { hasBurst: false, score: 0 };
  }

  const fiveStarReviews = reviews.filter(r => r.rating === 5);
  if (fiveStarReviews.length < 3) {
    return { hasBurst: false, score: 0 };
  }

  const sortedReviews = fiveStarReviews
    .map(r => new Date(r.createdAt).getTime())
    .sort((a, b) => a - b);

  const timeWindowMs = 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i <= sortedReviews.length - 3; i++) {
    const windowStart = sortedReviews[i];
    const windowEnd = sortedReviews[i + 2];

    if (windowEnd - windowStart <= timeWindowMs) {
      const daysDiff = (windowEnd - windowStart) / (24 * 60 * 60 * 1000);
      return {
        hasBurst: true,
        score: Math.min(100, 60 + (7 - daysDiff) * 10),
        flag: `Review burst: ${i + 3} five-star reviews within ${daysDiff.toFixed(1)} days`
      };
    }
  }

  return { hasBurst: false, score: 0 };
}

export function checkScamKeywords(listingId: string, allReviews?: Review[]): { hasScamKeywords: boolean; score: number; flag?: string } {
  const reviews = allReviews || getReviewsByListingId(listingId);

  const scamKeywords = [
    'wire transfer',
    'deposit before viewing',
    'act fast',
    'price won\'t last',
    'unbelievable value',
    'best deal ever',
    'send money',
    'western union',
    'moneygram',
    'cash only',
    'no viewing needed',
    'guaranteed'
  ];

  let matchCount = 0;
  const matchedKeywords: string[] = [];

  for (const review of reviews) {
    const text = review.text.toLowerCase();
    for (const keyword of scamKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        matchCount++;
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
    }
  }

  if (matchCount > 0) {
    return {
      hasScamKeywords: true,
      score: Math.min(100, matchCount * 20),
      flag: `Scam keywords detected: ${matchedKeywords.join(', ')}`
    };
  }

  return { hasScamKeywords: false, score: 0 };
}