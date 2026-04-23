/**
 * Server-side translation helper. Re-exports next-intl's getTranslations so
 * services and server actions can translate error messages without importing
 * from next-intl directly.
 *
 * Usage:
 *   import { getTranslations } from '@/lib/copy';
 *   const t = await getTranslations('OrderStatus');
 *   throw new Error(t('failed'));
 */
export { getTranslations } from 'next-intl/server';
