import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createPresignedUploadUrl } from '@/lib/s3';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/**
 * POST /api/pod-upload
 * Body: { orderId, contentType }
 * Returns: { uploadUrl, key }
 *
 * Driver-only. Returns a presigned S3 PUT URL so the browser
 * uploads the POD photo directly — no server relay.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as { orderId?: string; contentType?: string };
  const { orderId, contentType } = body;

  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 });
  }

  if (!contentType || !ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: `Invalid content type. Allowed: ${[...ALLOWED_TYPES].join(', ')}` },
      { status: 400 },
    );
  }

  const { uploadUrl, key } = await createPresignedUploadUrl({ orderId, contentType });

  return NextResponse.json({ uploadUrl, key });
}
