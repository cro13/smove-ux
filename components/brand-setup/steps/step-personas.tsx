'use client'

import { useMutation, useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, User } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

import { Field, NumberInput, TextInput, Textarea } from '../fields'
import { CHANNEL_LABEL, type Channel } from '../types'
import { useAutosave, type SaveStatus } from '../use-autosave'

type Props = {
	brandId: Id<'brands'>
	channels: Channel[]
	onStatus: (s: SaveStatus) => void
}

export function StepPersonas({ brandId, channels, onStatus }: Props) {
	const [activeChannel, setActiveChannel] = useState<Channel | null>(
		channels[0] ?? null,
	)
	const personas = useQuery(api.brandPersonas.listByBrand, { brandId })
	const createPersona = useMutation(api.brandPersonas.create)
	const removePersona = useMutation(api.brandPersonas.remove)

	if (channels.length === 0 || !activeChannel) {
		return (
			<EmptyState message="Go back to step 5 and pick at least one channel before adding personas." />
		)
	}

	const channelPersonas =
		personas?.filter((p) => p.channel === activeChannel) ?? []

	return (
		<div className="space-y-6">
			<p className="text-sm text-gray-500">
				Define who you want to reach on each channel.
			</p>

			{channels.length > 1 && (
				<ChannelTabs
					channels={channels}
					active={activeChannel}
					onChange={setActiveChannel}
				/>
			)}

			<div className="space-y-4">
				<AnimatePresence initial={false}>
					{channelPersonas.map((persona) => (
						<motion.div
							key={persona._id}
							layout
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95 }}
						>
							<PersonaCard
								persona={persona}
								onStatus={onStatus}
								onRemove={() => removePersona({ personaId: persona._id })}
							/>
						</motion.div>
					))}
				</AnimatePresence>

				<button
					type="button"
					onClick={() =>
						createPersona({ brandId, channel: activeChannel })
					}
					className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white py-4 text-sm font-medium text-gray-500 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
				>
					<Plus className="size-4" />
					Add {channelPersonas.length === 0 ? 'first' : 'another'} persona
				</button>
			</div>
		</div>
	)
}

function ChannelTabs({
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
							isActive
								? 'text-white'
								: 'text-gray-500 hover:text-gray-900',
						)}
					>
						{isActive && (
							<motion.span
							layoutId="channel-pill"
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

function EmptyState({ message }: { message: string }) {
	return (
		<div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center">
			<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
				<User className="size-5" />
			</div>
			<p className="text-sm text-gray-500">{message}</p>
		</div>
	)
}

function PersonaCard({
	persona,
	onStatus,
	onRemove,
}: {
	persona: Doc<'brandPersonas'>
	onStatus: (s: SaveStatus) => void
	onRemove: () => void
}) {
	const updatePersona = useMutation(api.brandPersonas.update)
	const [name, setName] = useState(persona.name ?? '')
	const [shortDescription, setShortDescription] = useState(
		persona.shortDescription ?? '',
	)
	const [gender, setGender] = useState(persona.gender ?? '')
	const [ageMin, setAgeMin] = useState(
		persona.ageMin !== undefined ? String(persona.ageMin) : '',
	)
	const [ageMax, setAgeMax] = useState(
		persona.ageMax !== undefined ? String(persona.ageMax) : '',
	)
	const [location, setLocation] = useState(persona.location ?? '')
	const [profession, setProfession] = useState(persona.profession ?? '')
	const [goals, setGoals] = useState(persona.goals ?? '')
	const [challenges, setChallenges] = useState(persona.challenges ?? '')
	const [interests, setInterests] = useState(persona.interests ?? '')

	const ageMinN = ageMin === '' ? null : parseInt(ageMin, 10)
	const ageMaxN = ageMax === '' ? null : parseInt(ageMax, 10)

	const data = useMemo(
		() => ({
			name: name.trim(),
			shortDescription: shortDescription.trim() || undefined,
			gender: gender.trim() || undefined,
			ageMin: ageMinN ?? undefined,
			ageMax: ageMaxN ?? undefined,
			location: location.trim() || undefined,
			profession: profession.trim() || undefined,
			goals: goals.trim() || undefined,
			challenges: challenges.trim() || undefined,
			interests: interests.trim() || undefined,
		}),
		[
			name,
			shortDescription,
			gender,
			ageMinN,
			ageMaxN,
			location,
			profession,
			goals,
			challenges,
			interests,
		],
	)

	const save = useCallback(
		async (next: typeof data) => {
			await updatePersona({ personaId: persona._id, ...next })
		},
		[updatePersona, persona._id],
	)

	useAutosave({ data, save, onStatus, delay: 600 })

	const ageRangeError =
		ageMinN !== null && ageMaxN !== null && ageMinN > ageMaxN
			? 'Min must be ≤ max'
			: undefined

	return (
		<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
			<div className="mb-4 flex items-start justify-between gap-3">
				<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
					<User className="size-3.5" />
					Persona details
				</div>
				<button
					type="button"
					onClick={onRemove}
					className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
					aria-label="Remove persona"
				>
					<Trash2 className="size-3.5" />
				</button>
			</div>

			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
				<div className="space-y-4">
					<Field label="Name">
						<TextInput
							value={name}
							onChange={setName}
							placeholder="e.g. Finance Frank"
						/>
					</Field>
					<Field label="Short description">
						<TextInput
							value={shortDescription}
							onChange={setShortDescription}
							placeholder="A brief overview…"
						/>
					</Field>
					<div className="grid grid-cols-2 gap-3">
						<Field label="Gender">
							<TextInput
								value={gender}
								onChange={setGender}
								placeholder="e.g. Male"
							/>
						</Field>
						<Field label="Age range" hint="0–99" error={ageRangeError}>
							<div className="flex items-center gap-1.5">
								<NumberInput
									value={ageMin}
									onChange={setAgeMin}
									placeholder="Min"
									min={0}
									max={99}
								/>
								<span className="text-gray-400">–</span>
								<NumberInput
									value={ageMax}
									onChange={setAgeMax}
									placeholder="Max"
									min={0}
									max={99}
								/>
							</div>
						</Field>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<Field label="Location">
							<TextInput
								value={location}
								onChange={setLocation}
								placeholder="Urban areas"
							/>
						</Field>
						<Field label="Profession">
							<TextInput
								value={profession}
								onChange={setProfession}
								placeholder="CFO"
							/>
						</Field>
					</div>
				</div>

				<div className="space-y-4">
					<Field label="Goals">
						<Textarea
							value={goals}
							onChange={setGoals}
							placeholder="What achievements they’re after…"
							rows={3}
						/>
					</Field>
					<Field label="Challenges">
						<Textarea
							value={challenges}
							onChange={setChallenges}
							placeholder="Pain points…"
							rows={3}
						/>
					</Field>
					<Field label="Interests">
						<Textarea
							value={interests}
							onChange={setInterests}
							placeholder="Hobbies, topics…"
							rows={3}
						/>
					</Field>
				</div>
			</div>
		</div>
	)
}
