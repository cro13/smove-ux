'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, staggerItemVariants } from '@/components/animations/stagger-children'
import { Button } from '@/components/ui/button'

const SUPABASE = 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets'

const steps = [
	{
		title: 'Set up the brand',
		description:
			'Share your clients brand guidelines, tone of voice, and content buckets. Our AI agents learn the brands unique style.',
		image: `${SUPABASE}/8e7c5ba6-10b3-4669-aa4f-a8874c9678cf_800w.png`,
		alt: 'Step 1 - Upload your brand',
	},
	{
		title: 'AI generates content',
		description:
			'Mel, Mark, and Gabby create platform-optimized content by schedule without your team lifting a finger.',
		image: `${SUPABASE}/cad8e5b1-e6d7-4d83-89c1-c328767a59e0_800w.png`,
		alt: 'Step 2 - AI generates content',
	},
	{
		title: 'Review & publish',
		description:
			'Your client approves, edits, or declines content with one click. Human-in-the-loop ensures brand safety.',
		image: `${SUPABASE}/cb755424-2b60-435e-8b2d-315622d87282_800w.png`,
		alt: 'Step 3 - Review and publish',
	},
]

export function HowItWorks({ onGetStarted }: { onGetStarted: () => void }) {
	return (
		<section id="how-it-works" className="py-24 px-6 bg-white">
			<div className="max-w-6xl mx-auto">
				<FadeIn className="text-center mb-14">
					<h2 className="text-3xl md:text-5xl text-gray-900 mb-4">
						How it works.
					</h2>
					<p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
						Set up your brand, let AI create content, then approve and publish
						all in three simple steps. Boom, your agency&apos;s social media
						workflow is now automated.
					</p>
				</FadeIn>

				<StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" staggerDelay={0.15}>
					{steps.map((step) => (
						<motion.div
							key={step.title}
							className="text-center"
							variants={staggerItemVariants}
						>
							<div className="rounded-2xl overflow-hidden mb-5 bg-gray-50">
								<Image
									src={step.image}
									alt={step.alt}
									width={800}
									height={600}
									className="w-full h-auto"
								/>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								{step.title}
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed px-2">
								{step.description}
							</p>
						</motion.div>
					))}
				</StaggerChildren>

				<FadeIn className="text-center" delay={0.4}>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							onClick={onGetStarted}
							className="rounded-full h-10 px-5 gap-2 bg-primary text-white hover:bg-primary/90 text-sm"
						>
							Get Started
							<ArrowRight className="size-4" />
						</Button>
						<Button variant="outline" className="rounded-full h-10 px-5 text-sm">
							Learn more
						</Button>
					</div>
				</FadeIn>
			</div>
		</section>
	)
}
