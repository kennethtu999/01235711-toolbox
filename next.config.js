/** @type {import('next').NextConfig} */
const nextConfig = {
  // 只在靜態導出建置時啟用這些設定
  ...(process.env.NEXT_EXPORT === 'true' && {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
  }),
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig 