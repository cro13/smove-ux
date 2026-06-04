import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

export default function TermsPage() {
	return (
		<>
			<Navbar />
			<main className="flex-1 pt-32 pb-24 px-6">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl md:text-4xl font-bold mb-8">
						Terms of Service
					</h1>
					<p className="text-sm text-muted-foreground mb-8">
						Last updated: January 2025
					</p>

					<section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								1. Acceptance of Terms
							</h2>
							<p>
								By accessing or using Smove AI&apos;s services, you agree to be
								bound by these Terms of Service. If you do not agree to these
								terms, please do not use our services.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								2. Description of Service
							</h2>
							<p>
								Smove AI provides AI-powered social media content creation
								agents for agencies. Our service includes automated content
								generation, scheduling, and approval workflows for Instagram,
								LinkedIn, and Facebook.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								3. User Accounts
							</h2>
							<p>
								You are responsible for maintaining the confidentiality of your
								account credentials. You agree to notify us immediately of any
								unauthorized use of your account.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								4. Payment Terms
							</h2>
							<p>
								Paid plans are billed monthly or annually as selected.
								Payments are non-refundable except as required by applicable
								law. We reserve the right to change our pricing with 30 days
								notice.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								5. Content Ownership
							</h2>
							<p>
								You retain all rights to content generated through our
								platform. Smove AI does not claim ownership of any content
								created for your clients through our services.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								6. Limitation of Liability
							</h2>
							<p>
								Smove AI shall not be liable for any indirect, incidental,
								special, consequential, or punitive damages resulting from
								your use of the service.
							</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								7. Governing Law
							</h2>
							<p>
								These terms shall be governed by and construed in accordance
								with the laws of Switzerland, without regard to its conflict of
								law provisions.
							</p>
						</div>
					</section>
				</div>
			</main>
			<Footer />
		</>
	)
}
