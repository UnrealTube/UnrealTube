import type { NextConfig } from 'next';
import dotenv from 'dotenv';

// Load .env into process.env (dotenv.populate is used internally to inject)
dotenv.config({ path: '.env', override: true });

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    PROJECT_ID: process.env.HAPPYSEEDS_PROJECT_ID ?? '',
    REACTUS_BASE_URL: process.env.REACTUS_BASE_URL ?? '',
  },
  serverExternalPackages: [],
  allowedDevOrigins: ["**.*.*"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "yts.mx" },
      { protocol: "https", hostname: "*.yts.mx" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow embedding YouTube iframes — remove X-Frame-Options restriction on our own pages
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://piped.video https://invidious.nerdvpn.de https://y.com.sb https://vidsrc.to https://vidsrc.xyz https://embed.su https://multiembed.mov https://player.smashy.stream https://vidsrc.icu https://vidsrc.cc",
              "img-src 'self' data: https://i.ytimg.com https://yt3.ggpht.com https://lh3.googleusercontent.com https://ui-avatars.com https://*.ytimg.com https://image.tmdb.org blob:",
              "media-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "connect-src 'self' https://serpapi.com https://www.googleapis.com https://accounts.google.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' https://fonts.gstatic.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

