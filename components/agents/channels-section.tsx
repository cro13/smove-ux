'use client'

import { motion } from 'framer-motion'

import { FadeIn } from '@/components/animations/fade-in'
import { StaggerChildren, staggerItemVariants } from '@/components/animations/stagger-children'

const channels = [
	{
		name: 'Mark',
		platform: 'LinkedIn',
		description:
			'Great for structured argumentation, thought leadership, employer branding and B2B-communication',
		features: ['LinkedIn Hook Library', 'Trained on Best-Practises'],
		color: 'from-blue-500 to-blue-700',
	},
	{
		name: 'Mel',
		platform: 'Instagram',
		description:
			'Perfect for visual storytelling, infotainment, strengthening brand loyalty and boosting brand connection.',
		features: ['Instagram Hook Library', 'Trained on Best-Practises'],
		color: 'from-pink-500 to-purple-600',
	},
	{
		name: 'Gabby',
		platform: 'Facebook',
		description:
			'Ideal for building Facebook brand awareness, reaching older audiences, generating website traffic and strengthening loyalty.',
		features: ['Facebook Hook Library', 'Trained on Best-Practises'],
		color: 'from-blue-600 to-indigo-600',
	},
	{
		name: 'Smove Pro',
		platform: 'All Platforms',
		description:
			'Contains all agents, perfect for creating brand touchpoints across channels, each with a platform specific audience and content approach.',
		features: ['Linkedin, Instagram, Facebook', 'Ideal Multi-channel Flow'],
		color: 'from-primary to-violet-600',
		highlight: true,
	},
]

export function ChannelsSection({ onGetStarted }: { onGetStarted: () => void }) {
	return (
		<section className="py-24 px-6">
			<div className="max-w-7xl mx-auto">
				<FadeIn className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Channels</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						Three agents for the channels your client wants to post on. Mark for
						LinkedIn, Mel for Instagram and Gabby for Facebook.
					</p>
				</FadeIn>

				<FadeIn className="text-center mb-12">
					<button
						onClick={onGetStarted}
						className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4 font-medium"
					>
						Get started
					</button>
				</FadeIn>

				<StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.15}>
					{channels.map((channel) => (
						<motion.div
							key={channel.name}
							className={`relative p-8 rounded-2xl border ${
								channel.highlight
									? 'border-primary shadow-lg shadow-primary/5'
									: 'border-border'
							} bg-background hover:shadow-md transition-all`}
							variants={staggerItemVariants}
							whileHover={{ y: -4, scale: 1.01 }}
							transition={{ duration: 0.2 }}
						>
							<div className="flex items-center gap-4 mb-4">
								<div
									className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${channel.color} flex items-center justify-center text-white font-bold text-lg`}
								>
									{channel.name[0]}
								</div>
								<div>
									<h3 className="text-lg font-bold">
										{channel.name}
										{channel.platform !== 'All Platforms' && (
											<span className="text-muted-foreground font-normal"> for {channel.platform}</span>
										)}
									</h3>
								</div>
							</div>

							<p className="text-sm text-muted-foreground leading-relaxed mb-4">
								{channel.description}
							</p>

							<ul className="space-y-2">
								{channel.features.map((feature) => (
									<li key={feature} className="flex items-center gap-2 text-sm">
										<span className="text-success text-xs">&#10003;</span>
										{feature}
									</li>
								))}
							</ul>
						</motion.div>
					))}
				</StaggerChildren>
			</div>
		</section>
	)
}
