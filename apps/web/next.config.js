const path = require('path')

// Load root .env so NEXT_PUBLIC_* vars are available
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@expirationreminderai/shared'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://expirationreminderai.com',
        NEXT_PUBLIC_LS_VARIANT_ID_PRO: process.env.LEMONSQUEEZY_VARIANT_ID_PRO,
        NEXT_PUBLIC_LS_VARIANT_ID_TEAM: process.env.LEMONSQUEEZY_VARIANT_ID_TEAM,
    },
}

module.exports = nextConfig
