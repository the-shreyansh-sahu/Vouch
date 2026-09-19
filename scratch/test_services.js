const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { DynamoDBClient, DescribeTableCommand, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function testServices() {
  console.log('Testing Rekognition & DynamoDB in ap-south-2...');
  
  const rek = new RekognitionClient({ region: 'ap-south-2' });
  console.log('Rekognition client initialized successfully.');

  const ddb = new DynamoDBClient({ region: 'ap-south-2' });
  try {
    const desc = await ddb.send(new DescribeTableCommand({ TableName: 'listings' }));
    console.log('Existing "listings" table schema:', desc.Table?.KeySchema);
  } catch (err) {
    console.log('Describe table error:', err.message);
  }

  const s3 = new S3Client({ region: 'ap-south-2' });
  try {
    const objs = await s3.send(new ListObjectsV2Command({ Bucket: 'inspectify-uploads-081473213199-ap-south-2' }));
    console.log('Objects in S3 bucket inspectify-uploads-081473213199-ap-south-2:', objs.KeyCount);
  } catch (err) {
    console.log('S3 list objects error:', err.message);
  }
}

testServices();
