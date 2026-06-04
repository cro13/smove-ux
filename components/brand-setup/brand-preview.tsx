'use client'

import { motion } from 'framer-motion'
import { Heart, MessageCircle, MoreHorizontal, Share2, Sparkles } from 'lucide-react'
import Image from 'next/image'

import { ARCHETYPES } from './data'
import { gradientCss } from './gradient'
import type { BrandPreviewState } from './types'

type Props = {
	brand: BrandPreviewState
}

export function BrandPreview({ brand }: Props) {
	const primary = brand.primaryColor ?? '#2563EB'
	const secondary = brand.secondaryColor ?? '#0F172A'
	const archetype = ARCHETYPES.find((a) => a.id === brand.archetype)

	const mediaBackground = brand.gradient
		? gradientCss(brand.gradient)
		: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`

	return (
		<div className="space-y-3">
			<div>
				<div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
					<Sparkles className="size-3" />
					Live preview
				</div>
				<p className="mt-1 text-xs text-gray-500">
					Your brand takes shape as you go.
				</p>
			</div>

			<div className="relative">
				<div
					className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-25 blur-3xl"
					style={{ background: mediaBackground }}
					aria-hidden="true"
				/>

				<motion.div
					layout
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ type: 'spring', stiffness: 260, damping: 24 }}
					className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.4)] ring-1 ring-black/5"
				>
					<div className="flex items-center gap-3 p-4">
						<div
							className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
							style={{ background: brand.iconUrl ? '#F3F4F6' : primary }}
						>
							{brand.iconUrl ? (
								<div className="relative size-full">
									<Image
										src={brand.iconUrl}
										alt="Brand icon"
										fill
										className="object-contain p-1"
										unoptimized
									/>
								</div>
							) : (
								(brand.name?.charAt(0) ?? 'B').toUpperCase()
							)}
						</div>
						<div className="min-w-0 flex-1">
							<p
								className="truncate text-sm font-semibold text-gray-900"
								style={{ letterSpacing: '-0.02em' }}
							>
								{brand.name || 'Your brand'}
							</p>
							<p className="text-[11px] text-gray-500">
								{archetype ? archetype.name : 'Sponsored'}
							</p>
						</div>
						<MoreHorizontal className="size-4 shrink-0 text-gray-300" />
					</div>

					<motion.p
						key={brand.tonalityExample || brand.coreMessage || 'placeholder'}
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						className="px-4 pb-3 text-sm leading-relaxed text-gray-700"
					>
						{brand.tonalityExample ||
							brand.coreMessage ||
							'Your brand voice will appear here as you customise it.'}
					</motion.p>

					<div
						className="relative aspect-[4/3] w-full overflow-hidden"
						style={{ background: mediaBackground }}
					>
						<motion.div
							className="absolute inset-0 opacity-30"
							animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
							transition={{
								duration: 8,
								repeat: Infinity,
								repeatType: 'reverse',
							}}
							style={{
								backgroundImage:
									'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.18), transparent 45%)',
								backgroundSize: '200% 200%',
							}}
						/>
						{brand.logoUrl && (
							<div className="absolute bottom-4 left-4 h-7 w-32">
								<Image
									src={brand.logoUrl}
									alt="Logo"
									fill
									className="object-contain object-left drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
									unoptimized
								/>
							</div>
						)}
					</div>

					<div className="flex items-center justify-between px-4 py-3 text-[11px] text-gray-500">
						<span className="flex items-center gap-1.5">
							<Heart className="size-3.5" style={{ color: primary }} /> 234
						</span>
						<span className="flex items-center gap-1.5">
							<MessageCircle className="size-3.5" /> 18
						</span>
						<span className="flex items-center gap-1.5">
							<Share2 className="size-3.5" /> 5
						</span>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
