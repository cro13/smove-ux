'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Building2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const SUPABASE =
	'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets'

const SMOVE_LOGO = `${SUPABASE}/4ebd8e68-4cde-439b-8859-2820929ed47a_320w.png`
const AGENCY_IMAGE = `${SUPABASE}/cad8e5b1-e6d7-4d83-89c1-c328767a59e0_800w.png`
const BRAND_IMAGE = `${SUPABASE}/afa7b720-7f42-46a3-8410-8a3d48a4d3ac_1600w.png`

type Role = {
	id: 'agency' | 'brand'
	title: string
	tagline: string
	description: string
	image: string
	href: string
	Icon: typeof Building2
	accent: string
	imageBg: string
}

const ROLES: Role[] = [
	{
		id: 'agency',
		title: 'For Agencies',
		tagline: 'Scale your content production',
		description:
			'Onboard clients, configure AI agents per brand, and ship platform-optimized content on schedule.',
		image: AGENCY_IMAGE,
		href: '/register/agency',
		Icon: Sparkles,
		accent: 'from-blue-50 to-indigo-50',
		imageBg: 'bg-gradient-to-b from-blue-50 to-blue-100/50',
	},
	{
		id: 'brand',
		title: 'For Brands',
		tagline: 'Approve and track everything',
		description:
			'Review, approve, or comment on AI-drafted content with one click. See performance across every platform.',
		image: BRAND_IMAGE,
		href: '/register/brand',
		Icon: Building2,
		accent: 'from-rose-50 to-pink-50',
		imageBg: 'bg-gradient-to-b from-rose-50 to-rose-100/50',
	},
]

export default function RegisterPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-white px-6 py-12 flex flex-col">
			<header className="flex items-center justify-between max-w-6xl mx-auto w-full">
				<Link href="/" className="flex items-center" aria-label="Smove home">
					<span
						className="block w-20 h-[15px] bg-cover"
						style={{ backgroundImage: `url(${SMOVE_LOGO})` }}
					/>
				</Link>
				<p className="text-sm text-gray-500">
					Already have an account?{' '}
					<Link
						href="/login"
						className="text-gray-900 font-medium underline underline-offset-4 hover:no-underline"
					>
						Sign in
					</Link>
				</p>
			</header>

			<main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full py-12">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
				>
					<span className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 text-xs font-medium text-primary mb-5">
						GET STARTED
					</span>
					<h1
						className="text-4xl md:text-5xl text-gray-900 mb-3"
						style={{ letterSpacing: '-0.05em', lineHeight: 1.1 }}
					>
						How will you use Smove?
					</h1>
					<p className="text-gray-600 max-w-md mx-auto">
						Pick the option that fits. You can always change this later.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
					{ROLES.map((role, i) => (
						<motion.div
							key={role.id}
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.6,
								delay: 0.2 + i * 0.12,
								ease: [0.22, 1, 0.36, 1],
							}}
						>
							<Link
								href={role.href}
								className="group block h-full"
							>
								<motion.div
									className="relative h-full rounded-3xl bg-white border border-gray-200 overflow-hidden flex flex-col"
									whileHover={{ y: -6 }}
									transition={{ duration: 0.25 }}
									style={{
										boxShadow:
											'0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
									}}
								>
									<div
										className={`relative ${role.imageBg} h-56 overflow-hidden`}
									>
										<motion.div
											className="absolute inset-0 flex items-center justify-center"
											whileHover={{ scale: 1.06 }}
											transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
										>
											<Image
												src={role.image}
												alt=""
												width={800}
												height={600}
												className="w-auto h-full max-h-[260px] object-contain"
											/>
										</motion.div>
									</div>

									<div className="p-7 flex-1 flex flex-col">
										<div className="flex items-center gap-2 mb-2">
											<div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
												<role.Icon className="w-4 h-4 text-primary" />
											</div>
											<span className="text-xs font-semibold uppercase tracking-wider text-primary">
												{role.tagline}
											</span>
										</div>

										<h2 className="text-2xl font-semibold text-gray-900 mb-2">
											{role.title}
										</h2>
										<p className="text-sm text-gray-600 leading-relaxed flex-1">
											{role.description}
										</p>

										<div className="mt-6 flex items-center justify-between pt-5 border-t border-gray-100">
											<span className="text-sm font-medium text-gray-900">
												Continue as {role.id}
											</span>
											<motion.div
												className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white"
												whileHover={{ x: 4 }}
												transition={{ duration: 0.2 }}
											>
												<ArrowRight className="size-4" />
											</motion.div>
										</div>
									</div>

									<div className="absolute inset-0 rounded-3xl ring-2 ring-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
								</motion.div>
							</Link>
						</motion.div>
					))}
				</div>

				<motion.p
					className="text-xs text-gray-400 mt-10 text-center max-w-md"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					By continuing you agree to our{' '}
					<Link href="/terms" className="underline hover:text-gray-600">
						Terms
					</Link>{' '}
					and{' '}
					<Link href="/privacy" className="underline hover:text-gray-600">
						Privacy Policy
					</Link>
					.
				</motion.p>
			</main>
		</div>
	)
}
