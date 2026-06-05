'use client'

import { useEffect, useMemo, useState } from 'react'

import {
	AddressAutocomplete,
	type ResolvedAddress,
} from '@/components/ui/address-autocomplete'

import { LANGUAGES } from '../data'
import { Field, Select, TextInput } from '../fields'
import type { BrandWithMedia } from '../types'
import { useAutosave } from '../use-autosave'
import { isValidEmail, isValidUrl, nonEmpty } from '../validation'

type Props = {
	brand: BrandWithMedia
	onSave: (patch: {
		name?: string
		website?: string
		ingestKey?: string
		approvalPhone?: string
		generalInfo?: {
			language?: string
			location?: string
			contactName?: string
			contactEmail?: string
		}
	}) => void
	onValidationError: (msg: string | null) => void
}

export function StepGeneralInfo({ brand, onSave, onValidationError }: Props) {
	const [name, setName] = useState(brand.name ?? '')
	const [website, setWebsite] = useState(brand.website ?? '')
	const [language, setLanguage] = useState(brand.generalInfo?.language ?? '')
	const [location, setLocation] = useState(brand.generalInfo?.location ?? '')
	const [contactName, setContactName] = useState(
		brand.generalInfo?.contactName ?? '',
	)
	const [contactEmail, setContactEmail] = useState(
		brand.generalInfo?.contactEmail ?? '',
	)
	const [ingestKey, setIngestKey] = useState(brand.ingestKey ?? '')
	const [approvalPhone, setApprovalPhone] = useState(brand.approvalPhone ?? '')

	const errors = useMemo(() => {
		const next: Record<string, string> = {}
		if (!nonEmpty(name)) next.name = 'Brand name is required'
		if (website && !isValidUrl(website))
			next.website = 'Enter a valid URL (e.g. example.com)'
		if (contactEmail && !isValidEmail(contactEmail))
			next.contactEmail = 'Enter a valid email'
		return next
	}, [name, website, contactEmail])

	const handleLocationSelect = (address: ResolvedAddress) => {
		const label = [address.city, address.country].filter(Boolean).join(', ')
		setLocation(label || location)
	}

	const data = useMemo(
		() => ({
			name: name.trim(),
			website: website.trim(),
			ingestKey: ingestKey.trim() || undefined,
			approvalPhone: approvalPhone.trim() || undefined,
			generalInfo: {
				language: language || undefined,
				location: location.trim() || undefined,
				contactName: contactName.trim() || undefined,
				contactEmail: contactEmail.trim() || undefined,
			},
		}),
		[name, website, ingestKey, approvalPhone, language, location, contactName, contactEmail],
	)

	useAutosave({ data, save: onSave })

	useEffect(() => {
		const hasErrors = Object.keys(errors).length > 0
		onValidationError(
			hasErrors ? 'Fix the highlighted fields to continue.' : null,
		)
		return () => onValidationError(null)
	}, [errors, onValidationError])

	return (
		<div className="space-y-7">
			<p className="text-sm text-gray-500">
				Let’s start with the basics of your brand. We’ll use these to address
				the brand in our communication.
			</p>

			<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<Field label="Brand Name" required error={errors.name}>
						<TextInput
							value={name}
							onChange={setName}
							placeholder="e.g. Acme Corp"
							error={!!errors.name}
						/>
					</Field>
					<Field label="Website" error={errors.website} hint="Optional">
						<TextInput
							value={website}
							onChange={setWebsite}
							placeholder="https://example.com"
							inputMode="url"
							error={!!errors.website}
						/>
					</Field>
					<Field label="Language">
						<Select
							value={language}
							onChange={setLanguage}
							options={LANGUAGES}
							placeholder="Select language"
						/>
					</Field>
					<Field label="Location">
						<AddressAutocomplete
							value={location}
							onChange={setLocation}
							onSelect={handleLocationSelect}
							placeholder="City, Country"
							autoComplete="address-level2"
						/>
					</Field>
				</div>
			</div>

			<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
				<div className="mb-4">
					<h2 className="text-base font-semibold text-gray-900">
						Primary contact
					</h2>
					<p className="mt-0.5 text-sm text-gray-500">
						The person responsible for approving content for this brand.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<Field label="Name">
						<TextInput
							value={contactName}
							onChange={setContactName}
							placeholder="Jane Doe"
						/>
					</Field>
					<Field label="Email" error={errors.contactEmail}>
						<TextInput
							value={contactEmail}
							onChange={setContactEmail}
							placeholder="jane@example.com"
							type="email"
							inputMode="email"
							autoComplete="email"
							error={!!errors.contactEmail}
						/>
					</Field>
				</div>
			</div>

			<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
				<div className="mb-4">
					<h2 className="text-base font-semibold text-gray-900">
						WhatsApp Ingest Key
					</h2>
					<p className="mt-0.5 text-sm text-gray-500">
						A short code employees use to submit content via WhatsApp.
						They prefix their message with this key, e.g.
						&quot;{ingestKey || 'BRAND'}: Photo from the event&quot;
					</p>
				</div>
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<Field label="Ingest Key" hint="2-20 characters, alphanumeric">
						<TextInput
							value={ingestKey}
							onChange={(val) => setIngestKey(val.toUpperCase())}
							placeholder="e.g. AMAZON"
						/>
					</Field>
					<Field label="Approval Contact" hint="WhatsApp number with country code">
						<TextInput
							value={approvalPhone}
							onChange={setApprovalPhone}
							placeholder="e.g. 491234567890"
							inputMode="tel"
						/>
					</Field>
				</div>
			</div>
		</div>
	)
}
