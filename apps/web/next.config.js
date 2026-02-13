const path = require('path')

// Load root .env so NEXT_PUBLIC_* vars are available
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@clausehunter/shared'],
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://clausehunter.com',
    },
}

module.exports = nextConfig
