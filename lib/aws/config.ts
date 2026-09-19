export interface AwsConfig {
  region: string;
  isLiveAws: boolean;
  s3BucketName: string;
  dynamoTablePrefix: string;
  cognitoUserPoolId: string;
  stepFunctionsArn: string;
  sagemakerEndpointName: string;
}

export const getAwsConfig = (): AwsConfig => {
  return {
    region: process.env.AWS_REGION || 'ap-south-2',
    isLiveAws: true,
    s3BucketName: process.env.AWS_S3_BUCKET || 'vouch-assets-081473213199-ap-south-2',
    dynamoTablePrefix: process.env.AWS_DYNAMODB_PREFIX || 'vouch_',
    cognitoUserPoolId: process.env.AWS_COGNITO_USER_POOL_ID || 'ap-south-2_1ejVoR18H',
    stepFunctionsArn: process.env.AWS_STEP_FUNCTIONS_ARN || 'arn:aws:states:ap-south-2:081473213199:stateMachine:VouchTrustPipeline',
    sagemakerEndpointName: process.env.AWS_SAGEMAKER_ENDPOINT || 'vouch-fraud-vibe-sagemaker-v1',
  };
};
