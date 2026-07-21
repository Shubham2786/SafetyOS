/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@safetyos/ui', '@safetyos/design-tokens', '@safetyos/shared-types'],
  reactStrictMode: true,
};

export default nextConfig;
