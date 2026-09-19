const { S3Client, PutPublicAccessBlockCommand, PutBucketPolicyCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const REGION = 'ap-south-2';
const BUCKET_NAME = 'vouch-assets-081473213199-ap-south-2';

async function makeBucketPublic() {
  console.log('🔓 Unlocking AWS S3 Public Read Access for:', BUCKET_NAME);
  const s3 = new S3Client({ region: REGION });

  // 1. Disable Block Public Access for the S3 bucket
  try {
    await s3.send(
      new PutPublicAccessBlockCommand({
        Bucket: BUCKET_NAME,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      })
    );
    console.log('✅ Disabled Block Public Access on S3 Bucket.');
  } catch (err) {
    console.warn('⚠️ Public Access Block Note:', err.message);
  }

  // 2. Attach Public Read Bucket Policy
  const publicReadPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
      },
    ],
  };

  try {
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(publicReadPolicy),
      })
    );
    console.log('✅ Applied Public Read Policy (s3:GetObject) to S3 bucket!');
  } catch (err) {
    console.warn('⚠️ S3 Bucket Policy Note:', err.message);
  }

  // 3. Configure CORS for all web browsers
  try {
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: BUCKET_NAME,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'HEAD'],
              AllowedOrigins: ['*'],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
    );
    console.log('✅ Configured S3 CORS for web browser access.');
  } catch (err) {
    console.warn('⚠️ S3 CORS Note:', err.message);
  }

  console.log('🎉 S3 Public Access Configuration Complete!');
  console.log(`Sample Public URL: https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/images/listing-1-1.jpg`);
}

makeBucketPublic();
