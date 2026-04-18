'use client';

import { useState, useEffect } from 'react';

type State = 'loading' | 'unsupported' | 'unconfigured' | 'denied' | 'subscribed' | 'unsubscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export function PushSubscriptionManager() {
  const [state, setState] = useState<State>('loading');
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }

    fetch('/api/push/vapid-key')
      .then((r) => r.json())
      .then((data: { publicKey?: string }) => {
        if (!data.publicKey) {
          setState('unconfigured');
          return;
        }
        setVapidKey(data.publicKey);

        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => reg.pushManager.getSubscription())
          .then((sub) => setState(sub ? 'subscribed' : 'unsubscribed'))
          .catch(() => setState('unsubscribed'));
      })
      .catch(() => setState('unconfigured'));
  }, []);

  async function subscribe() {
    if (!vapidKey) return;
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState('denied');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error('Server error');
      setState('subscribed');
    } catch (err) {
      setError('Failed to enable notifications. Try again.');
      console.error('[Push] subscribe error:', err);
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('unsubscribed');
    } catch (err) {
      setError('Failed to disable notifications.');
      console.error('[Push] unsubscribe error:', err);
    } finally {
      setBusy(false);
    }
  }

  if (state === 'loading' || state === 'unsupported' || state === 'unconfigured') return null;

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
      {state === 'denied' && (
        <span className="text-xs text-amber-600">Notifications blocked in browser settings</span>
      )}
      {state === 'unsubscribed' && (
        <button
          onClick={subscribe}
          disabled={busy}
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? 'Enabling…' : '🔔 Enable notifications'}
        </button>
      )}
      {state === 'subscribed' && (
        <button
          onClick={unsubscribe}
          disabled={busy}
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? 'Disabling…' : '🔔 Notifications on'}
        </button>
      )}
    </div>
  );
}
