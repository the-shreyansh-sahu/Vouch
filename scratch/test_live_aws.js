const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

async function testLiveAwsExecution() {
  console.log('Testing REAL AWS S3 Put & DynamoDB Put in ap-south-2...');

  // 1. S3 Upload Test
  const s3 = new S3Client({ region: 'ap-south-2' });
  const testKey = `vouch-live-test-${Date.now()}.json`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: 'vouch-assets-081473213199-ap-south-2',
        Key: testKey,
        Body: JSON.stringify({ message: 'Vouch Trust Layer AWS Live Test', timestamp: new Date().toISOString() }),
        ContentType: 'application/json',
      })
    );
    console.log(`✅ Dedicated AWS S3 Upload Successful! Key: ${testKey}`);
  } catch (err) {
    console.error('❌ Dedicated S3 Upload Error:', err);
  }

  // 2. DynamoDB Put Item Test
  const ddbClient = new DynamoDBClient({ region: 'ap-south-2' });
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  try {
    await docClient.send(
      new PutCommand({
        TableName: 'vouch_listings',
        Item: {
          listingId: `vouch-test-listing-${Date.now()}`,
          title: 'Vouch Live Dedicated AWS Rental',
          price: 150,
          area: 'Santa Monica',
          trustScore: 95,
          badgeTier: 'green',
          evaluatedAt: new Date().toISOString(),
          awsCloudAccount: 'arn:aws:iam::081473213199:user/shreyanshsahu',
        },
      })
    );
    console.log('✅ Dedicated AWS DynamoDB PutItem Successful in "vouch_listings" table!');
  } catch (err) {
    console.error('❌ Dedicated DynamoDB PutItem Error:', err);
  }

  // 3. DynamoDB Scan Test
  try {
    const scanRes = await docClient.send(new ScanCommand({ TableName: 'vouch_listings', Limit: 10 }));
    console.log('✅ Dedicated DynamoDB Table Scan Items Count:', scanRes.Items?.length);
    console.log('Sample Item from vouch_listings:', scanRes.Items?.[0]);
  } catch (err) {
    console.error('❌ Dedicated DynamoDB Scan Error:', err);
  }
}

testLiveAwsExecution();
