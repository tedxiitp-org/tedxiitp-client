/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
