'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function AgentsHero({ onGetStarted }: { onGetStarted: () => void }) {
	return (
		<section className="relative min-h-[70vh] flex items-center justify-center px-6 pt-24 overflow-hidden">
			<div className="relative max-w-4xl mx-auto text-center">
				<motion.h1
					className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
				>
					Meet your AI{' '}
					<span className="text-primary">Content Creators</span>
				</motion.h1>

				<motion.p
					className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					With Smove, your social media management never stops. Built for
					simplicity and powered by AI agents.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Button
						onClick={onGetStarted}
						className="rounded-full h-12 px-7 text-base gap-2"
						size="lg"
					>
						Get Started
						<ArrowRight className="size-4" />
					</Button>
				</motion.div>
			</div>
		</section>
	)
}
