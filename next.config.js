/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features
const withTM = require('next-transpile-modules')([
  '@fullcalendar/common',
  '@fullcalendar/react',
  '@fullcalendar/daygrid',
  '@fullcalendar/list',
  '@fullcalendar/timegrid'
])

module.exports = withTM({
  trailingSlash: true,
  reactStrictMode: false,
  experimental: {
    esmExternals: false
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Option 1: Ignore TypeScript errors (less safe, but quicker fix)
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // Option 2: Don't ignore TypeScript errors (safer, but requires fixing type issues)
  typescript: {
    ignoreBuildErrors: false
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    // Exclude Supabase functions from webpack processing
    config.externals = [...(config.externals || []), 'supabase']

    return config
  }
})
