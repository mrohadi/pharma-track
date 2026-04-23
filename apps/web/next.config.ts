import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const config: NextConfig = {
  reactStrictMode: true,
  // typedRoutes disabled: router.replace() with user-supplied `next` params
  // conflicts with RouteImpl. Revisit once we introduce a typed redirect helper.
  output: 'standalone',
};

export default withNextIntl(config);
