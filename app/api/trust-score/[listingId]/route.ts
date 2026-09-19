import { NextRequest, NextResponse } from 'next/server';
import { getListingById, saveTrustResult } from '@/lib/data';
import { verifyHostWithAws } from '@/lib/verify/heuristics';
import { executeVouchTrustPipeline } from '@/lib/aws/stepfunctions';
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

    // 1. Run AWS Step Functions pipeline (orchestrates Rekognition, SageMaker AI, Bedrock, DynamoDB)
    const pipelineRes = await executeVouchTrustPipeline(listingId);
    const hostVerify = await verifyHostWithAws(listing.hostId);

    const { trustScore, badgeTier } = calculateTrustScore(
      hostVerify.verificationScore,
      pipelineRes.trustResult.fraudRiskScore,
      pipelineRes.trustResult.vibeConfidence
    );

    const result = {
      ...pipelineRes.trustResult,
      verificationScore: hostVerify.verificationScore,
      trustScore,
      badgeTier,
      awsPipelineExecutionArn: pipelineRes.executionArn,
      awsDetails: hostVerify.awsDetails,
    };

    saveTrustResult(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Trust score error:', error);
    return NextResponse.json({ error: 'Trust score calculation failed' }, { status: 500 });
  }
}