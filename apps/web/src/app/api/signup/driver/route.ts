import { NextResponse } from 'next/server';
import { DriverSignupSchema } from '@pharmatrack/shared';
import { signupDriver } from '@/lib/services/signup';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = DriverSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Validation error' },
      { status: 422 },
    );
  }

  try {
    await signupDriver(parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
