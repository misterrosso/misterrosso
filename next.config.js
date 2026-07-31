/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cxnajhlzhqhmldnqeynf.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;