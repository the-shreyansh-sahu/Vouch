import { getAwsConfig } from './config';

export interface CloudWatchLogEntry {
  timestamp: string;
  logStream: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
  metadata?: Record<string, any>;
}

const localLogBuffer: CloudWatchLogEntry[] = [];

export async function putCloudWatchLog(
  service: string,
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL',
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  const config = getAwsConfig();
  const entry: CloudWatchLogEntry = {
    timestamp: new Date().toISOString(),
    logStream: `/aws/vouch/${service.toLowerCase()}`,
    service,
    level,
    message,
    metadata,
  };

  localLogBuffer.unshift(entry);
  if (localLogBuffer.length > 50) localLogBuffer.pop();

  if (config.isLiveAws) {
    try {
      const { CloudWatchClient, PutMetricDataCommand } = await import('@aws-sdk/client-cloudwatch');
      const cw = new CloudWatchClient({ region: config.region });
      await cw.send(
        new PutMetricDataCommand({
          Namespace: 'Vouch/RentalTrust',
          MetricData: [
            {
              MetricName: `${service}_Evaluations`,
              Value: 1,
              Unit: 'Count',
            },
          ],
        })
      );
    } catch (err) {
      console.warn('CloudWatch PutMetricData fallback:', err);
    }
  }
}

export function getLatestCloudWatchLogs(): CloudWatchLogEntry[] {
  if (localLogBuffer.length === 0) {
    // Seed initial demo logs
    return [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        logStream: '/aws/vouch/stepfunctions',
        service: 'StepFunctions',
        level: 'INFO',
        message: 'Pipeline VouchTrustPipeline state machine initialized for listing-1',
        metadata: { executionArn: 'arn:aws:states:us-east-1:123456789012:execution:VouchTrustPipeline:exec-1' },
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
        logStream: '/aws/vouch/sagemaker',
        service: 'SageMaker AI',
        level: 'INFO',
        message: 'Endpoint vouch-fraud-vibe-sagemaker-v1 returned anomaly score 0.04 (Latency 142ms)',
      },
      {
        timestamp: new Date().toISOString(),
        logStream: '/aws/vouch/dynamodb',
        service: 'DynamoDB',
        level: 'INFO',
        message: 'PutItem successful in Vouch_TrustResults table for LISTING#listing-1',
      },
    ];
  }
  return [...localLogBuffer];
}
