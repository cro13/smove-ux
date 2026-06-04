'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'

import { FadeIn } from '@/components/animations/fade-in'
import { Button } from '@/components/ui/button'

type BillingPeriod = 'annual' | 'monthly'

const plans = {
	single: {
		name: 'Smove Single',
		description: 'Perfect for specific platform focus.',
		annual: { price: 239, saved: 158 },
		monthly: { price: 299, saved: 0 },
		features: ['1 Agent of your choice', 'Mel, Mark or Gabby'],
		popular: false,
	},
	pro: {
		name: 'Smove Pro',
		description: 'Full agency automation suite.',
		annual: { price: 559, saved: 158 },
		monthly: { price: 699, saved: 0 },
		features: ['All 3 AI Agents included', 'Cross-platform synergy'],
		popular: true,
	},
}

export function PricingSection() {
	const [billing, setBilling] = useState<BillingPeriod>('annual')

	return (
		<section className="py-24 px-6 bg-muted/50">
			<div className="max-w-5xl mx-auto">
				<FadeIn className="text-center mb-12">
					<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
						How much does Smove cost?
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						Smove offers flexible pricing starting from free, with paid plans
						from CHF 299/month per client. Designed for agencies to never lose
						money.
					</p>
				</FadeIn>

				<FadeIn className="flex justify-center mb-12" delay={0.1}>
					<div className="flex items-center gap-1 p-1 bg-background rounded-full border border-border shadow-sm">
						<button
							className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
								billing === 'annual'
									? 'bg-primary text-primary-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
							onClick={() => setBilling('annual')}
						>
							Annual (20% off)
						</button>
						<button
							className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
								billing === 'monthly'
									? 'bg-primary text-primary-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}
							onClick={() => setBilling('monthly')}
						>
							Monthly
						</button>
					</div>
				</FadeIn>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{Object.entries(plans).map(([key, plan]) => (
						<FadeIn key={key} delay={key === 'pro' ? 0.2 : 0.1}>
							<motion.div
								className={`relative p-8 rounded-2xl border ${
									plan.popular
										? 'border-primary shadow-lg shadow-primary/10'
										: 'border-border bg-background'
								}`}
								whileHover={{ y: -4 }}
								transition={{ duration: 0.2 }}
							>
								{plan.popular && (
									<span className="absolute -top-3 left-8 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
										MOST POPULAR
									</span>
								)}

								<h3 className="text-xl font-bold mb-2">{plan.name}</h3>
								<p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

								<AnimatePresence mode="wait">
									<motion.div
										key={billing}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.2 }}
										className="mb-6"
									>
										<div className="flex items-baseline gap-1">
											<span className="text-4xl font-bold">
												CHF {plan[billing].price}
											</span>
											<span className="text-muted-foreground">/mo</span>
										</div>
										{billing === 'annual' && (
											<p className="text-sm text-success font-medium mt-1">
												Billed annually &middot; Save CHF {plan[billing].saved}/mo
											</p>
										)}
									</motion.div>
								</AnimatePresence>

								<ul className="space-y-3 mb-8">
									{plan.features.map((feature) => (
										<li
											key={feature}
											className="flex items-center gap-3 text-sm"
										>
											<Check className="size-4 text-success flex-shrink-0" />
											{feature}
										</li>
									))}
								</ul>

								<Button
									variant={plan.popular ? 'default' : 'outline'}
									className={`w-full h-11 rounded-full ${plan.popular ? '' : ''}`}
								>
									Get Started
								</Button>
							</motion.div>
						</FadeIn>
					))}
				</div>

				<FadeIn className="text-center mt-8" delay={0.3}>
					<p className="text-sm text-muted-foreground">
						Platform fee: CHF 99/month after your first paying client (flat rate,
						doesn&apos;t scale)
					</p>
				</FadeIn>
			</div>
		</section>
	)
}
