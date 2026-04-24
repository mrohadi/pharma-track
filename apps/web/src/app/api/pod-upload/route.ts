import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { uploadFile } from '@/lib/s3';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/pod-upload
 * Body: multipart/form-data — fields: orderId, file
 * Returns: { key }
 *
 * Driver-only. File uploaded server-side to S3 — no browser CORS needed.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const orderId = formData.get('orderId');
  const file = formData.get('file');

  if (!orderId || typeof orderId !== 'string' || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 });
  }

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Invalid content type. Allowed: ${[...ALLOWED_TYPES].join(', ')}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Max 5 MB' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = await uploadFile({ orderId, contentType: file.type, buffer });
    return NextResponse.json({ key });
  } catch (err) {
    console.error('[pod-upload] S3 error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
