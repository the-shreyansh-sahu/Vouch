import { Listing } from '@/types';
import { getListings } from '@/lib/data';

export function checkPriceAnomaly(listing: Listing, allListings?: Listing[]): { isAnomaly: boolean; score: number; flag?: string } {
  const listings = allListings || getListings();
  const areaListings = listings.filter(l => l.location.area === listing.location.area && l.id !== listing.id);

  if (areaListings.length < 2) {
    return { isAnomaly: false, score: 0 };
  }

  const prices = areaListings.map(l => l.price);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = Math.sqrt(prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length);

  const threshold = mean + 2 * stdDev;
  const lowerThreshold = mean - 2 * stdDev;

  if (listing.price > threshold) {
    const deviation = ((listing.price - mean) / stdDev).toFixed(1);
    return {
      isAnomaly: true,
      score: Math.min(100, 50 + (listing.price - threshold) / mean * 100),
      flag: `Price anomaly: $${listing.price} is ${deviation} std devs above area mean ($${mean.toFixed(0)})`
    };
  }

  if (listing.price < lowerThreshold) {
    const deviation = ((mean - listing.price) / stdDev).toFixed(1);
    return {
      isAnomaly: true,
      score: Math.min(100, 50 + (lowerThreshold - listing.price) / mean * 100),
      flag: `Price anomaly: $${listing.price} is ${deviation} std devs below area mean ($${mean.toFixed(0)}) - possible scam pricing`
    };
  }

  return { isAnomaly: false, score: 0 };
}