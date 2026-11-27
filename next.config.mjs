import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Share images read these at request time.
  outputFileTracingIncludes: { "/**": ["./assets/og/*"] },
};

export default withNextIntl(nextConfig);
