const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

async function testAws() {
  console.log('Testing AWS connection in region ap-south-2...');
  
  // Note: If aws_access_key_id is missing in credentials, we can check env or prompt
  const s3 = new S3Client({ region: 'ap-south-2' });
  try {
    const buckets = await s3.send(new ListBucketsCommand({}));
    console.log('S3 Buckets:', buckets.Buckets?.map(b => b.Name));
  } catch (err) {
    console.error('S3 Error:', err.message);
  }

  const ddb = new DynamoDBClient({ region: 'ap-south-2' });
  try {
    const tables = await ddb.send(new ListTablesCommand({}));
    console.log('DynamoDB Tables:', tables.TableNames);
  } catch (err) {
    console.error('DynamoDB Error:', err.message);
  }
}

testAws();
