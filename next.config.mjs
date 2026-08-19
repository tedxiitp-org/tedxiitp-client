/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      root: 'C:/Users/iamka/Desktop/qrtedx/qr_management/frontend',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tedxiitpatna.iitp.ac.in",
        port: "",
        pathname: "/**", 
      },
    ],
  },
};

export default nextConfig;
