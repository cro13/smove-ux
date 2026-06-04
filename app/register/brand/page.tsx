'use client'

import Link from 'next/link'

export default function RegisterBrandPage() {
	return (
		<div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-rose-50/40 via-white to-white">
			<div className="max-w-md text-center">
				<span className="inline-flex items-center px-3 py-1 rounded-full border border-rose-400/40 text-xs font-medium text-rose-500 mb-5">
					BRAND SIGN UP
				</span>
				<h1
					className="text-3xl text-gray-900 mb-3"
					style={{ letterSpacing: '-0.05em', lineHeight: 1.1 }}
				>
					Brand signup coming next
				</h1>
				<p className="text-sm text-gray-600 mb-6 leading-relaxed">
					This is a placeholder. The redesigned brand onboarding flow lands in
					the next iteration.
				</p>
				<Link
					href="/register"
					className="text-sm text-primary font-medium underline underline-offset-4 hover:no-underline"
				>
					← Back to role selection
				</Link>
			</div>
		</div>
	)
}
