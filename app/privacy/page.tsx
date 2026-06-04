import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

export default function PrivacyPage() {
	return (
		<>
			<Navbar />
			<main className="flex-1 pt-32 pb-24 px-6">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl md:text-4xl font-bold mb-8">
						Privacy Policy
					</h1>
					<p className="text-sm text-muted-foreground mb-8">
						Last updated: January 2025
					</p>

					<section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								1. Information We Collect
							</h2>
							<p>
								We collect information you provide directly to us, such as when
								you create an account, join our waitlist, or contact us. This
								includes your name, email address, company name, phone number,
								and any other information you choose to provide.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								2. How We Use Your Information
							</h2>
							<p>
								We use the information we collect to provide, maintain, and
								improve our services, to communicate with you about products,
								services, and events, and to personalize your experience with
								Smove AI.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								3. Information Sharing
							</h2>
							<p>
								We do not share your personal information with third parties
								except as described in this privacy policy, with your consent,
								or as required by law.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								4. Data Security
							</h2>
							<p>
								We take reasonable measures to help protect your personal
								information from loss, theft, misuse, and unauthorized access.
								All data is encrypted in transit and at rest.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								5. Your Rights
							</h2>
							<p>
								Under GDPR and Swiss data protection laws, you have the right
								to access, correct, delete, or port your personal data. You may
								also object to processing or request restriction of processing.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								6. Cookies
							</h2>
							<p>
								We use essential cookies to ensure our services function
								properly. We may also use analytics cookies to understand how
								visitors interact with our website.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								7. Contact Us
							</h2>
							<p>
								If you have any questions about this Privacy Policy, please
								contact us at privacy@smove.ai.
							</p>
						</div>
					</section>
				</div>
			</main>
			<Footer />
		</>
	)
}
