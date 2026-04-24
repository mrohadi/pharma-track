import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createPresignedViewUrl } from '@/lib/s3';

/**
 * GET /api/pod-view?key=pod-photos/...
 * Returns a presigned GET URL for viewing a POD photo.
 * Admin and pharmacy roles only.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== 'admin' && role !== 'pharmacy') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const key = req.nextUrl.searchParams.get('key');
  if (!key || !/^(dev|prod)\/pod-photos\//.test(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  const url = await createPresignedViewUrl(key);
  return NextResponse.json({ url });
}
