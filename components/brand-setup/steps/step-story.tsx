'use client'

import { useMemo, useState } from 'react'

import { FIELDS_OF_BUSINESS } from '../data'
import { Field, Select, TagInput, TextInput, Textarea } from '../fields'
import type { BrandWithMedia, CompanyProfile } from '../types'
import { useAutosave } from '../use-autosave'

type Props = {
	brand: BrandWithMedia
	onSave: (patch: { companyProfile?: CompanyProfile }) => void
}

const FIELD_OPTIONS = FIELDS_OF_BUSINESS.map((f) => ({ value: f, label: f }))

export function StepStory({ brand, onSave }: Props) {
	const p = brand.companyProfile
	const [fieldOfBusiness, setFieldOfBusiness] = useState(p?.fieldOfBusiness ?? '')
	const [coreIdentity, setCoreIdentity] = useState(p?.coreIdentity ?? '')
	const [coreMessage, setCoreMessage] = useState(p?.coreMessage ?? '')
	const [tagline, setTagline] = useState(p?.tagline ?? '')
	const [mission, setMission] = useState(p?.mission ?? '')
	const [vision, setVision] = useState(p?.vision ?? '')
	const [values, setValues] = useState<string[]>(p?.values ?? [])
	const [products, setProducts] = useState<string[]>(p?.products ?? [])
	const [reasonsToBelieve, setReasonsToBelieve] = useState<string[]>(
		p?.reasonsToBelieve ?? [],
	)
	const [keyMessages, setKeyMessages] = useState<string[]>(p?.keyMessages ?? [])

	const data = useMemo(
		() => ({
			companyProfile: {
				fieldOfBusiness: fieldOfBusiness || undefined,
				coreIdentity: coreIdentity.trim() || undefined,
				coreMessage: coreMessage.trim() || undefined,
				tagline: tagline.trim() || undefined,
				mission: mission.trim() || undefined,
				vision: vision.trim() || undefined,
				values,
				products,
				reasonsToBelieve,
				keyMessages,
			},
		}),
		[
			fieldOfBusiness,
			coreIdentity,
			coreMessage,
			tagline,
			mission,
			vision,
			values,
			products,
			reasonsToBelieve,
			keyMessages,
		],
	)

	useAutosave({ data, save: onSave })

	return (
		<div className="space-y-6">
			<p className="text-sm text-gray-500">
				Define the core identity and offering. The clearer this story, the
				better your AI agent can write for you.
			</p>

			<Card
				title="Identity"
				subtitle="Who you are and what you stand for."
			>
				<Field label="Field of Business">
					<Select
						value={fieldOfBusiness}
						onChange={setFieldOfBusiness}
						options={FIELD_OPTIONS}
						placeholder="Select field"
					/>
				</Field>
				<Field label="Core Identity (Who & What)">
					<Textarea
						value={coreIdentity}
						onChange={setCoreIdentity}
						placeholder="e.g. We are a fintech company that helps SMBs automate their accounting…"
						rows={3}
					/>
				</Field>
				<Field label="Core Message">
					<Textarea
						value={coreMessage}
						onChange={setCoreMessage}
						placeholder="Your brand’s central message…"
						rows={2}
					/>
				</Field>
			</Card>

			<Card
				title="Purpose & values"
				subtitle="The strategic spine that steers tone and messaging."
			>
				<Field label="Tagline / claim" hint="One memorable line, e.g. “There is no substitute.”">
					<TextInput
						value={tagline}
						onChange={setTagline}
						placeholder="Your brand’s signature line…"
						maxLength={120}
					/>
				</Field>
				<Field label="Mission (why you exist)">
					<Textarea
						value={mission}
						onChange={setMission}
						placeholder="e.g. To make accounting effortless for every small business."
						rows={2}
					/>
				</Field>
				<Field label="Vision (where you’re headed)">
					<Textarea
						value={vision}
						onChange={setVision}
						placeholder="e.g. A world where no founder fears their finances."
						rows={2}
					/>
				</Field>
				<Field label="Brand values">
					<TagInput
						value={values}
						onChange={setValues}
						placeholder="e.g. Precision"
					/>
				</Field>
			</Card>

			<Card
				title="Offering"
				subtitle="What you sell and why customers choose you."
			>
				<Field label="Products or services">
					<TagInput
						value={products}
						onChange={setProducts}
						placeholder="Add product or service…"
					/>
				</Field>
				<Field label="Reasons to believe">
					<TagInput
						value={reasonsToBelieve}
						onChange={setReasonsToBelieve}
						placeholder="e.g. Award-winning support"
					/>
				</Field>
			</Card>

			<Card
				title="Supporting messages"
				subtitle="Short, repeatable claims your content can lean on."
			>
				<TagInput
					value={keyMessages}
					onChange={setKeyMessages}
					placeholder="Add a key message and press Enter"
				/>
			</Card>
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
		<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
			<div className="mb-5">
				<h2 className="text-base font-semibold text-gray-900">{title}</h2>
				{subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
			</div>
			<div className="space-y-4">{children}</div>
		</div>
	)
}
