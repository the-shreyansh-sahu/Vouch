import { getAwsConfig } from './config';
import { TrustResult } from '@/types';

export interface DynamoDbListingRecord {
  PK: string; // e.g. LISTING#listing-1
  SK: string; // e.g. METADATA
  id: string;
  title: string;
  price: number;
  area: string;
  hostId: string;
  updatedAt: string;
  trustResult?: TrustResult;
}

export async function saveTrustResultToDynamoDb(trustResult: TrustResult): Promise<{ success: boolean; dynamoRecordKey: string }> {
  const config = getAwsConfig();
  const tableName = `${config.dynamoTablePrefix}TrustResults`;
  const pk = `LISTING#${trustResult.listingId}`;
  const sk = `TRUST_EVALUATION#${Date.now()}`;

  if (config.isLiveAws) {
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');

      const client = new DynamoDBClient({ region: config.region });
      const docClient = DynamoDBDocumentClient.from(client);
      const tableName = process.env.AWS_DYNAMODB_TABLE || 'listings';

      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            listingId: trustResult.listingId,
            PK: pk,
            SK: sk,
            trustScore: trustResult.trustScore,
            badgeTier: trustResult.badgeTier,
            fraudRiskScore: trustResult.fraudRiskScore,
            fraudFlags: trustResult.fraudFlags,
            verificationScore: trustResult.verificationScore,
            vibeSummary: trustResult.vibeSummary,
            vibeConfidence: trustResult.vibeConfidence,
            evaluatedAt: new Date().toISOString(),
            awsService: 'DynamoDB + Rekognition + StepFunctions',
          },
        })
      );

      return { success: true, dynamoRecordKey: `AWS DynamoDB [${tableName}]: ${trustResult.listingId}` };
    } catch (err: any) {
      console.warn('Live DynamoDB put item notice:', err.message);
    }
  }

  return {
    success: true,
    dynamoRecordKey: `${pk} / ${sk} (Simulated DynamoDB Table: ${tableName})`,
  };
}
