'use client'

import { motion } from 'framer-motion'
import { Plus, ShieldAlert, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import { ARCHETYPES } from '../data'
import { Field, Select, SelectableCard, TagInput, Textarea } from '../fields'
import type {
	BrandPreviewState,
	BrandWithMedia,
	Guardrails,
	Voice,
} from '../types'
import { useAutosave } from '../use-autosave'

type Props = {
	brand: BrandWithMedia
	onSave: (patch: { voice?: Voice; guardrails?: Guardrails }) => void
	onPreviewChange?: (preview: Partial<BrandPreviewState>) => void
}

const POV_OPTIONS = [
	{ value: 'we', label: 'We (the brand)' },
	{ value: 'you', label: 'You (the reader)' },
	{ value: 'i', label: 'I (founder voice)' },
	{ value: 'mixed', label: 'Mixed' },
]

const FORMALITY_OPTIONS = [
	{ value: 'casual', label: 'Casual' },
	{ value: 'balanced', label: 'Balanced' },
	{ value: 'formal', label: 'Formal' },
]

const EMOJI_OPTIONS = [
	{ value: 'none', label: 'None' },
	{ value: 'minimal', label: 'Minimal' },
	{ value: 'frequent', label: 'Frequent' },
]

const MAX_SAMPLES = 3

const seedSamples = (voice: BrandWithMedia['voice']): string[] => {
	if (voice?.samplePosts?.length) return voice.samplePosts
	if (voice?.tonalityExample) return [voice.tonalityExample]
	return ['']
}

export function StepVoice({ brand, onSave, onPreviewChange }: Props) {
	const v = brand.voice
	const g = brand.guardrails

	const [archetype, setArchetype] = useState(v?.archetype ?? '')
	const [attributes, setAttributes] = useState<string[]>(v?.attributes ?? [])
	const [pointOfView, setPointOfView] = useState(v?.pointOfView ?? '')
	const [formality, setFormality] = useState(v?.formality ?? '')
	const [emojiUsage, setEmojiUsage] = useState(v?.emojiUsage ?? '')
	const [wordsToUse, setWordsToUse] = useState<string[]>(v?.wordsToUse ?? [])
	const [wordsToAvoid, setWordsToAvoid] = useState<string[]>(
		v?.wordsToAvoid ?? [],
	)
	const [samplePosts, setSamplePosts] = useState<string[]>(seedSamples(v))

	const [topicsToAvoid, setTopicsToAvoid] = useState<string[]>(
		g?.topicsToAvoid ?? [],
	)
	const [bannedClaims, setBannedClaims] = useState<string[]>(
		g?.bannedClaims ?? [],
	)
	const [mandatoryDisclaimers, setMandatoryDisclaimers] = useState(
		g?.mandatoryDisclaimers ?? '',
	)

	const data = useMemo(() => {
		const samples = samplePosts.map((s) => s.trim()).filter(Boolean)
		return {
			voice: {
				archetype: archetype || undefined,
				attributes,
				pointOfView: pointOfView || undefined,
				formality: formality || undefined,
				emojiUsage: emojiUsage || undefined,
				wordsToUse,
				wordsToAvoid,
				samplePosts: samples,
				tonalityExample: samples[0] ?? undefined,
			},
			guardrails: {
				topicsToAvoid,
				bannedClaims,
				mandatoryDisclaimers: mandatoryDisclaimers.trim() || undefined,
			},
		}
	}, [
		archetype,
		attributes,
		pointOfView,
		formality,
		emojiUsage,
		wordsToUse,
		wordsToAvoid,
		samplePosts,
		topicsToAvoid,
		bannedClaims,
		mandatoryDisclaimers,
	])

	useAutosave({ data, save: onSave, delay: 400 })

	useEffect(() => {
		onPreviewChange?.({
			archetype: archetype || undefined,
			tonalityExample: samplePosts.map((s) => s.trim()).find(Boolean),
		})
	}, [archetype, samplePosts, onPreviewChange])

	useEffect(() => () => onPreviewChange?.({}), [onPreviewChange])

	const updateSample = (idx: number, value: string) =>
		setSamplePosts((prev) => prev.map((s, i) => (i === idx ? value : s)))
	const addSample = () =>
		setSamplePosts((prev) =>
			prev.length < MAX_SAMPLES ? [...prev, ''] : prev,
		)
	const removeSample = (idx: number) =>
		setSamplePosts((prev) =>
			prev.length === 1 ? [''] : prev.filter((_, i) => i !== idx),
		)

	return (
		<div className="space-y-6">
			<p className="text-sm text-gray-500">
				Define how your brand sounds. The richer this is, the more on-brand
				and safe your AI-generated posts will be.
			</p>

			<Card
				title="Brand archetype"
				subtitle="Select the persona that fits your brand."
			>
				<div className="grid grid-cols-2 gap-3 @md/col:grid-cols-3 @2xl/col:grid-cols-4">
					{ARCHETYPES.map((a) => (
						<SelectableCard
							key={a.id}
							selected={archetype === a.id}
							onClick={() => setArchetype(archetype === a.id ? '' : a.id)}
							className="flex flex-col items-center p-4 text-center"
						>
							<motion.div
								className="relative mb-2 size-14"
								animate={
									archetype === a.id ? { scale: [1, 1.12, 1] } : { scale: 1 }
								}
								transition={{ duration: 0.3 }}
							>
								<Image
									src={a.image}
									alt={a.name}
									fill
									className="object-contain"
									sizes="56px"
								/>
							</motion.div>
							<p
								className="text-sm font-semibold text-gray-900"
								style={{ letterSpacing: '-0.01em' }}
							>
								{a.name}
							</p>
							<p className="mt-0.5 text-[11px] leading-snug text-gray-500">
								{a.tagline}
							</p>
						</SelectableCard>
					))}
				</div>
			</Card>

			<Card
				title="Voice attributes"
				subtitle="Three to five adjectives that describe how you speak."
			>
				<TagInput
					value={attributes}
					onChange={setAttributes}
					placeholder="e.g. Confident"
					maxItems={6}
				/>
			</Card>

			<Card
				title="Writing mechanics"
				subtitle="The stylistic rules your agent should follow."
			>
				<div className="grid grid-cols-1 gap-4 @lg/col:grid-cols-3">
					<Field label="Point of view">
						<Select
							value={pointOfView}
							onChange={setPointOfView}
							options={POV_OPTIONS}
							placeholder="Select"
						/>
					</Field>
					<Field label="Formality">
						<Select
							value={formality}
							onChange={setFormality}
							options={FORMALITY_OPTIONS}
							placeholder="Select"
						/>
					</Field>
					<Field label="Emoji usage">
						<Select
							value={emojiUsage}
							onChange={setEmojiUsage}
							options={EMOJI_OPTIONS}
							placeholder="Select"
						/>
					</Field>
				</div>
			</Card>

			<Card
				title="Words & phrases"
				subtitle="Steer vocabulary and keep the agent on-message."
			>
				<div className="grid grid-cols-1 gap-4 @xl/col:grid-cols-2">
					<Field label="Words to use">
						<TagInput
							value={wordsToUse}
							onChange={setWordsToUse}
							placeholder="e.g. craftsmanship"
						/>
					</Field>
					<Field label="Words to avoid">
						<TagInput
							value={wordsToAvoid}
							onChange={setWordsToAvoid}
							placeholder="e.g. cheap"
						/>
					</Field>
				</div>
			</Card>

			<Card
				title="Sample posts"
				subtitle="Real examples are the strongest signal for matching your tone."
			>
				<div className="space-y-3">
					{samplePosts.map((sample, idx) => (
						<div key={idx} className="relative">
							<Textarea
								value={sample}
								onChange={(val) => updateSample(idx, val)}
								placeholder="Paste a post that sounds exactly like your brand…"
								rows={3}
							/>
							{(samplePosts.length > 1 || sample.trim()) && (
								<button
									type="button"
									onClick={() => removeSample(idx)}
									className="absolute right-2 top-2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
									aria-label="Remove sample"
								>
									<X className="size-4" />
								</button>
							)}
						</div>
					))}
					{samplePosts.length < MAX_SAMPLES && (
						<button
							type="button"
							onClick={addSample}
							className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
						>
							<Plus className="size-3.5" />
							Add another sample
						</button>
					)}
				</div>
			</Card>

			<div className="overflow-hidden rounded-3xl border border-amber-200/70 bg-amber-50/40 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
				<div className="mb-5 flex items-start gap-2.5">
					<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
						<ShieldAlert className="size-4" />
					</span>
					<div>
						<h2 className="text-base font-semibold text-gray-900">
							Guardrails
						</h2>
						<p className="mt-0.5 text-xs text-gray-500">
							Hard limits the agent must never cross when posting on this
							brand’s behalf.
						</p>
					</div>
				</div>
				<div className="space-y-4">
					<Field label="Topics to avoid">
						<TagInput
							value={topicsToAvoid}
							onChange={setTopicsToAvoid}
							placeholder="e.g. politics"
						/>
					</Field>
					<Field label="Banned claims">
						<TagInput
							value={bannedClaims}
							onChange={setBannedClaims}
							placeholder="e.g. “guaranteed results”"
						/>
					</Field>
					<Field
						label="Mandatory disclaimers"
						hint="Legal lines that must appear on relevant posts."
					>
						<Textarea
							value={mandatoryDisclaimers}
							onChange={setMandatoryDisclaimers}
							placeholder="e.g. Capital at risk. Past performance is not indicative of future results."
							rows={2}
						/>
					</Field>
				</div>
			</div>
		</div>
	)
}

function Card({
	title,
	subtitle,
	children,
}: {
	title: string
	subtitle?: string
	children: React.ReactNode
}) {
	return (
		<div
			className={cn(
				'rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7',
			)}
		>
			<div className="mb-5">
				<h2 className="text-base font-semibold text-gray-900">{title}</h2>
				{subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
			</div>
			{children}
		</div>
	)
}
