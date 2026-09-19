import { NextRequest, NextResponse } from 'next/server';
import { getListingById, saveTrustResult } from '@/lib/data';
import { verifyHost } from '@/lib/verify/heuristics';
import { runFraudChecks } from '@/lib/fraud';
import { generateVibe } from '@/lib/vibe/generate';
import { calculateTrustScore } from '@/lib/trustScore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    const listing = getListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const [verification, fraud, vibe] = await Promise.all([
      Promise.resolve(verifyHost(listing.hostId)),
      Promise.resolve(runFraudChecks(listingId)),
      generateVibe(listingId, listing.location.area)
    ]);

    const { trustScore, badgeTier } = calculateTrustScore(
      verification.verificationScore,
      fraud.fraudRiskScore,
      vibe.vibeConfidence
    );

    const result = {
      listingId,
      verificationScore: verification.verificationScore,
      fraudRiskScore: fraud.fraudRiskScore,
      fraudFlags: fraud.flags,
      vibeSummary: vibe.vibeSummary,
      vibeConfidence: vibe.vibeConfidence,
      trustScore,
      badgeTier
    };

    saveTrustResult(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Trust score error:', error);
    return NextResponse.json({ error: 'Trust score calculation failed' }, { status: 500 });
  }
}