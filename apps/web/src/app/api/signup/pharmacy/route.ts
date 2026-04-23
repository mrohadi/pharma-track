import { NextResponse } from 'next/server';
import { PharmacySignupSchema } from '@pharmatrack/shared';
import { signupPharmacy } from '@/lib/services/signup';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = PharmacySignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Validation error' },
      { status: 422 },
    );
  }

  try {
    await signupPharmacy(parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
