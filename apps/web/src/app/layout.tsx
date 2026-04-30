import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PharmaTrack — Pharmacy Delivery Platform',
    template: '%s | PharmaTrack',
  },
  description:
    'PharmaTrack connects pharmacies, drivers, and patients with real-time order tracking, OTP delivery verification, and WhatsApp notifications.',
  keywords: ['pharmacy delivery', 'last-mile delivery', 'medication delivery', 'pharma logistics'],
  openGraph: {
    type: 'website',
    siteName: 'PharmaTrack',
    title: 'PharmaTrack — Pharmacy Delivery Platform',
    description:
      'Real-time order tracking, OTP handoffs, and WhatsApp notifications for pharmacy last-mile delivery.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PharmaTrack — Pharmacy Delivery Platform',
    description: 'Real-time order tracking, OTP handoffs, and WhatsApp notifications.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pharmatrack.app'),
  manifest: '/manifest.webmanifest',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="color-scheme" content="light only" />
        <meta name="facebook-domain-verification" content="64j86u5bsks8j9hf0nfy592x2vny86" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
