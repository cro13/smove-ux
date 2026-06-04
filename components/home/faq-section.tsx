'use client'

import { FadeIn } from '@/components/animations/fade-in'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'

const faqItems = [
	{
		question: 'What is Smove AI?',
		answer:
			'Smove AI provides AI-powered social media agents (Mel, Mark, and Gabby) that automate content creation for agencies. Each agent specializes in a platform: Mel handles Instagram, Mark manages LinkedIn, and Gabby takes care of Facebook. They work autonomously while following your brand guidelines.',
	},
	{
		question: 'How does the pricing work?',
		answer:
			'As an agency, you never lose money on Smove. You pay per agent per client, so you can directly transfer all cost and add your margin. Please get in touch with us for the details.',
	},
	{
		question: 'Which platforms does Smove support?',
		answer:
			"Currently, Smove supports Instagram (Mel), LinkedIn (Mark), and Facebook (Gabby). Each agent is optimized for its platform's unique requirements, algorithms, and best practices. We're continuously expanding platform support based on agency needs.",
	},
	{
		question: "How do agents learn my client's brand voice?",
		answer:
			'During onboarding, you upload brand guidelines, tone of voice documents, content examples, and define content buckets. Our agents analyze this information and maintain consistency across all generated content. The more context you provide, the better the output.',
	},
	{
		question: 'Can clients approve content before publishing?',
		answer:
			'Absolutely. Our human-in-the-loop workflow means clients can approve, request changes, or decline content with a single click. Nothing gets published without explicit approval, ensuring complete brand safety and client satisfaction.',
	},
	{
		question: 'How long does onboarding take?',
		answer:
			'Most agencies are up and running within 24-48 hours. The process involves uploading brand assets, configuring agent preferences, and connecting social accounts. Our team provides dedicated support to ensure a smooth setup.',
	},
]

export function FaqSection() {
	return (
		<FadeIn>
			<section id="faq" className="py-24 px-6 bg-gray-50">
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-5xl text-gray-900 mb-4">
							Frequently Asked Questions
						</h2>
						<p className="text-gray-600">
							Everything you need to know about Smove AI agents.
						</p>
					</div>
					<Accordion className="space-y-3">
						{faqItems.map((item, index) => (
							<AccordionItem
								key={index}
								value={`item-${index}`}
								className="rounded-2xl bg-white border border-gray-200 px-5"
							>
								<AccordionTrigger className="py-4 text-sm font-medium text-gray-900 hover:no-underline">
									{item.question}
								</AccordionTrigger>
								<AccordionContent className="text-gray-600 leading-relaxed text-sm">
									<p>{item.answer}</p>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>
		</FadeIn>
	)
}
