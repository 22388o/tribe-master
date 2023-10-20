/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // eslint-disable-next-line no-param-reassign
    (config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }),
      (config.ignoreWarnings = [
        {
          message:
            /(magic-sdk|@walletconnect\/web3-provider|@web3auth\/web3auth)/,
        },
      ]);
    return config;
  },
  ...(process.env.NODE_ENV === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },

    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
};

module.exports = nextConfig;
