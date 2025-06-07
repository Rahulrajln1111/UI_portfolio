/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',             // Enables static export
  images: {
    unoptimized: true,          // Disables Image Optimization for static export
  },
  // Uncomment and edit if you want custom routing
  // exportPathMap: async () => ({
  //   '/': { page: '/' },
  //   '/about': { page: '/about' },
  //   '/contact': { page: '/contact' },
  //   // Add other routes here
  // }),
};

module.exports = nextConfig;
