import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	turbopack: {
		root: __dirname,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'hoirqrkdgbmvpwutwuwj.supabase.co',
				pathname: '/storage/v1/object/public/assets/**',
			},
			{
				protocol: 'https',
				hostname: 'smove.ai',
			},
			{
				protocol: 'https',
				hostname: '*.convex.cloud',
			},
		],
	},
}

export default nextConfig
