/** @type {import('next').NextConfig} */
const nextConfig = {};

export default {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude node built-in modules from the client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        worker_threads: false,
      };
    }
    return config;
  },
};
