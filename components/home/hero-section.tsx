'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

const VIDEO_SRC = 'https://smove.ai/attached_assets/smove-demo_1766337172933.webm'
const VIDEO_POSTER = 'https://smove.ai/attached_assets/smove-poster_1766337172932.png'

function GemIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden
		>
			<path d="M10.5 3 8 9l4 13 4-13-2.5-6" />
			<path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />
			<path d="M2 9h20" />
		</svg>
	)
}

function CpuIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden
		>
			<path d="M12 20v2" />
			<path d="M12 2v2" />
			<path d="M17 20v2" />
			<path d="M17 2v2" />
			<path d="M2 12h2" />
			<path d="M2 17h2" />
			<path d="M2 7h2" />
			<path d="M20 12h2" />
			<path d="M20 17h2" />
			<path d="M20 7h2" />
			<path d="M7 20v2" />
			<path d="M7 2v2" />
			<rect x="4" y="4" width="16" height="16" rx="2" />
			<rect x="8" y="8" width="8" height="8" rx="1" />
		</svg>
	)
}

export function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
	return (
		<section className="relative px-6 pt-32 pb-0 overflow-hidden bg-white">
			<div className="max-w-4xl mx-auto text-center">
				<motion.div
					className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/30 text-xs font-medium text-primary mb-6"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					AI FOR AGENCIES
				</motion.div>

				<motion.h1
					className="text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6"
					style={{ letterSpacing: '-0.05em', lineHeight: 1.1 }}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					Never worry about
					<br />
					Client Socials again.
				</motion.h1>

				<motion.p
					className="text-base text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
				>
					We deploy AI agents to help agencies save 80% of their time on social
					media retainers without compromising on quality.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.7 }}
				>
					<Button
						onClick={onGetStarted}
						className="rounded-full h-11 px-6 text-sm gap-2 bg-primary text-white hover:bg-primary/90 shadow-md"
					>
						Get started
						<ArrowRight className="size-4" />
					</Button>
				</motion.div>

				<motion.div
					className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.9 }}
				>
					<div className="flex items-center gap-3">
						<div className="flex w-10 h-10 rounded-lg bg-blue-100 items-center justify-center">
							<GemIcon className="w-5 h-5 text-blue-500" />
						</div>
						<div className="flex flex-col text-left">
							<span className="text-sm font-medium text-gray-900 leading-tight">
								Backed by VC funds
							</span>
							<span className="text-xs text-gray-400">From Switzerland</span>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex w-10 h-10 rounded-lg bg-blue-100 items-center justify-center">
							<CpuIcon className="w-5 h-5 text-blue-500" />
						</div>
						<div className="flex flex-col text-left">
							<span className="text-sm font-medium text-gray-900 leading-tight">
								Powered by STOT
							</span>
							<span className="text-xs text-gray-400">
								OpenAI, Gemini, Anthropic
							</span>
						</div>
					</div>
				</motion.div>
			</div>

			<motion.div
				className="mt-12 flex justify-center"
				initial={{ opacity: 0, y: 60, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 1.0, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
			>
				<motion.div
					className="relative w-fit"
					animate={{ y: [0, -10, 0] }}
					transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
				>
					<video
						autoPlay
						loop
						muted
						playsInline
						poster={VIDEO_POSTER}
						aria-label="Smove AI Automation Character Video"
						className={[
							'block h-auto w-auto max-h-[420px] mix-blend-multiply',
							'[clip-path:inset(0_3px_0_0)]',
						].join(' ')}
					>
						<source src={VIDEO_SRC} type="video/webm" />
					</video>
				</motion.div>
			</motion.div>
		</section>
	)
}
