'use client'

import { useMutation, useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Calendar,
	ChevronDown,
	Layers,
	Plus,
	Trash2,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

import { DAYS_OF_WEEK, EMOJI_USAGE, MEDIA_TYPES, TIME_OPTIONS } from '../data'
import { Field, Select, TextInput, Textarea } from '../fields'
import { CHANNEL_LABEL, type Channel } from '../types'
import { useAutosave, type SaveStatus } from '../use-autosave'

type Props = {
	brandId: Id<'brands'>
	channels: Channel[]
	onStatus: (s: SaveStatus) => void
}

const MEDIA_OPTIONS = MEDIA_TYPES.map((m) => ({ value: m, label: m }))
const TIME_SELECT = TIME_OPTIONS.map((t) => ({ value: t, label: t }))
const GOAL_PRESETS = [
	'Awareness',
	'Engagement',
	'Education',
	'Conversion',
	'Community',
	'Entertainment',
] as const

export function StepContentBuckets({ brandId, channels, onStatus }: Props) {
	const [activeChannel, setActiveChannel] = useState<Channel | null>(
		channels[0] ?? null,
	)
	const [openBucketId, setOpenBucketId] = useState<Id<'brandContentBuckets'> | null>(
		null,
	)
	const buckets = useQuery(api.brandContentBuckets.listByBrand, { brandId })
	const createBucket = useMutation(api.brandContentBuckets.create)
	const removeBucket = useMutation(api.brandContentBuckets.remove)

	if (channels.length === 0 || !activeChannel) {
		return (
			<div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center">
				<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
					<Layers className="size-5" />
				</div>
				<p className="text-sm text-gray-500">
					Pick at least one channel in step 5 before adding buckets.
				</p>
			</div>
		)
	}

	const channelBuckets =
		buckets?.filter((b) => b.channel === activeChannel) ?? []

	const handleAdd = async () => {
		const id = await createBucket({ brandId, channel: activeChannel })
		setOpenBucketId(id)
	}

	return (
		<div className="space-y-6">
			<p className="text-sm text-gray-500">
				Content buckets are the recurring themes we post for this brand.
				Add a few per channel — you can refine them anytime.
			</p>

			<ChannelPills
				channels={channels}
				active={activeChannel}
				onChange={setActiveChannel}
			/>

			<div className="space-y-3">
				<AnimatePresence initial={false}>
					{channelBuckets.map((bucket, idx) => (
						<motion.div
							key={bucket._id}
							layout
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.96 }}
						>
							<BucketAccordion
								index={idx + 1}
								bucket={bucket}
								open={openBucketId === bucket._id}
								onToggle={() =>
									setOpenBucketId(
										openBucketId === bucket._id ? null : bucket._id,
									)
								}
								onRemove={() => removeBucket({ bucketId: bucket._id })}
								onStatus={onStatus}
							/>
						</motion.div>
					))}
				</AnimatePresence>

				<button
					type="button"
					onClick={handleAdd}
					className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white py-4 text-sm font-medium text-gray-500 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
				>
					<Plus className="size-4" />
					Add content bucket
				</button>
			</div>
		</div>
	)
}

function ChannelPills({
	channels,
	active,
	onChange,
}: {
	channels: Channel[]
	active: Channel
	onChange: (c: Channel) => void
}) {
	return (
		<div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1">
			{channels.map((c) => {
				const isActive = c === active
				return (
					<button
						key={c}
						type="button"
						onClick={() => onChange(c)}
						className={cn(
							'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
							isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900',
						)}
					>
						{isActive && (
							<motion.span
								layoutId="content-channel-pill"
								className="absolute inset-0 -z-10 rounded-full bg-primary"
								transition={{ type: 'spring', stiffness: 400, damping: 30 }}
							/>
						)}
						{CHANNEL_LABEL[c]}
					</button>
				)
			})}
		</div>
	)
}

function BucketAccordion({
	index,
	bucket,
	open,
	onToggle,
	onRemove,
	onStatus,
}: {
	index: number
	bucket: Doc<'brandContentBuckets'>
	open: boolean
	onToggle: () => void
	onRemove: () => void
	onStatus: (s: SaveStatus) => void
}) {
	const updateBucket = useMutation(api.brandContentBuckets.update)
	const [title, setTitle] = useState(bucket.title ?? '')
	const [description, setDescription] = useState(bucket.description ?? '')
	const [goal, setGoal] = useState(bucket.goal ?? '')
	const [mediaType, setMediaType] = useState(bucket.mediaType ?? '')
	const [dos, setDos] = useState(bucket.dos ?? '')
	const [donts, setDonts] = useState(bucket.donts ?? '')
	const [useEmojis, setUseEmojis] = useState(bucket.useEmojis ?? 'few')
	const [exampleCaption, setExampleCaption] = useState(
		bucket.exampleCaption ?? '',
	)
	const [scheduleDays, setScheduleDays] = useState<string[]>(
		bucket.scheduleDays ?? [],
	)
	const [scheduleTime, setScheduleTime] = useState(bucket.scheduleTime ?? '')

	const data = useMemo(
		() => ({
			title: title.trim(),
			description: description.trim() || undefined,
			goal: goal.trim() || undefined,
			mediaType: mediaType || undefined,
			dos: dos.trim() || undefined,
			donts: donts.trim() || undefined,
			useEmojis,
			exampleCaption: exampleCaption.trim() || undefined,
			scheduleDays,
			scheduleTime: scheduleTime || undefined,
		}),
		[
			title,
			description,
			goal,
			mediaType,
			dos,
			donts,
			useEmojis,
			exampleCaption,
			scheduleDays,
			scheduleTime,
		],
	)

	const save = useCallback(
		async (next: typeof data) => {
			await updateBucket({ bucketId: bucket._id, ...next })
		},
		[updateBucket, bucket._id],
	)

	useAutosave({ data, save, onStatus, delay: 600 })

	const toggleDay = (day: string) => {
		setScheduleDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		)
	}

	const isActive = title.trim().length > 0 && description.trim().length > 0
	const meta = [
		goal.trim(),
		mediaType,
		scheduleDays.length > 0 ? `${scheduleDays.length}×/week` : '',
	]
		.filter(Boolean)
		.join('  ·  ')

	return (
		<div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center gap-3 px-5 py-4 text-left"
			>
				<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
					{index}
				</span>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-gray-900">
						{title.trim() || 'Untitled bucket'}
					</p>
					{!open && meta && (
						<p className="mt-0.5 truncate text-xs text-gray-400">{meta}</p>
					)}
				</div>
				<span
					className={cn(
						'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
						isActive
							? 'bg-emerald-100 text-emerald-700'
							: 'bg-gray-100 text-gray-500',
					)}
				>
					{isActive ? 'Ready' : 'Draft'}
				</span>
				<span
					role="button"
					tabIndex={0}
					onClick={(e) => {
						e.stopPropagation()
						onRemove()
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.stopPropagation()
							onRemove()
						}
					}}
					className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
					aria-label="Remove bucket"
				>
					<Trash2 className="size-3.5" />
				</span>
				<ChevronDown
					className={cn(
						'size-4 shrink-0 text-gray-400 transition-transform',
						open && 'rotate-180',
					)}
				/>
			</button>

			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="space-y-6 border-t border-gray-100 px-5 py-6 sm:px-6">
							<div>
								<Field label="Bucket title" required>
									<TextInput
										value={title}
										onChange={setTitle}
										placeholder="e.g. Real-world finance pain points"
									/>
								</Field>
								<Field label="What is this bucket about?">
									<Textarea
										value={description}
										onChange={setDescription}
										placeholder="One or two lines on the theme and the angle we take."
										rows={2}
									/>
								</Field>
							</div>

							<Section label="Format and tone">
								<Field label="Goal">
									<GoalChips value={goal} onChange={setGoal} />
								</Field>
								<div className="grid grid-cols-1 gap-4 @md/col:grid-cols-2">
									<Field label="Media format">
										<Select
											value={mediaType}
											onChange={setMediaType}
											options={MEDIA_OPTIONS}
											placeholder="Pick a format"
										/>
									</Field>
									<Field label="Emoji usage">
										<Segmented
											options={EMOJI_USAGE}
											value={useEmojis}
											onChange={setUseEmojis}
										/>
									</Field>
								</div>
							</Section>

							<Section label="Guidance" optional>
								<div className="grid grid-cols-1 gap-4 @md/col:grid-cols-2">
									<Field label="Do’s">
										<Textarea
											value={dos}
											onChange={setDos}
											placeholder="Lead with a hook, keep it short…"
											rows={2}
										/>
									</Field>
									<Field label="Don’ts">
										<Textarea
											value={donts}
											onChange={setDonts}
											placeholder="Avoid jargon, no hard selling…"
											rows={2}
										/>
									</Field>
								</div>
							</Section>

							<Section label="Example caption" optional>
								<Textarea
									value={exampleCaption}
									onChange={setExampleCaption}
									placeholder="Paste or draft a caption that nails the tone…"
									rows={3}
								/>
							</Section>

							<Section
								label="Posting schedule"
								optional
								icon={<Calendar className="size-3.5" />}
							>
								<div className="grid grid-cols-7 gap-1.5">
									{DAYS_OF_WEEK.map((d) => {
										const isOn = scheduleDays.includes(d.value)
										return (
											<button
												key={d.value}
												type="button"
												onClick={() => toggleDay(d.value)}
												className={cn(
													'rounded-lg py-2 text-xs font-medium transition-colors',
													isOn
														? 'bg-primary text-white shadow-sm shadow-primary/20'
														: 'bg-gray-50 text-gray-500 hover:bg-gray-100',
												)}
											>
												{d.label}
											</button>
										)
									})}
								</div>
								<div className="@md/col:max-w-[220px]">
									<Field label="Preferred time">
										<Select
											value={scheduleTime}
											onChange={setScheduleTime}
											options={TIME_SELECT}
											placeholder="Any time"
										/>
									</Field>
								</div>
							</Section>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

function Section({
	label,
	optional,
	icon,
	children,
}: {
	label: string
	optional?: boolean
	icon?: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<div className="space-y-4 border-t border-gray-100 pt-5">
			<div className="flex items-center gap-2">
				{icon && <span className="text-gray-400">{icon}</span>}
				<span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">
					{label}
				</span>
				{optional && (
					<span className="text-[10px] font-medium text-gray-300">
						Optional
					</span>
				)}
			</div>
			{children}
		</div>
	)
}

function GoalChips({
	value,
	onChange,
}: {
	value: string
	onChange: (v: string) => void
}) {
	const isPreset = (GOAL_PRESETS as readonly string[]).includes(value)
	const [customOpen, setCustomOpen] = useState(false)
	const showCustom = customOpen || (!isPreset && value.trim().length > 0)

	return (
		<div className="space-y-2.5">
			<div className="flex flex-wrap gap-2">
				{GOAL_PRESETS.map((g) => (
					<Chip
						key={g}
						selected={value === g}
						onClick={() => {
							setCustomOpen(false)
							onChange(value === g ? '' : g)
						}}
					>
						{g}
					</Chip>
				))}
				<Chip
					selected={showCustom}
					onClick={() => {
						const next = !showCustom
						setCustomOpen(next)
						if (!next && !isPreset) onChange('')
					}}
				>
					Custom…
				</Chip>
			</div>
			{showCustom && (
				<TextInput
					value={isPreset ? '' : value}
					onChange={onChange}
					placeholder="Describe the goal in your own words"
				/>
			)}
		</div>
	)
}

function Chip({
	selected,
	onClick,
	children,
}: {
	selected: boolean
	onClick: () => void
	children: React.ReactNode
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
				selected
					? 'border-primary bg-primary/10 text-primary'
					: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900',
			)}
		>
			{children}
		</button>
	)
}

function Segmented({
	options,
	value,
	onChange,
}: {
	options: readonly { value: string; label: string }[]
	value: string
	onChange: (v: string) => void
}) {
	return (
		<div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
			{options.map((o) => {
				const selected = value === o.value
				return (
					<button
						key={o.value}
						type="button"
						onClick={() => onChange(o.value)}
						className={cn(
							'rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors',
							selected
								? 'bg-white text-primary shadow-sm'
								: 'text-gray-500 hover:text-gray-800',
						)}
					>
						{o.label}
					</button>
				)
			})}
		</div>
	)
}
