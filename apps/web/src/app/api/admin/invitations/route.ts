import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/guards';
import { createInvitation } from '@pharmatrack/db';
import { getSession } from '@/lib/session';
import { sendEmail } from '@/lib/ses';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

const BodySchema = z.object({
  email: z.string().email(),
  role: z.enum(['pharmacy', 'driver']),
});

/**
 * POST /api/admin/invitations
 * Body: { email, role }
 * Creates an invitation token, sends invite email via SES.
 */
export async function POST(req: NextRequest) {
  try {
    await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await getSession();
  const actorUserId = session?.user?.id ?? '';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { email, role } = parsed.data;
  const { token, expiresAt } = await createInvitation({
    email,
    role,
    invitedByUserId: actorUserId,
  });

  const signupUrl = `${APP_URL}/signup?token=${token}&role=${role}`;
  const roleLabel = role === 'pharmacy' ? 'Apotek' : 'Driver';
  const expiryStr = expiresAt.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f5f5f5;margin:0;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h2 style="margin-top:0;color:#0f172a">Undangan PharmaTrack</h2>
    <p>Anda diundang untuk bergabung sebagai <strong>${roleLabel}</strong> di PharmaTrack.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${signupUrl}"
         style="background:oklch(0.52 0.18 250);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block">
        Daftar Sekarang
      </a>
    </div>
    <p style="color:#64748b;font-size:13px">Link berlaku hingga <strong>${expiryStr}</strong>.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
    <p style="color:#94a3b8;font-size:12px">PharmaTrack</p>
  </div>
</body>
</html>`;

  const emailResult = await sendEmail({
    to: email,
    subject: `Undangan bergabung PharmaTrack sebagai ${roleLabel}`,
    text: `Anda diundang bergabung ke PharmaTrack sebagai ${roleLabel}.\nDaftar di: ${signupUrl}\nBerlaku hingga: ${expiryStr}`,
    html,
  });

  if (!emailResult.success) {
    console.error('[Invitation] Email send failed:', emailResult.error);
    // Still return success — token created, email optional
  }

  return NextResponse.json({ ok: true, token, expiresAt }, { status: 201 });
}
