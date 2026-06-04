import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

export default function ImprintPage() {
	return (
		<>
			<Navbar />
			<main className="flex-1 pt-32 pb-24 px-6">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl md:text-4xl font-bold mb-8">Imprint</h1>

					<section className="space-y-8 text-sm text-muted-foreground leading-relaxed">
						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								Company Information
							</h2>
							<p>Smove AI GmbH</p>
							<p>Bahnhofstrasse 1</p>
							<p>8001 Zürich</p>
							<p>Switzerland</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								Contact
							</h2>
							<p>Email: hello@smove.ai</p>
							<p>Phone: +41 44 000 00 00</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								Commercial Register
							</h2>
							<p>Registered in the Commercial Register of the Canton of Zürich</p>
							<p>UID: CHE-000.000.000</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								Responsible for Content
							</h2>
							<p>Smove AI GmbH</p>
							<p>Bahnhofstrasse 1</p>
							<p>8001 Zürich, Switzerland</p>
						</div>

						<div>
							<h2 className="text-lg font-semibold text-foreground mb-3">
								Disclaimer
							</h2>
							<p>
								The content of this website has been prepared with the greatest
								possible care. However, we cannot guarantee the accuracy,
								completeness, or timeliness of the content. As a service
								provider, we are responsible for our own content on these pages
								under general law.
							</p>
						</div>
					</section>
				</div>
			</main>
			<Footer />
		</>
	)
}
