const withPWA = require("next-pwa")({
  dest: "public",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placeimg.com",
        port: "",
        pathname: "/*/*/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**/*",
      },
    ],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
}

module.exports = withPWA(nextConfig)
