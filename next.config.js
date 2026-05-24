/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-var-requires */

const nextConfig = {
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true,
  },

  reactStrictMode: false,
  swcMinify: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  webpack(config, { isServer }) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: { not: /\.(css|scss|sass)$/ },
        resourceQuery: { not: /url/ },
        loader: '@svgr/webpack',
        options: {
          dimensions: false,
          titleProp: true,
        },
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    // Cloudflare Pages 不支持某些 Node.js 模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // 禁用代码混淆，避免生成过大的文件
    config.optimization.minimize = true;
    
    return config;
  },
};

module.exports = nextConfig;
