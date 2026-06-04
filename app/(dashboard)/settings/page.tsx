'use client'

import { useMutation, useQuery } from 'convex/react'
import {
	AlertCircle,
	Check,
	Loader2,
	Save,
	Upload,
	X,
} from 'lucide-react'
import Image from 'next/image'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'

import {
	AddressAutocomplete,
	type ResolvedAddress,
} from '@/components/ui/address-autocomplete'
import { cn } from '@/lib/utils'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

const LOGO_MAX_SIZE = 2 * 1024 * 1024
const LOGO_TYPES = new Set(['image/png', 'image/svg+xml'])

const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i
const ZIP_RE = /^[A-Za-z0-9\s-]{3,10}$/
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/

type FieldErrors = Record<string, string | undefined>

const validateAll = (fields: {
	name: string
	website: string
	phone: string
	street: string
	number: string
	zip: string
	city: string
	country: string
	brandColor: string
}): FieldErrors => {
	const errors: FieldErrors = {}
	if (!fields.name.trim()) errors.name = 'Agency name is required'
	else if (fields.name.trim().length < 2) errors.name = 'Too short'
	if (fields.website.trim() && !URL_RE.test(fields.website.trim()))
		errors.website = 'Enter a valid URL (e.g. example.com)'
	if (fields.phone.trim() && !PHONE_RE.test(fields.phone.trim()))
		errors.phone = 'Use 7–20 digits, optional + and separators'
	if (!fields.street.trim()) errors.street = 'Street is required'
	if (!fields.number.trim()) errors.number = 'Required'
	if (!fields.zip.trim()) errors.zip = 'Required'
	else if (!ZIP_RE.test(fields.zip.trim())) errors.zip = 'Invalid ZIP code'
	if (!fields.city.trim()) errors.city = 'Required'
	if (!fields.country.trim()) errors.country = 'Required'
	if (fields.brandColor.trim() && !HEX_COLOR_RE.test(fields.brandColor.trim()))
		errors.brandColor = 'Use a valid hex color (e.g. #2563EB)'
	return errors
}

function SectionRow({
	title,
	description,
	children,
}: {
	title: string
	description: string
	children: ReactNode
}) {
	return (
		<div className="grid grid-cols-1 gap-6 py-8 lg:grid-cols-[280px_1fr]">
			<div className="lg:pt-1.5">
				<h2 className="text-sm font-semibold text-foreground">{title}</h2>
				<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>
			<div className="max-w-xl">{children}</div>
		</div>
	)
}

function FormCard({ children }: { children: ReactNode }) {
	return (
		<div className="rounded-xl border border-border bg-white p-5 shadow-sm">
			{children}
		</div>
	)
}

function InputField({
	label,
	value,
	onChange,
	onBlur,
	placeholder,
	type = 'text',
	error,
	disabled,
}: {
	label: string
	value: string
	onChange: (v: string) => void
	onBlur?: () => void
	placeholder?: string
	type?: string
	error?: string
	disabled?: boolean
}) {
	return (
		<div>
			<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
				{label}
			</label>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				placeholder={placeholder}
				disabled={disabled}
				aria-invalid={!!error}
				className={cn(
					'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-foreground focus:ring-1 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50',
					error ? 'border-red-300' : 'border-border',
				)}
			/>
			{error && (
				<span className="mt-1 flex items-center gap-1 text-xs text-red-600">
					<AlertCircle className="size-3 shrink-0" />
					{error}
				</span>
			)}
		</div>
	)
}

const PRESET_COLORS = [
	'#2563EB',
	'#7C3AED',
	'#DB2777',
	'#DC2626',
	'#EA580C',
	'#CA8A04',
	'#16A34A',
	'#0D9488',
	'#0284C7',
	'#4F46E5',
	'#111827',
	'#6B7280',
]

const isLightColor = (hex: string) => {
	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)
	return r * 0.299 + g * 0.587 + b * 0.114 > 186
}

export default function SettingsPage() {
	const agency = useQuery(api.agencies.myAgency)
	const user = useQuery(api.agencies.currentUser)
	const updateAgency = useMutation(api.agencies.updateAgency)
	const generateLogoUploadUrl = useMutation(api.agencies.generateLogoUploadUrl)
	const removeLogo = useMutation(api.agencies.removeLogo)
	const [isSaving, setIsSaving] = useState(false)
	const [showSaved, setShowSaved] = useState(false)
	const [errors, setErrors] = useState<FieldErrors>({})
	const [touched, setTouched] = useState<Record<string, boolean>>({})
	const logoInputRef = useRef<HTMLInputElement>(null)
	const [logoUploading, setLogoUploading] = useState(false)
	const [logoError, setLogoError] = useState<string | null>(null)

	const [name, setName] = useState('')
	const [website, setWebsite] = useState('')
	const [phone, setPhone] = useState('')
	const [addressQuery, setAddressQuery] = useState('')
	const [street, setStreet] = useState('')
	const [number, setNumber] = useState('')
	const [zip, setZip] = useState('')
	const [city, setCity] = useState('')
	const [country, setCountry] = useState('')
	const [brandColor, setBrandColor] = useState('')

	useEffect(() => {
		if (agency) {
			setName(agency.name)
			setWebsite(agency.website ?? '')
			setPhone(agency.phone ?? '')
			setStreet(agency.street)
			setNumber(agency.number)
			setZip(agency.zip)
			setCity(agency.city)
			setCountry(agency.country)
			setBrandColor(agency.brandColor ?? '#2563EB')
			setAddressQuery(
				[agency.street, agency.number, agency.zip, agency.city]
					.filter(Boolean)
					.join(' '),
			)
		}
	}, [agency])

	const getErrors = () =>
		validateAll({ name, website, phone, street, number, zip, city, country, brandColor })

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }))
		const allErrors = getErrors()
		setErrors((prev) => ({ ...prev, [field]: allErrors[field] }))
	}

	const handleAddressSelect = (addr: ResolvedAddress) => {
		setStreet(addr.street)
		setNumber(addr.number)
		setZip(addr.zip)
		setCity(addr.city)
		setCountry(addr.country)
		setAddressQuery(
			[addr.street, addr.number, addr.zip, addr.city].filter(Boolean).join(' '),
		)
		setErrors((prev) => ({
			...prev,
			street: undefined,
			number: addr.number ? undefined : prev.number,
			zip: addr.zip ? undefined : prev.zip,
			city: addr.city ? undefined : prev.city,
			country: addr.country ? undefined : prev.country,
		}))
		setTouched((prev) => ({
			...prev,
			street: true,
			number: addr.number ? true : prev.number,
			zip: addr.zip ? true : prev.zip,
			city: addr.city ? true : prev.city,
			country: addr.country ? true : prev.country,
		}))
	}

	const handleSave = async () => {
		if (isSaving) return

		const allErrors = getErrors()
		const allTouched: Record<string, boolean> = {}
		for (const key of [
			'name', 'website', 'phone', 'street', 'number',
			'zip', 'city', 'country', 'brandColor',
		]) {
			allTouched[key] = true
		}
		setTouched((prev) => ({ ...prev, ...allTouched }))
		setErrors(allErrors)

		if (Object.values(allErrors).some(Boolean)) return

		setIsSaving(true)
		try {
			await updateAgency({
				name: name.trim(),
				website: website.trim() || undefined,
				phone: phone.trim() || undefined,
				street: street.trim(),
				number: number.trim(),
				zip: zip.trim(),
				city: city.trim(),
				country: country.trim(),
				brandColor: brandColor.trim() || undefined,
			})
			setShowSaved(true)
			setTimeout(() => setShowSaved(false), 2000)
		} finally {
			setIsSaving(false)
		}
	}

	const handleLogoFile = async (file: File) => {
		setLogoError(null)
		if (!LOGO_TYPES.has(file.type)) {
			setLogoError('Use an SVG or PNG file.')
			return
		}
		if (file.size > LOGO_MAX_SIZE) {
			setLogoError('Max file size is 2 MB.')
			return
		}
		setLogoUploading(true)
		try {
			const uploadUrl = await generateLogoUploadUrl()
			const res = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': file.type },
				body: file,
			})
			if (!res.ok) throw new Error('Upload failed')
			const { storageId } = (await res.json()) as {
				storageId: Id<'_storage'>
			}
			await updateAgency({ logoStorageId: storageId, logoFileName: file.name })
		} catch {
			setLogoError('Upload failed. Please try again.')
		} finally {
			setLogoUploading(false)
		}
	}

	const visibleError = (field: string) =>
		touched[field] ? errors[field] : undefined

	if (!agency) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
		)
	}

	const userInitial = user?.name
		? user.name.charAt(0).toUpperCase()
		: user?.email
			? user.email.charAt(0).toUpperCase()
			: '?'

	return (
		<div className="px-6 py-8 lg:px-12 lg:py-10">
			<div className="mb-2 flex items-start justify-between">
				<div>
					<h1
						className="text-2xl font-semibold text-foreground lg:text-3xl"
						style={{ letterSpacing: '-0.04em' }}
					>
						Settings
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage your account settings and preferences
					</p>
				</div>
				<button
					onClick={handleSave}
					disabled={isSaving}
					className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-foreground/90 disabled:opacity-50"
				>
					{isSaving ? (
						<Loader2 className="size-4 animate-spin" />
					) : showSaved ? (
						<Check className="size-4" />
					) : (
						<Save className="size-4" />
					)}
					{showSaved ? 'Saved' : 'Save changes'}
				</button>
			</div>

			<div className="mt-8 border-t border-border/60">
				<div className="mb-6 pt-6">
					<span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
						Account Settings
					</span>
				</div>

				<SectionRow
					title="Profile"
					description="Your personal information and how others see you."
				>
					<FormCard>
						<div className="flex items-start gap-5">
							<div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-foreground text-lg font-semibold text-white">
								{userInitial}
							</div>
							<div className="grid flex-1 gap-4 sm:grid-cols-2">
								<InputField
									label="Full Name"
									value={user?.name ?? ''}
									onChange={() => {}}
									placeholder="Your name"
									disabled
								/>
								<InputField
									label="Email Address"
									value={user?.email ?? ''}
									onChange={() => {}}
									placeholder="you@agency.com"
									type="email"
									disabled
								/>
							</div>
						</div>
					</FormCard>
				</SectionRow>

				<div className="border-t border-border/60" />

				<SectionRow
					title="Agency Details"
					description="Your agency profile that appears across the platform."
				>
					<FormCard>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="sm:col-span-2">
								<InputField
									label="Agency Name"
									value={name}
									onChange={setName}
									onBlur={() => handleBlur('name')}
									placeholder="Acme Agency"
									error={visibleError('name')}
								/>
							</div>
							<InputField
								label="Website"
								value={website}
								onChange={setWebsite}
								onBlur={() => handleBlur('website')}
								placeholder="https://example.com"
								type="url"
								error={visibleError('website')}
							/>
							<InputField
								label="Phone"
								value={phone}
								onChange={setPhone}
								onBlur={() => handleBlur('phone')}
								placeholder="+1 234 567 890"
								type="tel"
								error={visibleError('phone')}
							/>
						</div>
					</FormCard>
				</SectionRow>

				<div className="border-t border-border/60" />

				<SectionRow
					title="Address"
					description="Your agency's physical address. Start typing to search."
				>
					<div className="space-y-4">
						<FormCard>
							<div className="mb-1">
								<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
									Search Address
								</label>
								<AddressAutocomplete
									value={addressQuery}
									onChange={setAddressQuery}
									onSelect={handleAddressSelect}
									placeholder="Start typing your address…"
									autoComplete="address-line1"
									error={visibleError('street')}
								/>
								<p className="mt-1.5 text-[11px] text-muted-foreground/60">
									Pick from suggestions to autofill, or edit fields below.
								</p>
							</div>
						</FormCard>

						<FormCard>
							<div className="grid gap-4 sm:grid-cols-2">
								<InputField
									label="Street"
									value={street}
									onChange={setStreet}
									onBlur={() => handleBlur('street')}
									placeholder="Main St"
									error={visibleError('street')}
								/>
								<InputField
									label="Number"
									value={number}
									onChange={setNumber}
									onBlur={() => handleBlur('number')}
									placeholder="4A"
									error={visibleError('number')}
								/>
								<InputField
									label="ZIP / Postal Code"
									value={zip}
									onChange={setZip}
									onBlur={() => handleBlur('zip')}
									placeholder="10001"
									error={visibleError('zip')}
								/>
								<InputField
									label="City"
									value={city}
									onChange={setCity}
									onBlur={() => handleBlur('city')}
									placeholder="New York"
									error={visibleError('city')}
								/>
								<div className="sm:col-span-2">
									<InputField
										label="Country"
										value={country}
										onChange={setCountry}
										onBlur={() => handleBlur('country')}
										placeholder="Switzerland"
										error={visibleError('country')}
									/>
								</div>
							</div>
						</FormCard>
					</div>
				</SectionRow>

				<div className="border-t border-border/60" />

				<SectionRow
					title="Branding"
					description="Define your agency's visual identity with colors and logo assets."
				>
					<div className="space-y-4">
						<FormCard>
							<h3 className="mb-1 text-sm font-semibold text-foreground">
								Brand Color
							</h3>
							<p className="mb-4 text-xs text-muted-foreground">
								Define your white-labeled experience
							</p>

							<div className="flex flex-col gap-5 sm:flex-row">
								<div className="shrink-0">
									<div className="overflow-hidden rounded-xl border border-border [&_.react-colorful]:!w-[200px] [&_.react-colorful]:!h-[160px] [&_.react-colorful\_\_saturation]:!rounded-t-xl [&_.react-colorful\_\_hue]:!h-[12px] [&_.react-colorful\_\_hue]:!rounded-b-xl [&_.react-colorful\_\_pointer]:!w-[18px] [&_.react-colorful\_\_pointer]:!h-[18px]">
										<HexColorPicker
											color={HEX_COLOR_RE.test(brandColor) ? brandColor : '#2563EB'}
											onChange={(color) => {
												setBrandColor(color.toUpperCase())
												setErrors((prev) => ({
													...prev,
													brandColor: undefined,
												}))
											}}
										/>
									</div>
								</div>

								<div className="flex-1 space-y-4">
									<div className="flex flex-wrap gap-1.5">
										{PRESET_COLORS.map((color) => (
											<button
												key={color}
												type="button"
												onClick={() => {
													setBrandColor(color)
													setErrors((prev) => ({
														...prev,
														brandColor: undefined,
													}))
												}}
												className={cn(
													'flex size-7 items-center justify-center rounded-md border-2 transition-all',
													brandColor.toUpperCase() === color.toUpperCase()
														? 'border-foreground scale-110 ring-1 ring-foreground/20'
														: 'border-transparent hover:scale-105',
												)}
												style={{ backgroundColor: color }}
												aria-label={`Select color ${color}`}
											>
												{brandColor.toUpperCase() === color.toUpperCase() && (
													<Check
														className="size-3"
														style={{
															color: isLightColor(color)
																? '#111827'
																: '#ffffff',
														}}
													/>
												)}
											</button>
										))}
									</div>

									<div className="flex items-center gap-2.5">
										<div
											className="size-9 shrink-0 rounded-lg border border-border shadow-sm"
											style={{
												backgroundColor: HEX_COLOR_RE.test(brandColor)
													? brandColor
													: '#2563EB',
											}}
										/>
										<input
											type="text"
											value={brandColor}
											onChange={(e) => setBrandColor(e.target.value.toUpperCase())}
											onBlur={() => handleBlur('brandColor')}
											placeholder="#2563EB"
											aria-invalid={!!visibleError('brandColor')}
											className={cn(
												'w-28 rounded-lg border bg-white px-3 py-2 text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-foreground focus:ring-1 focus:ring-foreground/10',
												visibleError('brandColor')
													? 'border-red-300'
													: 'border-border',
											)}
										/>
									</div>
									{visibleError('brandColor') && (
										<span className="flex items-center gap-1 text-xs text-red-600">
											<AlertCircle className="size-3 shrink-0" />
											{visibleError('brandColor')}
										</span>
									)}
								</div>
							</div>
						</FormCard>

						<FormCard>
							<h3 className="mb-1 text-sm font-semibold text-foreground">
								Agency Logo
							</h3>
							<p className="mb-4 text-xs text-muted-foreground">
								Upload your logo with a transparent background (SVG or PNG).
							</p>
							{agency.logoUrl ? (
								<div className="flex items-center gap-4">
									<div className="relative flex h-24 w-40 items-center justify-center rounded-xl border border-border bg-muted/40 p-3">
										<Image
											src={agency.logoUrl}
											alt={`${name || 'Agency'} logo`}
											fill
											className="object-contain p-3"
											unoptimized
										/>
									</div>
									<div className="space-y-2">
										<button
											type="button"
											onClick={() => logoInputRef.current?.click()}
											disabled={logoUploading}
											className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
										>
											{logoUploading ? (
												<Loader2 className="size-3.5 animate-spin" />
											) : (
												<Upload className="size-3.5" />
											)}
											Replace
										</button>
										<button
											type="button"
											onClick={() => void removeLogo()}
											disabled={logoUploading}
											className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
										>
											<X className="size-3.5" />
											Remove
										</button>
									</div>
								</div>
							) : (
								<button
									type="button"
									onClick={() => logoInputRef.current?.click()}
									disabled={logoUploading}
									className="group relative flex h-36 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-foreground/30 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
									aria-label="Upload agency logo"
								>
									<div className="flex flex-col items-center gap-2.5">
										<div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-sm">
											{logoUploading ? (
												<Loader2 className="size-4 animate-spin text-muted-foreground" />
											) : (
												<Upload className="size-4 text-muted-foreground" />
											)}
										</div>
										<div className="text-center">
											<p className="text-xs font-medium text-foreground">
												{logoUploading ? 'Uploading…' : 'Click to upload'}
											</p>
											<p className="mt-0.5 text-[11px] text-muted-foreground">
												SVG or PNG with transparent background. Max 2MB.
											</p>
										</div>
									</div>
								</button>
							)}
							<input
								ref={logoInputRef}
								type="file"
								accept="image/png,image/svg+xml"
								className="sr-only"
								onChange={(e) => {
									const file = e.target.files?.[0]
									if (file) void handleLogoFile(file)
									e.target.value = ''
								}}
							/>
							{logoError && (
								<p className="mt-2 flex items-center gap-1 text-xs text-red-600">
									<AlertCircle className="size-3 shrink-0" />
									{logoError}
								</p>
							)}
						</FormCard>

						<FormCard>
							<h3 className="mb-3 text-sm font-semibold text-foreground">
								Preview
							</h3>
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
									<div
										className="flex size-10 items-center justify-center rounded-lg text-sm font-semibold text-white"
										style={{
											backgroundColor: HEX_COLOR_RE.test(brandColor)
												? brandColor
												: '#2563EB',
										}}
									>
										{name ? name.charAt(0).toUpperCase() : 'A'}
									</div>
									<div>
										<p className="text-sm font-medium text-foreground">
											{name || 'Your Agency'}
										</p>
										<p className="text-xs text-muted-foreground">
											{website || 'agency.com'}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3 rounded-lg bg-foreground p-4">
									<div
										className="flex size-10 items-center justify-center rounded-lg text-sm font-semibold"
										style={{
											backgroundColor: HEX_COLOR_RE.test(brandColor)
												? brandColor
												: '#2563EB',
											color: isLightColor(
												HEX_COLOR_RE.test(brandColor) ? brandColor : '#2563EB',
											)
												? '#111827'
												: '#ffffff',
										}}
									>
										{name ? name.charAt(0).toUpperCase() : 'A'}
									</div>
									<div>
										<p className="text-sm font-medium text-white">
											{name || 'Your Agency'}
										</p>
										<p className="text-xs text-white/50">
											{website || 'agency.com'}
										</p>
									</div>
								</div>
							</div>
						</FormCard>
					</div>
				</SectionRow>
			</div>
		</div>
	)
}
