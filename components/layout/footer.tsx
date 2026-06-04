import Image from 'next/image'
import Link from 'next/link'

function LinkedinIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
			<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
		</svg>
	)
}

function FacebookIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
			<path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.017 1.792-4.682 4.533-4.682 1.313 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.252h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
		</svg>
	)
}

function InstagramIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
			<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
		</svg>
	)
}

const SMOVE_LOGO =
	'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4ebd8e68-4cde-439b-8859-2820929ed47a_320w.png'

export function Footer() {
	return (
		<footer className="bg-gray-50 pt-16 pb-8 px-6">
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-10">
					<div className="md:col-span-1">
						<Link href="/" className="inline-flex">
							<Image
								src={SMOVE_LOGO}
								alt="Smove AI"
								width={96}
								height={32}
								className="h-8 w-auto"
							/>
						</Link>
						<p className="mt-4 text-sm text-gray-600 leading-relaxed">
							AI-powered social media agents for agencies. Scale your content
							creation without scaling headcount.
						</p>
						<div className="flex items-center gap-2 mt-5">
							<Link
								href="#"
								aria-label="LinkedIn"
								className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
							>
								<LinkedinIcon className="size-4" />
							</Link>
							<Link
								href="#"
								aria-label="Facebook"
								className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
							>
								<FacebookIcon className="size-4" />
							</Link>
							<Link
								href="#"
								aria-label="Instagram"
								className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
							>
								<InstagramIcon className="size-4" />
							</Link>
						</div>
					</div>

					<div>
						<h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-5">
							Product
						</h4>
						<ul className="space-y-3">
							<li>
								<Link
									href="/agents"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									Agents
								</Link>
							</li>
							<li>
								<Link
									href="/#how-it-works"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									How it works
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-5">
							Company
						</h4>
						<ul className="space-y-3">
							<li>
								<Link
									href="/about"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									Success Stories
								</Link>
							</li>
							<li>
								<Link
									href="/material"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									Partner Material
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-5">
							Legal
						</h4>
						<ul className="space-y-3">
							<li>
								<Link
									href="/privacy"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									Terms of Service
								</Link>
							</li>
							<li>
								<Link
									href="/imprint"
									className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									Imprint
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-gray-200 mt-12 pt-6">
					<p className="text-xs text-gray-500">
						© 2025 Smove AI. All rights reserved. Made with{' '}
						<span aria-hidden>❤️</span> in Switzerland.
					</p>
				</div>
			</div>
		</footer>
	)
}
