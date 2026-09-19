import { Listing } from '@/types';
import { checkPriceAnomaly } from './priceAnomaly';
import { checkDuplicateImages } from './duplicateImage';
import { checkReviewBurst, checkScamKeywords } from './reviewBurst';
import { getListings, getReviewsByListingId } from '@/lib/data';

export function runFraudChecks(listingId: string): { fraudRiskScore: number; flags: string[] } {
  const listing = getListings().find(l => l.id === listingId);
  if (!listing) {
    return { fraudRiskScore: 0, flags: [] };
  }

  const allListings = getListings();
  const allReviews = getReviewsByListingId(listingId);

  const priceCheck = checkPriceAnomaly(listing, allListings);
  const duplicateCheck = checkDuplicateImages(listing, allListings);
  const burstCheck = checkReviewBurst(listingId, allReviews);
  const scamCheck = checkScamKeywords(listingId, allReviews);

  const flags: string[] = [];
  let totalScore = 0;

  if (priceCheck.isAnomaly) {
    flags.push(priceCheck.flag!);
    totalScore += priceCheck.score;
  }

  if (duplicateCheck.hasDuplicates) {
    flags.push(duplicateCheck.flag!);
    totalScore += duplicateCheck.score;
  }

  if (burstCheck.hasBurst) {
    flags.push(burstCheck.flag!);
    totalScore += burstCheck.score;
  }

  if (scamCheck.hasScamKeywords) {
    flags.push(scamCheck.flag!);
    totalScore += scamCheck.score;
  }

  return {
    fraudRiskScore: Math.min(100, totalScore),
    flags
  };
}