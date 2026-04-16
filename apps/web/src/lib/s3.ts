import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.S3_BUCKET ?? 'pharmatrack-uploads';
const REGION = process.env.S3_REGION ?? 'ap-southeast-1';

function getS3Client() {
  // LocalStack / MinIO for dev: set S3_ENDPOINT to http://localhost:4566
  const endpoint = process.env.S3_ENDPOINT || undefined;

  return new S3Client({
    region: REGION,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  });
}

/**
 * Generate a presigned PUT URL so the driver's browser can upload
 * the POD photo directly to S3 (no server-side relay needed).
 */
export async function createPresignedUploadUrl(opts: {
  orderId: string;
  contentType: string;
}): Promise<{ uploadUrl: string; key: string }> {
  const ext = opts.contentType === 'image/png' ? 'png' : 'jpg';
  const key = `pod-photos/${opts.orderId}/${Date.now()}.${ext}`;

  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: opts.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 min

  return { uploadUrl, key };
}

/**
 * Generate a presigned GET URL for viewing a POD photo.
 * Returns null if no key is provided.
 */
export async function createPresignedViewUrl(key: string): Promise<string> {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 }); // 1 hour
}
