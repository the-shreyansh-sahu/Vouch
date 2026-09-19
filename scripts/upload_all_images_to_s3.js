const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

const REGION = 'ap-south-2';
const BUCKET_NAME = 'vouch-assets-081473213199-ap-south-2';

async function uploadImagesAndSyncDynamo() {
  console.log('🚀 Uploading all rental photos & host ID documents to AWS S3 bucket:', BUCKET_NAME);

  const s3 = new S3Client({ region: REGION });
  const ddbClient = new DynamoDBClient({ region: REGION });
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  const files = fs.readdirSync(imagesDir);

  const urlMapping = {};

  for (const filename of files) {
    const filePath = path.join(imagesDir, filename);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const fileBuffer = fs.readFileSync(filePath);
    const contentType = filename.endsWith('.jpg') || filename.endsWith('.jpeg')
      ? 'image/jpeg'
      : filename.endsWith('.png')
      ? 'image/png'
      : filename.endsWith('.svg')
      ? 'image/svg+xml'
      : 'application/octet-stream';

    const s3Key = `images/${filename}`;

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );
      const s3Url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${s3Key}`;
      urlMapping[`/images/${filename}`] = s3Url;
      console.log(`✅ Uploaded to S3: ${s3Key}`);
    } catch (err) {
      console.error(`❌ S3 Upload error for ${filename}:`, err.message);
    }
  }

  console.log(`\n🎉 Uploaded ${Object.keys(urlMapping).length} files to AWS S3!`);

  // Update listings.json and DynamoDB table with live S3 URLs
  const listingsPath = path.join(__dirname, '..', 'data', 'listings.json');
  const listings = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));

  for (const listing of listings) {
    listing.photos = listing.photos.map((p) => urlMapping[p] || p);
    await docClient.send(
      new PutCommand({
        TableName: 'vouch_listings',
        Item: {
          listingId: listing.id,
          id: listing.id,
          title: listing.title,
          price: listing.price,
          area: listing.location.area,
          location: listing.location,
          photos: listing.photos,
          description: listing.description,
          hostId: listing.hostId,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }

  fs.writeFileSync(listingsPath, JSON.stringify(listings, null, 2));
  console.log('✅ Updated DynamoDB table "vouch_listings" and data/listings.json with real AWS S3 URLs!');
}

uploadImagesAndSyncDynamo();
