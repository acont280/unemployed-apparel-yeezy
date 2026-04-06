/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-api.printify.com",
      },
      {
        protocol: "https",
        hostname: "images.printify.com",
      },
      {
        protocol: "https",
        hostname: "pfy-prod-products-mockup-media.s3.us-east-2.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
