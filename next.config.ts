// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  webpack(config) {
    config.module.rules.unshift({
      test: /\.html$/,
      loader: 'ignore-loader'
    });
    return config;
  }
};

export default nextConfig;