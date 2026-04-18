import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // typedRoutes disabled: router.replace() with user-supplied `next` params
  // conflicts with RouteImpl. Revisit once we introduce a typed redirect helper.
  output: 'standalone',
};

export default config;
