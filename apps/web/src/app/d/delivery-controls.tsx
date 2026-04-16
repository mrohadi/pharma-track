'use client';

import { useState, useTransition } from 'react';
import {
  startDeliveryAction,
  verifyDeliveryOtpAction,
  failDeliveryAction,
  type StartDeliveryResult,
  type VerifyOtpActionResult,
  type FailDeliveryActionResult,
} from './actions';

const FAILURE_REASONS = [
  { value: 'no_answer', label: 'No answer' },
  { value: 'wrong_address', label: 'Wrong address' },
  { value: 'patient_refused', label: 'Patient refused' },
  { value: 'patient_not_home', label: 'Patient not home' },
  { value: 'other', label: 'Other' },
];

type Phase = 'idle' | 'otp_sent' | 'delivered' | 'failed' | 'fail_form';

export function DeliveryControls({ orderId, status }: { orderId: string; status: string }) {
  const [phase, setPhase] = useState<Phase>(status === 'in_transit' ? 'otp_sent' : 'idle');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Only show for deliverable statuses
  if (status !== 'picked_up' && status !== 'in_transit') return null;

  function sendOtp() {
    const form = new FormData();
    form.set('orderId', orderId);
    startTransition(async () => {
      setError(null);
      const r: StartDeliveryResult = await startDeliveryAction(form);
      if (r.ok) {
        setPhase('otp_sent');
        setInfo(r.message);
      } else {
        setError(r.reason);
      }
    });
  }

  function verifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set('orderId', orderId);
    startTransition(async () => {
      setError(null);
      const r: VerifyOtpActionResult = await verifyDeliveryOtpAction(form);
      if (r.ok) {
        setPhase('delivered');
      } else {
        setError(r.reason);
      }
    });
  }

  function submitFailure(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set('orderId', orderId);
    startTransition(async () => {
      setError(null);
      const r: FailDeliveryActionResult = await failDeliveryAction(form);
      if (r.ok) {
        setPhase('failed');
      } else {
        setError(r.reason);
      }
    });
  }

  if (phase === 'delivered') {
    return <p className="text-sm font-medium text-green-700">Delivered!</p>;
  }

  if (phase === 'failed') {
    return <p className="text-sm font-medium text-red-600">Marked as failed delivery.</p>;
  }

  return (
    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
      {phase === 'idle' && (
        <button
          onClick={sendOtp}
          disabled={pending}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Start delivery (send OTP)'}
        </button>
      )}

      {phase === 'otp_sent' && (
        <>
          {info && <p className="text-xs text-blue-600">{info}</p>}
          <form onSubmit={verifyOtp} className="flex items-center gap-2">
            <input
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6-digit OTP"
              required
              className="w-24 rounded border border-slate-300 p-1.5 text-center font-mono text-sm"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {pending ? '…' : 'Confirm delivery'}
            </button>
          </form>
          <button
            onClick={() => {
              setPhase('fail_form');
              setError(null);
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Report failed delivery
          </button>
          <button
            onClick={sendOtp}
            disabled={pending}
            className="ml-2 text-xs text-blue-500 hover:underline"
          >
            Resend OTP
          </button>
        </>
      )}

      {phase === 'fail_form' && (
        <form onSubmit={submitFailure} className="space-y-2">
          <select
            name="failureReason"
            required
            className="w-full rounded border border-slate-300 p-1.5 text-sm"
          >
            <option value="">Select reason…</option>
            {FAILURE_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <textarea
            name="failureNote"
            placeholder="Additional notes (optional)"
            rows={2}
            maxLength={500}
            className="w-full rounded border border-slate-300 p-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? '…' : 'Confirm failed delivery'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPhase('otp_sent');
                setError(null);
              }}
              className="text-xs text-slate-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
