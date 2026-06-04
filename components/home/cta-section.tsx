'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import { FadeIn } from '@/components/animations/fade-in'
import { Button } from '@/components/ui/button'

const PHONE_IMAGE =
	'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/afa7b720-7f42-46a3-8410-8a3d48a4d3ac_1600w.png'

export function CtaSection({ onGetStarted }: { onGetStarted: () => void }) {
	return (
		<section className="py-24 px-6 bg-white">
			<FadeIn>
				<div className="max-w-5xl mx-auto">
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
					>
						<div className="flex justify-center md:justify-end">
							<Image
								src={PHONE_IMAGE}
								alt="Smove Agents Climbing From Phone"
								width={600}
								height={600}
								className="w-full max-w-sm h-auto"
							/>
						</div>

						<div className="text-left">
							<h2 className="text-3xl md:text-5xl text-gray-900 mb-4">
								Ready to make a
								<br />
								Smove?
							</h2>
							<p className="text-gray-600 mb-6 leading-relaxed">
								Automate your content creation and save time, nerves and money.
							</p>

							<form
								onSubmit={(e) => {
									e.preventDefault()
									onGetStarted()
								}}
								className="space-y-3 max-w-md"
							>
								<div className="rounded-full bg-gray-100 px-4 py-3">
									<input
										type="email"
										placeholder="Enter your email"
										aria-label="Email"
										className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
									/>
								</div>
								<Button
									type="submit"
									className="w-full rounded-full h-12 bg-primary text-white hover:bg-primary/90 font-semibold"
								>
									Get started
								</Button>
								<p className="text-xs text-gray-500">
									Learn how we collect your information by visiting our{' '}
									<Link href="/privacy" className="underline">
										Privacy Policy
									</Link>
									.
								</p>
							</form>
						</div>
					</motion.div>
				</div>
			</FadeIn>
		</section>
	)
}
