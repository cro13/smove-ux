'use client'

import { useState } from 'react'

import { AgentsHero } from '@/components/agents/agents-hero'
import { ChannelsSection } from '@/components/agents/channels-section'
import { FeaturesShowcase } from '@/components/agents/features-showcase'
import { CtaSection } from '@/components/home/cta-section'
import { FaqSection } from '@/components/home/faq-section'
import { FloatingRoles } from '@/components/home/floating-roles'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { WaitlistForm } from '@/components/ui/waitlist-form'

export default function AgentsPage() {
	const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

	const handleGetStarted = () => setIsWaitlistOpen(true)

	return (
		<>
			<Navbar />
			<main className="flex-1">
				<AgentsHero onGetStarted={handleGetStarted} />
				<ChannelsSection onGetStarted={handleGetStarted} />
				<FeaturesShowcase />
				<FloatingRoles />
				<CtaSection onGetStarted={handleGetStarted} />
				<FaqSection />
			</main>
			<Footer />
			<WaitlistForm
				isOpen={isWaitlistOpen}
				onClose={() => setIsWaitlistOpen(false)}
			/>
		</>
	)
}
