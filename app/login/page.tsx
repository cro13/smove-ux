'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

const SMOVE_LOGO =
	'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4ebd8e68-4cde-439b-8859-2820929ed47a_320w.png'

export default function LoginPage() {
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const { signIn } = useAuthActions()
	const router = useRouter()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)
		formData.set('flow', 'signIn')

		try {
			await signIn('password', formData)
			router.push('/brands')
		} catch {
			setError('Invalid email or password.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-white px-6 py-12 flex flex-col">
			<header className="flex items-center justify-between max-w-4xl mx-auto w-full mb-12">
				<Link href="/" className="flex items-center" aria-label="Smove home">
					<span
						className="block w-20 h-[15px] bg-cover"
						style={{ backgroundImage: `url(${SMOVE_LOGO})` }}
					/>
				</Link>
				<p className="text-sm text-gray-500">
					New to Smove?{' '}
					<Link
						href="/register"
						className="text-gray-900 font-medium underline underline-offset-4 hover:no-underline"
					>
						Create an account
					</Link>
				</p>
			</header>

			<main className="flex-1 flex items-center justify-center">
				<motion.div
					className="w-full max-w-sm"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				>
					<div className="text-center mb-8">
						<h1
							className="text-3xl md:text-4xl text-gray-900 mb-2"
							style={{ letterSpacing: '-0.05em', lineHeight: 1.1 }}
						>
							Welcome back
						</h1>
						<p className="text-sm text-gray-500">
							Sign in to your Smove account
						</p>
					</div>

					<div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm">
						{error && (
							<motion.div
								className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
							>
								{error}
							</motion.div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<label className="block">
								<span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
									Email
								</span>
								<input
									name="email"
									type="email"
									autoComplete="email"
									placeholder="jane@agency.com"
									required
									className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
									Password
								</span>
								<input
									name="password"
									type="password"
									autoComplete="current-password"
									placeholder="••••••••"
									required
									className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
								/>
							</label>
							<button
								type="submit"
								disabled={isLoading}
								className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
							>
								{isLoading ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Signing in…
									</>
								) : (
									<>
										Sign in
										<ArrowRight className="size-4" />
									</>
								)}
							</button>
						</form>
					</div>

					<p className="text-center text-xs text-gray-400 mt-6">
						Don&apos;t have an account?{' '}
						<Link
							href="/register"
							className="text-gray-700 font-medium underline underline-offset-4 hover:no-underline"
						>
							Get started
						</Link>
					</p>
				</motion.div>
			</main>
		</div>
	)
}
