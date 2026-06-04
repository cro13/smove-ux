'use client'

import { motion } from 'framer-motion'

import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, staggerItemVariants } from '@/components/animations/stagger-children'

const features = [
	{
		title: 'Infinite Scalability',
		description:
			'Handle 10x more clients without hiring more content creators. Our agents work parallelly across multiple accounts.',
	},
	{
		title: 'Brand Guidelines',
		description:
			"Smove doesn't hallucinate on brand voice or Corporate Design. Configure the brand once, and get compliant content pieces every time.",
	},
	{
		title: 'Performance Optimization',
		description:
			'Our agents track the performance of their content depending on your clients goals. They adapt their strategies based on the performance data.',
	},
	{
		title: '90% Time Saved',
		description:
			'Once set up, Smove agents work fully on schedule, directly sending content to your client and posting after approval. Your team has more time to focus on strategy and being creative.',
	},
	{
		title: '50% cost reduction',
		description:
			'Integrated human-in-the-loop workflow. Clients can approve, reject, or comment on AI drafts with a single click.',
	},
	{
		title: 'Platform Optimized',
		description:
			'Mel, Mark, and Gabby know the algorithms. Content is automatically formatted for maximum reach on each specific platform.',
	},
]

export function FeaturesGrid() {
	return (
		<section className="py-20 md:py-28 px-6 bg-white" id="benefits">
			<div className="max-w-6xl mx-auto">
				<FadeIn className="text-center mb-14">
					<h2 className="text-3xl md:text-5xl text-gray-900 mb-4">
						Why Agencies
						<br />
						Choose Smove Agents
					</h2>
					<p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
						Scale your content production without scaling your headcount.
						Purpose-built for the high standards of Swiss and German agencies.
					</p>
				</FadeIn>

				<StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5" staggerDelay={0.08}>
					{features.map((feature) => (
						<motion.div
							key={feature.title}
							className="rounded-2xl bg-gray-50 p-6"
							variants={staggerItemVariants}
							whileHover={{ y: -4, backgroundColor: '#F3F4F6' }}
							transition={{ duration: 0.25 }}
						>
							<h3 className="text-base font-semibold text-gray-900 mb-3">
								{feature.title}
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								{feature.description}
							</p>
						</motion.div>
					))}
				</StaggerChildren>
			</div>
		</section>
	)
}
