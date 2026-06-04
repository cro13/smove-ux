'use client'

import { FadeIn } from '@/components/animations/fade-in'
import { Marquee } from '@/components/animations/marquee'

const testimonials = [
	{
		name: 'Anna Müller',
		role: 'Creative Director, Zürich',
		text: 'Smove has transformed how we handle social media for our clients. What used to take days now takes minutes.',
	},
	{
		name: 'Thomas Weber',
		role: 'Agency Owner, Berlin',
		text: "The AI agents understand our clients' brand voices perfectly. It's like having three extra team members.",
	},
	{
		name: 'Sophie Laurent',
		role: 'Marketing Lead, Geneva',
		text: 'Multi-language support is flawless. German, French, English—all perfectly on-brand every time.',
	},
	{
		name: 'Marco Bernardi',
		role: 'Social Media Manager, Munich',
		text: "We've 10x'd our client capacity without adding headcount. The ROI speaks for itself.",
	},
]

const testimonials2 = [
	{
		name: 'Lisa Schneider',
		role: 'Account Manager, Vienna',
		text: 'Client approval workflow is seamless. One click and content goes live. No more endless email chains.',
	},
	{
		name: 'Jan Fischer',
		role: 'Digital Strategist, Hamburg',
		text: "Finally, AI that doesn't hallucinate brand guidelines. Every post is exactly on-brand, every time.",
	},
	{
		name: 'Elena Rossi',
		role: 'Content Lead, Basel',
		text: "Mel's Instagram content consistently outperforms what we used to create manually. Engagement is up 40%.",
	},
	{
		name: 'David Meier',
		role: 'CEO, Frankfurt',
		text: 'The human-in-the-loop approach gives us confidence. AI creates, humans approve. Perfect balance.',
	},
]

function TestimonialCard({ name, role, text }: { name: string; role: string; text: string }) {
	return (
		<div className="flex-shrink-0 w-[350px] p-6 rounded-2xl border border-border bg-background shadow-sm">
			<p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
					{name[0]}
				</div>
				<div>
					<p className="text-sm font-medium text-foreground">{name}</p>
					<p className="text-xs text-muted-foreground">{role}</p>
				</div>
			</div>
		</div>
	)
}

export function TestimonialsMarquee() {
	return (
		<section className="py-24 overflow-hidden">
			<FadeIn className="text-center mb-12 px-6">
				<p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
					What agencies say
				</p>
				<h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Testimonials</h2>
				<p className="text-muted-foreground">Real feedback from agencies</p>
			</FadeIn>

			<div className="space-y-6">
				<Marquee speed={45}>
					{testimonials.map((t) => (
						<TestimonialCard key={t.name} {...t} />
					))}
				</Marquee>

				<Marquee reverse speed={45}>
					{testimonials2.map((t) => (
						<TestimonialCard key={t.name} {...t} />
					))}
				</Marquee>
			</div>
		</section>
	)
}
