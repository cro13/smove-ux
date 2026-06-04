'use client'

import { motion } from 'framer-motion'

import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, staggerItemVariants } from '@/components/animations/stagger-children'

const features = [
	{
		prefix: 'Smove can',
		title: 'Research relevant topics autonomously.',
		description:
			"Mel, Mark and Gabby analyze your clients target audience and data to find trending, high-impact ideas that fit their strategy perfectly.",
	},
	{
		prefix: 'Smove can',
		title: "Write authentic copy in your clients tone of voice",
		description:
			'The Smoves write headlines, captions and hooks that strictly follow your specific Tone-of-Voice, ensuring no generic "AI sound."',
	},
	{
		prefix: 'Smove can',
		title: 'Create brand-compliant layouts and designs.',
		description:
			"Our agents use dynamic templates to build professional graphics that match your clients CI/CD, ensuring consistency and quality. We train custom image models for each brands unique image style.",
	},
	{
		prefix: 'Smove can',
		title: 'Ensure safety through client approval loops.',
		description:
			'Your clients maintain brand safety with a human-in-the-loop workflow. Clients review, feedback, and approve every post before publishing.',
	},
	{
		prefix: 'Smove can',
		title: 'Gather content performance data.',
		description:
			'Mark, Mel and Gabby continuously collect and interpret the content performance data to regularly provide clear, transparent reporting for your clients.',
	},
]

export function FeaturesShowcase() {
	return (
		<section className="py-24 px-6 bg-muted/50">
			<div className="max-w-7xl mx-auto">
				<FadeIn className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Features</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						No more tool-hopping. Smove turns Social Media Content Creation into
						a one-time task for your agency and continuous value for your
						clients.
					</p>
				</FadeIn>

				<StaggerChildren className="space-y-6 max-w-4xl mx-auto" staggerDelay={0.12}>
					{features.map((feature, index) => (
						<motion.div
							key={index}
							className="group p-8 rounded-2xl border border-border bg-background hover:shadow-md transition-all"
							variants={staggerItemVariants}
							whileHover={{ x: 4 }}
						>
							<span className="text-xs uppercase tracking-widest text-primary font-medium mb-2 block">
								{feature.prefix}
							</span>
							<h3 className="text-xl font-bold mb-3">{feature.title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</motion.div>
					))}
				</StaggerChildren>
			</div>
		</section>
	)
}
