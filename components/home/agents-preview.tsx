'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, staggerItemVariants } from '@/components/animations/stagger-children'

const SUPABASE = 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets'

const agents = [
	{
		name: 'Mel',
		role: 'Instagram Content Manager',
		description:
			'Mel uses your brand insights to craft compelling Instagram posts, design engaging Reels scripts, and build content calendars that drive engagement.',
		image: `${SUPABASE}/eae68ca2-0879-4538-84ad-d36e73c484ad_800w.png`,
		alt: 'Mel - Instagram AI Content Agent for Social Media Marketing',
	},
	{
		name: 'Mark',
		role: 'LinkedIn Content Strategist',
		description:
			'Your go-to AI for B2B content marketing, crafting thought leadership posts and delivering employer branding insights.',
		image: `${SUPABASE}/c958c741-fdfa-41fd-a7ce-d985e3ccc404_800w.png`,
		alt: 'Mark - LinkedIn AI Content Agent for B2B Marketing',
	},
	{
		name: 'Gabby',
		role: 'Facebook Community Specialist',
		description:
			"Gabby crafts expertly tailored responses to community interactions while maintaining your brand's unique voice.",
		image: `${SUPABASE}/f4843aa9-d334-4547-af69-d3c96b186fbf_800w.png`,
		alt: 'Gabby - Facebook AI Content Agent for Community Management',
	},
]

export function AgentsPreview() {
	return (
		<section className="py-24 px-6 bg-white" id="agents">
			<div className="max-w-6xl mx-auto">
				<FadeIn className="text-center mb-12">
					<h2 className="text-3xl md:text-5xl text-gray-900 mb-4">
						Meet Your AI Team
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
						Three specialized AI agents for Instagram, LinkedIn, and Facebook
						content creation. Automate your agency&apos;s social media workflow
						with intelligent automation.
					</p>
				</FadeIn>

				<StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.15}>
					{agents.map((agent) => (
						<motion.div
							key={agent.name}
							className="group"
							variants={staggerItemVariants}
							whileHover={{ y: -6 }}
							transition={{ duration: 0.3 }}
						>
							<div className="rounded-2xl overflow-hidden mb-5">
								<motion.div
									whileHover={{ scale: 1.04 }}
									transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
								>
									<Image
										src={agent.image}
										alt={agent.alt}
										width={800}
										height={800}
										className="w-full h-auto"
									/>
								</motion.div>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								{agent.name}
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								<span className="font-semibold text-gray-900">{agent.role}.</span>{' '}
								{agent.description}
							</p>
						</motion.div>
					))}
				</StaggerChildren>
			</div>
		</section>
	)
}
