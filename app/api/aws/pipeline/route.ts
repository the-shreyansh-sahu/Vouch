import { NextRequest, NextResponse } from 'next/server';
import { executeVouchTrustPipeline } from '@/lib/aws/stepfunctions';
import { saveTrustResultToDynamoDb } from '@/lib/aws/dynamodb';
import { verifyHostCognitoStatus } from '@/lib/aws/cognito';
import { invokeSageMakerTrustModel } from '@/lib/aws/sagemaker';
import { putCloudWatchLog } from '@/lib/aws/cloudwatch';
import { getListingById } from '@/lib/data';

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const listing = getListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // 1. Log incoming request to CloudWatch
    await putCloudWatchLog(
      'ApiGateway',
      'INFO',
      `Triggered AWS Step Functions pipeline for listingId: ${listingId}`
    );

    // 2. Fetch Cognito Host Verification Status
    const cognitoAuth = await verifyHostCognitoStatus(listing.hostId);

    // 3. Execute SageMaker AI Inference
    const sageMakerAi = await invokeSageMakerTrustModel({
      listingId,
      photoUrls: listing.photos,
      reviewsText: [],
      price: listing.price,
      area: listing.location.area,
    });

    // 4. Run AWS Step Functions pipeline
    const sfnResult = await executeVouchTrustPipeline(listingId);

    // 5. Persist score to DynamoDB
    const ddbResult = await saveTrustResultToDynamoDb(sfnResult.trustResult);

    // 6. Record CloudWatch Telemetry
    await putCloudWatchLog(
      'StepFunctions',
      'INFO',
      `Pipeline completed with tier ${sfnResult.trustResult.badgeTier} (Score: ${sfnResult.trustResult.trustScore})`,
      { dynamoKey: ddbResult.dynamoRecordKey }
    );

    return NextResponse.json({
      success: true,
      executionArn: sfnResult.executionArn,
      cognitoAuth,
      sageMakerAi,
      stepFunctionsState: sfnResult.statesExecuted,
      dynamoRecordKey: ddbResult.dynamoRecordKey,
      trustResult: sfnResult.trustResult,
    });
  } catch (error: any) {
    await putCloudWatchLog('LambdaPipeline', 'ERROR', `Pipeline failed: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Pipeline execution failed' }, { status: 500 });
  }
}
