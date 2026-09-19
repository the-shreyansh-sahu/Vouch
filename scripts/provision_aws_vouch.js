const { S3Client, CreateBucketCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

const REGION = 'ap-south-2';
const BUCKET_NAME = 'vouch-assets-081473213199-ap-south-2';

async function provisionVouchAws() {
  console.log('🚀 Provisioning Dedicated Vouch AWS Infrastructure in region:', REGION);

  // 1. Create Dedicated S3 Bucket
  const s3 = new S3Client({ region: REGION });
  try {
    await s3.send(
      new CreateBucketCommand({
        Bucket: BUCKET_NAME,
        CreateBucketConfiguration: {
          LocationConstraint: REGION,
        },
      })
    );
    console.log(`✅ Dedicated S3 Bucket Created: ${BUCKET_NAME}`);
  } catch (err) {
    if (err.name === 'BucketAlreadyOwnedByYou' || err.name === 'BucketAlreadyExists') {
      console.log(`ℹ️ S3 Bucket already exists & owned by you: ${BUCKET_NAME}`);
    } else {
      console.warn('⚠️ S3 Bucket Creation Note:', err.message);
    }
  }

  // Configure S3 CORS
  try {
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: BUCKET_NAME,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['*'],
              ExposeHeaders: [],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
    );
    console.log('✅ S3 CORS Rules Configured for web client uploads.');
  } catch (err) {
    console.warn('⚠️ S3 CORS Note:', err.message);
  }

  // 2. Create Dedicated DynamoDB Tables
  const ddbClient = new DynamoDBClient({ region: REGION });
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  // Table 1: vouch_listings
  try {
    await ddbClient.send(
      new CreateTableCommand({
        TableName: 'vouch_listings',
        KeySchema: [{ AttributeName: 'listingId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'listingId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST',
      })
    );
    console.log('✅ Created DynamoDB Table: vouch_listings');
  } catch (err) {
    if (err.name === 'ResourceInUseException') {
      console.log('ℹ️ Table "vouch_listings" already exists.');
    } else {
      console.warn('⚠️ DynamoDB vouch_listings Note:', err.message);
    }
  }

  // Table 2: vouch_trust_results
  try {
    await ddbClient.send(
      new CreateTableCommand({
        TableName: 'vouch_trust_results',
        KeySchema: [
          { AttributeName: 'listingId', KeyType: 'HASH' },
          { AttributeName: 'evaluatedAt', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'listingId', AttributeType: 'S' },
          { AttributeName: 'evaluatedAt', AttributeType: 'S' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      })
    );
    console.log('✅ Created DynamoDB Table: vouch_trust_results');
  } catch (err) {
    if (err.name === 'ResourceInUseException') {
      console.log('ℹ️ Table "vouch_trust_results" already exists.');
    } else {
      console.warn('⚠️ DynamoDB vouch_trust_results Note:', err.message);
    }
  }

  // Wait for table to be active
  console.log('⏳ Waiting for DynamoDB table "vouch_listings" to be ACTIVE...');
  let isActive = false;
  for (let i = 0; i < 15; i++) {
    try {
      const desc = await ddbClient.send(new DescribeTableCommand({ TableName: 'vouch_listings' }));
      if (desc.Table?.TableStatus === 'ACTIVE') {
        isActive = true;
        break;
      }
    } catch {}
    await new Promise((res) => setTimeout(res, 1500));
  }

  // 3. Seed initial listings into vouch_listings table
  if (isActive) {
    try {
      const listingsPath = path.join(__dirname, '..', 'data', 'listings.json');
      const mockListings = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));

      console.log(`🌱 Seeding ${mockListings.length} mock listings into "vouch_listings" table...`);

      for (const item of mockListings) {
        await docClient.send(
          new PutCommand({
            TableName: 'vouch_listings',
            Item: {
              listingId: item.id,
              id: item.id,
              title: item.title,
              price: item.price,
              area: item.location.area,
              location: item.location,
              photos: item.photos,
              description: item.description,
              hostId: item.hostId,
              updatedAt: new Date().toISOString(),
            },
          })
        );
      }
      console.log('✅ Successfully seeded mock listings into live DynamoDB "vouch_listings" table!');
    } catch (err) {
      console.error('❌ Error seeding listings into DynamoDB:', err);
    }
  }

  console.log('🎉 Dedicated Vouch AWS Infrastructure Provisioning Complete!');
}

provisionVouchAws();
