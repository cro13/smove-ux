'use client'

import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { CheckCircle2, Pencil, Sparkles, Wand2 } from 'lucide-react'
import Image from 'next/image'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

import { ARCHETYPES, LANGUAGES } from '../data'
import { gradientCss, type Gradient } from '../gradient'
import { CHANNEL_LABEL, type BrandWithMedia, type Channel } from '../types'

type Props = {
	brand: BrandWithMedia
	brandId: Id<'brands'>
	onJump: (step: number) => void
}

export function StepReview({ brand, brandId, onJump }: Props) {
	const personas = useQuery(api.brandPersonas.listByBrand, { brandId })
	const buckets = useQuery(api.brandContentBuckets.listByBrand, { brandId })

	const archetype = ARCHETYPES.find((a) => a.id === brand.voice?.archetype)
	const language = LANGUAGES.find((l) => l.value === brand.generalInfo?.language)
	const firstSample =
		brand.voice?.samplePosts?.[0] ?? brand.voice?.tonalityExample
	const hasGuardrails = Boolean(
		brand.guardrails?.topicsToAvoid?.length ||
			brand.guardrails?.bannedClaims?.length ||
			brand.guardrails?.mandatoryDisclaimers,
	)
	const referencePosts = brand.referencePosts ?? []

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				className="rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7"
			>
				<div className="flex items-start gap-4">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
						<Sparkles className="size-5 text-primary" />
					</div>
					<div>
						<h2
							className="text-lg font-semibold text-gray-900"
							style={{ letterSpacing: '-0.02em' }}
						>
							Almost there
						</h2>
						<p className="mt-0.5 text-sm text-gray-500">
							Review everything below and finish setup. You can edit any
							section later from the brand dashboard.
						</p>
					</div>
				</div>
			</motion.div>

			{brand.importSource && (
				<motion.div
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-start gap-2.5 rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4"
				>
					<Wand2 className="mt-0.5 size-4 shrink-0 text-amber-600" />
					<p className="text-sm text-amber-800">
						{brand.importSource === 'website'
							? 'Prefilled from your website.'
							: 'Prefilled from your brand book.'}{' '}
						Please review every section below and refine before finishing —
						imports are a best-effort starting point.
					</p>
				</motion.div>
			)}

			<Section title="General information" onEdit={() => onJump(1)}>
				<Grid>
					<Item label="Brand name" value={brand.name} />
					<Item label="Website" value={brand.website} />
					<Item label="Language" value={language?.label} />
					<Item label="Location" value={brand.generalInfo?.location} />
					<Item label="Contact name" value={brand.generalInfo?.contactName} />
					<Item label="Contact email" value={brand.generalInfo?.contactEmail} />
				</Grid>
			</Section>

			<Section title="Company profile" onEdit={() => onJump(2)}>
				<Grid>
					<Item
						label="Field of business"
						value={brand.companyProfile?.fieldOfBusiness}
					/>
					<Item label="Tagline" value={brand.companyProfile?.tagline} />
					<Item label="Mission" value={brand.companyProfile?.mission} />
					<Item
						label="Brand values"
						value={brand.companyProfile?.values?.join(' · ')}
					/>
					<Item
						label="Core message"
						value={brand.companyProfile?.coreMessage}
					/>
					<Item
						label="Products / services"
						value={brand.companyProfile?.products?.join(' · ')}
					/>
					<Item
						label="Reasons to believe"
						value={brand.companyProfile?.reasonsToBelieve?.join(' · ')}
					/>
				</Grid>
			</Section>

			<Section title="Visual identity" onEdit={() => onJump(3)}>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
							Logos
						</p>
						<LogoGrid brand={brand} />
					</div>
					<div className="space-y-3">
						<div>
							<p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
								Colors
							</p>
							<div className="space-y-2">
								<ColorRow
									label="Primary"
									colors={brand.visualIdentity?.primaryColors ?? []}
								/>
								<ColorRow
									label="Secondary"
									colors={brand.visualIdentity?.secondaryColors ?? []}
								/>
								<GradientRow
									gradients={brand.visualIdentity?.gradients ?? []}
								/>
							</div>
						</div>
						<div>
							<p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
								Typography
							</p>
							<FontRow
								label="Headline"
								name={brand.visualIdentity?.headlineFontName}
							/>
							<FontRow
								label="Subline"
								name={brand.visualIdentity?.sublineFontName}
							/>
						</div>
					</div>
				</div>
				<div className="mt-5">
					<p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
						Imagery
					</p>
					<ImageryRow urls={brand.media.imageryUrls} />
				</div>
			</Section>

			<Section title="Voice & tone" onEdit={() => onJump(4)}>
				{archetype || (brand.voice?.attributes?.length ?? 0) > 0 ? (
					<div className="space-y-4">
						{archetype && (
							<div className="flex items-start gap-3">
								<div className="relative size-12 shrink-0">
									<Image
										src={archetype.image}
										alt={archetype.name}
										fill
										className="object-contain"
										sizes="48px"
										unoptimized
									/>
								</div>
								<div>
									<p className="text-sm font-semibold text-gray-900">
										{archetype.name}
									</p>
									<p className="text-xs text-gray-500">
										{archetype.tagline}
									</p>
								</div>
							</div>
						)}

						{(brand.voice?.attributes?.length ?? 0) > 0 && (
							<PillRow
								label="Attributes"
								items={brand.voice?.attributes ?? []}
							/>
						)}
						<PillRow
							label="Use"
							items={brand.voice?.wordsToUse ?? []}
						/>
						<PillRow
							label="Avoid"
							items={brand.voice?.wordsToAvoid ?? []}
							tone="danger"
						/>

						{firstSample && (
							<p className="text-sm italic text-gray-700">“{firstSample}”</p>
						)}
					</div>
				) : (
					<Empty>No voice defined yet.</Empty>
				)}
			</Section>

			{hasGuardrails && (
				<Section title="Guardrails" onEdit={() => onJump(4)}>
					<div className="space-y-3">
						<PillRow
							label="Avoid topics"
							items={brand.guardrails?.topicsToAvoid ?? []}
							tone="danger"
						/>
						<PillRow
							label="Banned claims"
							items={brand.guardrails?.bannedClaims ?? []}
							tone="danger"
						/>
						{brand.guardrails?.mandatoryDisclaimers && (
							<Item
								label="Mandatory disclaimers"
								value={brand.guardrails.mandatoryDisclaimers}
							/>
						)}
					</div>
				</Section>
			)}

			{referencePosts.length > 0 && (
				<Section title="Reference posts" onEdit={() => onJump(4)}>
					<div className="space-y-2">
						{referencePosts.map((post, i) => (
							<div
								key={i}
								className="flex items-center gap-3 text-sm text-gray-700"
							>
								{brand.media.referencePostImageUrls?.[i] ? (
									<div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-gray-200">
										<Image
											src={brand.media.referencePostImageUrls[i] as string}
											alt={`Reference ${i + 1}`}
											fill
											className="object-cover"
											unoptimized
										/>
									</div>
								) : null}
								<div className="min-w-0">
									{post.url ? (
										<a
											href={post.url}
											target="_blank"
											rel="noopener noreferrer"
											className="block truncate text-primary hover:underline"
										>
											{post.url}
										</a>
									) : (
										<span className="text-gray-500">Screenshot only</span>
									)}
									{post.caption && (
										<p className="truncate text-xs text-gray-500">
											{post.caption}
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</Section>
			)}

			<Section title="Channels" onEdit={() => onJump(5)}>
				{brand.channels && brand.channels.length > 0 ? (
					<div className="flex flex-wrap gap-1.5">
						{brand.channels.map((c) => (
							<span
								key={c}
								className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
							>
								{CHANNEL_LABEL[c]}
							</span>
						))}
					</div>
				) : (
					<Empty>No channels selected.</Empty>
				)}
			</Section>

			{brand.channels?.map((channel) => {
				const cPersonas =
					personas?.filter((p) => p.channel === channel) ?? []
				const cBuckets = buckets?.filter((b) => b.channel === channel) ?? []
				return (
					<Section
						key={channel}
						title={`${CHANNEL_LABEL[channel as Channel]} setup`}
						onEdit={() => onJump(6)}
					>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2 text-gray-700">
								<CheckCircle2 className="size-4 text-emerald-500" />
								{cPersonas.length} persona{cPersonas.length === 1 ? '' : 's'}
							</div>
							<div className="flex items-center gap-2 text-gray-700">
								<CheckCircle2 className="size-4 text-emerald-500" />
								{cBuckets.length} content bucket
								{cBuckets.length === 1 ? '' : 's'}
							</div>
						</div>
					</Section>
				)
			})}
		</div>
	)
}

function Section({
	title,
	children,
	onEdit,
}: {
	title: string
	children: React.ReactNode
	onEdit: () => void
}) {
	return (
		<div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-sm font-semibold text-gray-900">{title}</h3>
				<button
					type="button"
					onClick={onEdit}
					className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
				>
					<Pencil className="size-3" />
					Edit
				</button>
			</div>
			{children}
		</div>
	)
}

function Grid({ children }: { children: React.ReactNode }) {
	return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

function Item({ label, value }: { label: string; value?: string | null }) {
	return (
		<div>
			<p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
				{label}
			</p>
			<p
				className={cn(
					'mt-0.5 text-sm',
					value ? 'text-gray-900' : 'italic text-gray-400',
				)}
			>
				{value || 'Not set'}
			</p>
		</div>
	)
}

function Empty({ children }: { children: React.ReactNode }) {
	return <p className="text-sm italic text-gray-400">{children}</p>
}

function PillRow({
	label,
	items,
	tone = 'default',
}: {
	label: string
	items: string[]
	tone?: 'default' | 'danger'
}) {
	if (items.length === 0) return null
	return (
		<div className="flex items-start gap-2">
			<span className="mt-1 w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
				{label}
			</span>
			<div className="flex flex-wrap gap-1.5">
				{items.map((item, i) => (
					<span
						key={`${item}-${i}`}
						className={cn(
							'rounded-full px-2 py-0.5 text-[11px] font-medium',
							tone === 'danger'
								? 'bg-red-50 text-red-600'
								: 'bg-primary/10 text-primary',
						)}
					>
						{item}
					</span>
				))}
			</div>
		</div>
	)
}

function ColorRow({ label, colors }: { label: string; colors: string[] }) {
	if (colors.length === 0) {
		return <Empty>{label}: none added</Empty>
	}
	return (
		<div className="flex items-center gap-2 text-xs text-gray-600">
			<span className="w-16 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
				{label}
			</span>
			<div className="flex gap-1.5">
				{colors.map((c, i) => (
					<div
						key={`${c}-${i}`}
						className="size-6 rounded-md border border-gray-200 shadow-inner"
						style={{ background: c }}
						title={c}
					/>
				))}
			</div>
		</div>
	)
}

function GradientRow({ gradients }: { gradients: Gradient[] }) {
	if (gradients.length === 0) return null
	return (
		<div className="flex items-center gap-2 text-xs text-gray-600">
			<span className="w-16 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
				Gradients
			</span>
			<div className="flex flex-wrap gap-1.5">
				{gradients.map((g, i) => (
					<div
						key={i}
						className="h-6 w-12 rounded-md border border-gray-200 shadow-inner"
						style={{ background: gradientCss(g) }}
						title={`${g.type ?? 'linear'} · ${g.from} → ${g.to}`}
					/>
				))}
			</div>
		</div>
	)
}

function FontRow({ label, name }: { label: string; name?: string }) {
	return (
		<p className="text-xs text-gray-600">
			<span className="font-medium text-gray-500">{label}:</span>{' '}
			<span className={name ? 'text-gray-900' : 'italic text-gray-400'}>
				{name || 'Not uploaded'}
			</span>
		</p>
	)
}

function ImageryRow({ urls }: { urls: (string | null)[] }) {
	const filled = urls.filter((u): u is string => Boolean(u))
	if (filled.length === 0) {
		return <Empty>No reference images added.</Empty>
	}
	return (
		<div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
			{filled.map((url, i) => (
				<div
					key={i}
					className="relative aspect-square overflow-hidden rounded-lg border border-gray-200"
				>
					<Image
						src={url}
						alt={`Imagery ${i + 1}`}
						fill
						className="object-cover"
						unoptimized
					/>
				</div>
			))}
		</div>
	)
}

function LogoGrid({ brand }: { brand: BrandWithMedia }) {
	const logos: [string, string | null | undefined][] = [
		['Logo', brand.media.logoUrl],
		['Icon', brand.media.iconUrl],
	]
	return (
		<div className="grid grid-cols-2 gap-2">
			{logos.map(([label, url]) => (
				<div
					key={label}
					className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
				>
					{url ? (
						<div className="relative h-full w-full">
							<Image
								src={url}
								alt={label}
								fill
								className="object-contain p-3"
								unoptimized
							/>
						</div>
					) : (
						<span className="text-[10px] font-medium text-gray-400">
							{label} missing
						</span>
					)}
				</div>
			))}
		</div>
	)
}
