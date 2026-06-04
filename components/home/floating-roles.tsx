'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

import { FadeIn } from '@/components/animations/fade-in'

const SUPABASE = 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets'

const POSTS = [
	`${SUPABASE}/fbe0913a-e109-4756-a68e-03c03614b7fe_800w.png`,
	`${SUPABASE}/c6044458-e1ee-471e-a115-2da07fd33fea_800w.png`,
	`${SUPABASE}/fa4f1b2f-1238-464e-9fc5-0c1b66845eec_800w.png`,
	`${SUPABASE}/e3f781c4-11ee-4898-ac4a-1c0779ac25bb_800w.png`,
	`${SUPABASE}/13b2bbab-5312-45b7-8c3e-4f97f5f8cf10_800w.png`,
	`${SUPABASE}/b662aae6-dbff-4914-a9e5-da2f589bf82a_800w.png`,
]

const ROTATIONS = [-12, -7, -2, 3, 8, 13]

const PILLS = [
	{ label: 'designer', dark: false, x: '4%', y: '4%' },
	{ label: 'analyst', dark: true, x: '82%', y: '0%' },
	{ label: 'manager', dark: false, x: '90%', y: '14%' },
]

export function FloatingRoles() {
	return (
		<section className="py-24 md:py-28 px-6 relative overflow-hidden bg-white">
			<div className="max-w-6xl mx-auto relative">
				<FadeIn>
					<h2 className="text-3xl md:text-5xl text-center text-gray-900 mb-16">
						AI that actually
						<br />
						follows through.
					</h2>
				</FadeIn>

				<div className="relative">
					{PILLS.map((p, i) => (
						<motion.span
							key={p.label}
							className={`absolute z-10 hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-md ${
								p.dark
									? 'bg-gray-900 text-white'
									: 'bg-primary text-white'
							}`}
							style={{ left: p.x, top: p.y }}
							initial={{ opacity: 0, scale: 0.8 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
						>
							{p.label}
							<ArrowUpRight className="size-3" />
						</motion.span>
					))}

					<div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap md:flex-nowrap py-12">
						{POSTS.map((src, i) => (
							<motion.div
								key={src}
								className="flex-shrink-0"
								initial={{ opacity: 0, y: 60, rotate: 0 }}
								whileInView={{
									opacity: 1,
									y: [0, -8, 0],
									rotate: ROTATIONS[i],
								}}
								viewport={{ once: true, amount: 0.2 }}
								transition={{
									opacity: { delay: i * 0.12, duration: 0.7 },
									rotate: { delay: i * 0.12, duration: 0.7 },
									y: {
										delay: 1 + i * 0.2,
										duration: 4 + (i % 3),
										repeat: Infinity,
										ease: 'easeInOut',
									},
								}}
								whileHover={{
									rotate: 0,
									scale: 1.08,
									y: -12,
									transition: { duration: 0.3 },
								}}
							>
								<Image
									src={src}
									alt=""
									width={180}
									height={240}
									className="w-32 md:w-44 h-auto rounded-2xl shadow-lg"
								/>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
