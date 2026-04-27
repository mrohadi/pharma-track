const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@pharmatrack.mrohadi.com';
const RESEND_API = 'https://api.resend.com/emails';

export type SendEmailResult = { success: true } | { success: false; error: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: 'RESEND_API_KEY not configured' };

  try {
    // Use native fetch with cache: 'no-store' to bypass Next.js fetch instrumentation
    const res = await fetch(RESEND_API, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      }),
    });

    const data = (await res.json()) as { id?: string; name?: string; message?: string };
    if (!res.ok) {
      return { success: false, error: data.message ?? data.name ?? `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Send delivery OTP email to patient.
 * Called as fallback when WhatsApp send fails.
 */
export function sendDeliveryOtpEmail(opts: {
  to: string;
  patientFirstName: string;
  otp: string;
  orderId: string;
}): Promise<SendEmailResult> {
  const { to, patientFirstName, otp } = opts;
  const subject = 'Kode OTP Pengiriman Obat Anda';
  const text = `Halo ${patientFirstName},\n\nKode OTP pengiriman obat Anda: ${otp}\n\nBerlaku 10 menit. Jangan bagikan kode ini kepada siapa pun selain kurir.\n\nPharmaTrack`;
  const html = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f5f5f5;margin:0;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h2 style="margin-top:0;color:#1a1a2e">Kode OTP Pengiriman</h2>
    <p>Halo <strong>${patientFirstName}</strong>,</p>
    <p>Kurir Anda sudah tiba. Berikan kode berikut kepada kurir:</p>
    <div style="text-align:center;margin:24px 0">
      <span style="font-size:40px;font-weight:700;letter-spacing:8px;color:#2563eb">${otp}</span>
    </div>
    <p style="color:#6b7280;font-size:14px">Berlaku <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapa pun selain kurir.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px;margin:0">PharmaTrack &mdash; pharmatrack.mrohadi.com</p>
  </div>
</body>
</html>`.trim();

  return sendEmail({ to, subject, text, html });
}
