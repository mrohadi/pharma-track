import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.S3_BUCKET ?? 'pharmatrack-uploads';
const REGION = process.env.S3_REGION ?? 'ap-southeast-1';
const ENV_PREFIX = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
// S3_UPLOAD_URL_TTL_SECONDS — presigned PUT expiry (default 5 min)
// S3_VIEW_URL_TTL_SECONDS   — presigned GET expiry (default 5 min)
// const UPLOAD_TTL = Number(process.env.S3_UPLOAD_URL_TTL_SECONDS ?? 300);
const VIEW_TTL = Number(process.env.S3_VIEW_URL_TTL_SECONDS ?? 300);

function getS3Client() {
  return new S3Client({
    region: REGION,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
}

/**
 * Upload a file buffer server-side to S3. Returns the object key.
 */
export async function uploadFile(opts: {
  orderId: string;
  contentType: string;
  buffer: Buffer;
}): Promise<string> {
  const ext = opts.contentType === 'image/png' ? 'png' : 'jpg';
  const key = `${ENV_PREFIX}/pod-photos/${opts.orderId}/${Date.now()}.${ext}`;

  const client = getS3Client();
  const input: PutObjectCommandInput = {
    Bucket: BUCKET,
    Key: key,
    ContentType: opts.contentType,
    Body: opts.buffer,
    ContentLength: opts.buffer.byteLength,
  };

  await client.send(new PutObjectCommand(input));
  return key;
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

  return getSignedUrl(client, command, { expiresIn: VIEW_TTL });
}
