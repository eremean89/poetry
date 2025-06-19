// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig: import("next").NextConfig = {
  images: {
    // отключаем оптимизацию для всех изображений
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.unshift({
      test: /\.html$/,
      loader: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
