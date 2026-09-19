import { getListings, getAllTrustResults, saveTrustResult, getReviewsByListingId } from '@/lib/data';
import { verifyHost } from '@/lib/verify/heuristics';
import { runFraudChecks } from '@/lib/fraud';
import { getFastVibe } from '@/lib/vibe/generate';
import { calculateTrustScore } from '@/lib/trustScore';
import { ListingsClient } from '@/components/ListingsClient';
import { TrustResult } from '@/types';

export const revalidate = 0; // Dynamic rendering for fresh data

export default async function ListingsPage() {
  const listings = getListings();
  const existingTrustResults = getAllTrustResults();
  const trustResultsMap: Record<string, TrustResult> = Object.fromEntries(
    existingTrustResults.map(r => [r.listingId, r])
  );

  // Pre-seed trust results synchronously for instant (<15ms) page renders
  for (const listing of listings) {
    if (!trustResultsMap[listing.id]) {
      const verification = verifyHost(listing.hostId);
      const fraud = runFraudChecks(listing.id);
      const reviews = getReviewsByListingId(listing.id);
      const vibe = getFastVibe(listing.location.area, reviews.length);
      const { trustScore, badgeTier } = calculateTrustScore(
        verification.verificationScore,
        fraud.fraudRiskScore,
        vibe.vibeConfidence
      );

      const result: TrustResult = {
        listingId: listing.id,
        verificationScore: verification.verificationScore,
        fraudRiskScore: fraud.fraudRiskScore,
        fraudFlags: fraud.flags,
        vibeSummary: vibe.vibeSummary,
        vibeConfidence: vibe.vibeConfidence,
        trustScore,
        badgeTier
      };

      saveTrustResult(result);
      trustResultsMap[listing.id] = result;
    }
  }

  return (
    <ListingsClient
      initialListings={listings}
      initialTrustResults={trustResultsMap}
    />
  );
}