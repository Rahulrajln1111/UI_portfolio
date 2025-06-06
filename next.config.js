/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // This replaces next export CLI command
  // Optional if you want to define explicit routes for static export
  // exportPathMap: async () => {
  //   return {
  //     '/': { page: '/' },
  //     '/about': { page: '/about' },
  //     '/contact': { page: '/contact' },
  //     // Add other routes here
  //   };
  // },
};

module.exports = nextConfig;
