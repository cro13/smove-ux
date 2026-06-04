'use client'

import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react'
import { useConvex, useMutation } from 'convex/react'
import { motion } from 'framer-motion'
import {
	ArrowLeft,
	ArrowRight,
	Check,
	ImageIcon,
	Loader2,
	Upload,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
	AddressAutocomplete,
	type ResolvedAddress,
} from '@/components/ui/address-autocomplete'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

const SMOVE_LOGO =
	'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4ebd8e68-4cde-439b-8859-2820929ed47a_320w.png'

type FormData = {
	agencyName: string
	website: string
	phone: string
	street: string
	number: string
	zip: string
	city: string
	country: string
	name: string
	email: string
	password: string
	accessCode: string
	brandColor: string
	logoFile: File | null
	logoPreviewUrl: string | null
}

type FieldKey = Exclude<keyof FormData, 'logoFile' | 'logoPreviewUrl'>

interface AgencyRegistrationInput {
	name: string
	website?: string
	phone?: string
	brandColor?: string
	logoFileName?: string
	logoStorageId?: Id<'_storage'>
	street: string
	number: string
	zip: string
	city: string
	country: string
	accessCode: string
}

const initialData: FormData = {
	agencyName: '',
	website: '',
	phone: '',
	street: '',
	number: '',
	zip: '',
	city: '',
	country: '',
	name: '',
	email: '',
	password: '',
	accessCode: '',
	brandColor: '#1541FC',
	logoFile: null,
	logoPreviewUrl: null,
}

const STEPS = [
	{ id: 1, label: 'Agency', headline: 'Tell us about your agency' },
	{ id: 2, label: 'Address', headline: 'Where are you based?' },
	{ id: 3, label: 'Account', headline: 'Create your account' },
	{ id: 4, label: 'Brand kit', headline: 'Add your brand kit' },
] as const

// --- Validation helpers --------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i
const ZIP_RE = /^[A-Za-z0-9\s-]{3,10}$/
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/
const MAX_LOGO_SIZE = 2 * 1024 * 1024
const LOGO_FILE_TYPES = new Set(['image/png', 'image/svg+xml', 'image/webp'])

function validateField(key: FieldKey, value: string): string | undefined {
	const v = value.trim()
	switch (key) {
		case 'agencyName':
			if (!v) return 'Agency name is required'
			if (v.length < 2) return 'Too short'
			return
		case 'website':
			if (!v) return
			if (!URL_RE.test(v)) return 'Enter a valid URL (e.g. example.com)'
			return
		case 'phone':
			if (!v) return
			if (!PHONE_RE.test(v)) return 'Use 7–20 digits, optional + and separators'
			return
		case 'street':
			if (!v) return 'Required'
			return
		case 'number':
			if (!v) return 'Required'
			return
		case 'zip':
			if (!v) return 'Required'
			if (!ZIP_RE.test(v)) return 'Invalid ZIP code'
			return
		case 'city':
			if (!v) return 'Required'
			return
		case 'country':
			if (!v) return 'Required'
			return
		case 'name':
			if (!v) return 'Required'
			if (v.length < 2) return 'Too short'
			return
		case 'email':
			if (!v) return 'Required'
			if (!EMAIL_RE.test(v)) return 'Enter a valid email'
			return
		case 'password':
			if (!value) return 'Required'
			if (value.length < 8) return 'At least 8 characters'
			if (!/[a-zA-Z]/.test(value) || !/\d/.test(value))
				return 'Mix letters and numbers'
			return
		case 'accessCode':
			if (!v) return 'Required'
			if (v.length < 4) return 'Access codes are at least 4 characters'
			return
		case 'brandColor':
			if (!v) return 'Required'
			if (!HEX_COLOR_RE.test(v)) return 'Use a valid hex color'
			return
	}
}

const STEP_FIELDS: Record<number, FieldKey[]> = {
	1: ['agencyName', 'website', 'phone'],
	2: ['street', 'number', 'zip', 'city', 'country'],
	3: ['name', 'email', 'password', 'accessCode'],
	4: ['brandColor'],
}

const GENERIC_SIGNUP_ERROR =
	'Could not create your account. Please try again.'
const SESSION_TIMEOUT_ERROR =
	'Your account was created, but the session did not finish loading. Sign in to continue.'
const LOGO_UPLOAD_ERROR =
	'Could not upload this logo. Try another file or skip this step.'

const normalizeOptionalValue = (value: string) => {
	const trimmed = value.trim()
	return trimmed || undefined
}

const isSupportedLogoFile = (file: File) => {
	const fileName = file.name.toLowerCase()
	return (
		LOGO_FILE_TYPES.has(file.type) ||
		fileName.endsWith('.svg') ||
		fileName.endsWith('.png') ||
		fileName.endsWith('.webp')
	)
}

const getSignupErrorMessage = (err: unknown) => {
	const message = err instanceof Error ? err.message : ''

	if (message.includes('Invalid access code')) {
		return 'Invalid access code. New here? Contact info@smove.ai to get one.'
	}

	if (message.includes('Access code has no remaining uses')) {
		return 'Access code has no remaining uses.'
	}

	if (message.includes(LOGO_UPLOAD_ERROR)) {
		return LOGO_UPLOAD_ERROR
	}

	if (message.includes('already linked to an agency')) {
		return 'This account is already linked to an agency.'
	}

	if (message.includes('already exists')) {
		return 'An account with this email already exists. Sign in instead.'
	}

	if (message.includes('Invalid password')) {
		return 'Password must be at least 8 characters.'
	}

	if (message.includes('Invalid credentials')) {
		return 'Invalid email or password.'
	}

	if (
		message.includes('Missing environment variable') ||
		message.includes('JWT_PRIVATE_KEY') ||
		message.includes('JWKS') ||
		message.includes('SITE_URL')
	) {
		return 'Signup is not configured correctly yet. Please try again later.'
	}

	if (message.includes('You must be signed in')) {
		return 'Your account was created, but agency setup could not finish. Sign in to continue.'
	}

	if (message.includes('WebSocket') || message.includes('Failed to fetch')) {
		return 'Could not reach the server. Check that Convex is running.'
	}

	return GENERIC_SIGNUP_ERROR
}

// --- UI helpers ----------------------------------------------------------

function Field({
	label,
	error,
	hint,
	children,
}: {
	label: string
	error?: string
	hint?: string
	children: React.ReactNode
}) {
	return (
		<label className="block">
			<span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
				{label}
			</span>
			{children}
			<div className="min-h-[16px] mt-1">
				{error ? (
					<p className="text-xs text-red-500">{error}</p>
				) : hint ? (
					<p className="text-xs text-gray-400">{hint}</p>
				) : null}
			</div>
		</label>
	)
}

function TextInput({
	value,
	onChange,
	onBlur,
	type = 'text',
	placeholder,
	autoComplete,
	hasError,
	inputMode,
}: {
	value: string
	onChange: (v: string) => void
	onBlur?: () => void
	type?: string
	placeholder?: string
	autoComplete?: string
	hasError?: boolean
	inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
	return (
		<input
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onBlur={onBlur}
			placeholder={placeholder}
			autoComplete={autoComplete}
			inputMode={inputMode}
			aria-invalid={hasError}
			className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:ring-red-100"
		/>
	)
}

function StepDots({ current }: { current: number }) {
	return (
		<div className="flex items-center justify-center gap-2 mb-8">
			{STEPS.map((s) => (
				<div key={s.id} className="flex items-center gap-2">
					<div
						className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
							s.id < current
								? 'bg-primary text-white'
								: s.id === current
									? 'bg-gray-900 text-white'
									: 'bg-gray-100 text-gray-400'
						}`}
					>
						{s.id < current ? <Check className="size-3.5" /> : s.id}
					</div>
					<span
						className={`hidden sm:inline text-xs font-medium transition-colors ${
							s.id <= current ? 'text-gray-900' : 'text-gray-400'
						}`}
					>
						{s.label}
					</span>
					{s.id !== STEPS.length && (
						<div
							className={`w-8 h-px transition-colors ${
								s.id < current ? 'bg-primary' : 'bg-gray-200'
							}`}
						/>
					)}
				</div>
			))}
		</div>
	)
}

// --- Page ---------------------------------------------------------------

export default function RegisterAgencyPage() {
	const router = useRouter()
	const convex = useConvex()
	const { signIn } = useAuthActions()
	const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
	const generateLogoUploadUrl = useMutation(api.agencies.generateLogoUploadUrl)
	const registerAgency = useMutation(api.agencies.registerAgency)
	const isCompletingRegistrationRef = useRef(false)
	const logoInputRef = useRef<HTMLInputElement>(null)
	const logoPreviewUrlRef = useRef<string | null>(null)

	const [step, setStep] = useState(1)
	const [data, setData] = useState<FormData>(initialData)
	const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({})
	const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({})
	const [submitting, setSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [pendingAgency, setPendingAgency] =
		useState<AgencyRegistrationInput | null>(null)
	const [direction, setDirection] = useState(1)

	const set = (key: FieldKey, value: string) => {
		setData((d) => ({ ...d, [key]: value }))
		if (touched[key]) {
			setErrors((e) => ({ ...e, [key]: validateField(key, value) }))
		} else if (errors[key]) {
			setErrors((e) => ({ ...e, [key]: undefined }))
		}
	}

	const blur = (key: FieldKey) => {
		setTouched((t) => ({ ...t, [key]: true }))
		setErrors((e) => ({ ...e, [key]: validateField(key, data[key]) }))
	}

	const validateStep = (s: number): boolean => {
		const fields = STEP_FIELDS[s]
		const next: Partial<Record<FieldKey, string>> = { ...errors }
		const newTouched: Partial<Record<FieldKey, boolean>> = { ...touched }
		let ok = true
		for (const f of fields) {
			const err = validateField(f, data[f])
			newTouched[f] = true
			if (err) {
				ok = false
				next[f] = err
			} else {
				next[f] = undefined
			}
		}
		setErrors(next)
		setTouched(newTouched)
		return ok
	}

	const goNext = () => {
		if (!validateStep(step)) return
		setDirection(1)
		setStep((s) => Math.min(STEPS.length, s + 1))
	}

	const goBack = () => {
		setDirection(-1)
		setStep((s) => Math.max(1, s - 1))
	}

	const applyAddress = (addr: ResolvedAddress) => {
		setData((d) => ({
			...d,
			street: addr.street || d.street,
			number: addr.number || d.number,
			zip: addr.zip || d.zip,
			city: addr.city || d.city,
			country: addr.country || d.country,
		}))
		setErrors((e) => ({
			...e,
			street: addr.street ? undefined : e.street,
			number: addr.number ? undefined : e.number,
			zip: addr.zip ? undefined : e.zip,
			city: addr.city ? undefined : e.city,
			country: addr.country ? undefined : e.country,
		}))
		setTouched((t) => ({
			...t,
			street: true,
			number: addr.number ? true : t.number,
			zip: addr.zip ? true : t.zip,
			city: addr.city ? true : t.city,
			country: addr.country ? true : t.country,
		}))
	}

	const revokeLogoPreviewUrl = () => {
		if (!logoPreviewUrlRef.current) return

		URL.revokeObjectURL(logoPreviewUrlRef.current)
		logoPreviewUrlRef.current = null
	}

	const handleLogoFileChange = (file: File | null) => {
		if (!file) return

		if (!isSupportedLogoFile(file)) {
			setSubmitError('Upload an SVG, PNG, or WebP logo.')
			return
		}

		if (file.size > MAX_LOGO_SIZE) {
			setSubmitError('Logo must be smaller than 2 MB.')
			return
		}

		revokeLogoPreviewUrl()
		const logoPreviewUrl = URL.createObjectURL(file)
		logoPreviewUrlRef.current = logoPreviewUrl
		setSubmitError(null)
		setData((d) => ({
			...d,
			logoFile: file,
			logoPreviewUrl,
		}))
	}

	const clearLogoFile = () => {
		revokeLogoPreviewUrl()
		if (logoInputRef.current) {
			logoInputRef.current.value = ''
		}
		setData((d) => ({
			...d,
			logoFile: null,
			logoPreviewUrl: null,
		}))
	}

	useEffect(() => () => revokeLogoPreviewUrl(), [])

	const uploadLogo = async () => {
		if (!data.logoFile) return {}

		const uploadUrl = await generateLogoUploadUrl()
		const result = await fetch(uploadUrl, {
			method: 'POST',
			headers: {
				'Content-Type': data.logoFile.type || 'application/octet-stream',
			},
			body: data.logoFile,
		})

		if (!result.ok) {
			throw new Error(LOGO_UPLOAD_ERROR)
		}

		const { storageId } = (await result.json()) as {
			storageId: Id<'_storage'>
		}

		return {
			logoFileName: data.logoFile.name,
			logoStorageId: storageId,
		}
	}

	const getAgencyRegistrationInput = (
		branding?: Partial<AgencyRegistrationInput>
	): AgencyRegistrationInput => ({
		name: data.agencyName.trim(),
		website: normalizeOptionalValue(data.website),
		phone: normalizeOptionalValue(data.phone),
		brandColor: normalizeOptionalValue(data.brandColor.toUpperCase()),
		...branding,
		street: data.street.trim(),
		number: data.number.trim(),
		zip: data.zip.trim(),
		city: data.city.trim(),
		country: data.country.trim(),
		accessCode: data.accessCode.trim().toUpperCase(),
	})

	const completeRegistration = useCallback(
		async (agency: AgencyRegistrationInput) => {
			if (isCompletingRegistrationRef.current) return

			isCompletingRegistrationRef.current = true
			setSubmitting(true)
			setSubmitError(null)

			try {
				await registerAgency(agency)
				try {
					await signIn('resend', {
						email: data.email.trim(),
						redirectTo: '/',
					})
				} catch (err) {
					console.error('Email verification request failed', err)
				}
				setPendingAgency(null)
				router.push('/brands')
			} catch (err) {
				console.error('Agency registration failed', err)
				setPendingAgency(null)
				setSubmitError(getSignupErrorMessage(err))
				setSubmitting(false)
			} finally {
				isCompletingRegistrationRef.current = false
			}
		},
		[data.email, registerAgency, router, signIn]
	)

	useEffect(() => {
		if (!pendingAgency || isAuthLoading || !isAuthenticated) return

		const timeoutId = window.setTimeout(() => {
			void completeRegistration(pendingAgency)
		}, 0)

		return () => window.clearTimeout(timeoutId)
	}, [completeRegistration, isAuthenticated, isAuthLoading, pendingAgency])

	useEffect(() => {
		if (!pendingAgency || isAuthenticated || isAuthLoading) return

		const timeoutId = window.setTimeout(() => {
			setPendingAgency(null)
			setSubmitError(SESSION_TIMEOUT_ERROR)
			setSubmitting(false)
		}, 10000)

		return () => window.clearTimeout(timeoutId)
	}, [isAuthenticated, isAuthLoading, pendingAgency])

	const handleSubmit = async (skipBranding = false) => {
		if (!validateStep(3)) return
		if (!skipBranding && !validateStep(4)) return

		setSubmitting(true)
		setSubmitError(null)

		try {
			const branding = skipBranding
				? {
						brandColor: undefined,
						logoFileName: undefined,
						logoStorageId: undefined,
					}
				: await uploadLogo()
			const agency = getAgencyRegistrationInput(branding)
			const accessCodeStatus = await convex.query(
				api.agencies.validateAccessCode,
				{ accessCode: agency.accessCode }
			)

			if (!accessCodeStatus.isValid) {
				setSubmitError(accessCodeStatus.message ?? GENERIC_SIGNUP_ERROR)
				setSubmitting(false)
				return
			}

			const formData = new FormData()
			formData.set('flow', 'signUp')
			formData.set('email', data.email.trim())
			formData.set('password', data.password)
			formData.set('name', data.name.trim())
			const result = await signIn('password', formData)

			if (!result.signingIn) {
				throw new Error(GENERIC_SIGNUP_ERROR)
			}

			setPendingAgency(agency)

			if (isAuthenticated && !isAuthLoading) {
				await completeRegistration(agency)
			}
		} catch (err) {
			console.error('Account creation failed', err)
			setPendingAgency(null)
			setSubmitError(getSignupErrorMessage(err))
			setSubmitting(false)
		}
	}

	const current = STEPS.find((s) => s.id === step)!

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-white px-6 py-12 flex flex-col">
			<header className="flex items-center justify-between max-w-4xl mx-auto w-full mb-12">
				<Link href="/" className="flex items-center" aria-label="Smove home">
					<span
						className="block w-20 h-[15px] bg-cover"
						style={{ backgroundImage: `url(${SMOVE_LOGO})` }}
					/>
				</Link>
				<p className="text-sm text-gray-500">
					Already have an account?{' '}
					<Link
						href="/login"
						className="text-gray-900 font-medium underline underline-offset-4 hover:no-underline"
					>
						Sign in
					</Link>
				</p>
			</header>

			<main className="flex-1 flex flex-col items-center max-w-xl mx-auto w-full">
				<StepDots current={step} />

				<motion.h1
					key={current.headline}
					className="text-3xl md:text-4xl text-gray-900 mb-2 text-center"
					style={{ letterSpacing: '-0.05em', lineHeight: 1.1 }}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					{current.headline}
				</motion.h1>
				<p className="text-sm text-gray-500 mb-8 text-center">
					Step {step} of {STEPS.length}
				</p>

				<div className="w-full bg-white border border-gray-200 rounded-3xl p-7 shadow-sm overflow-visible">
					<motion.div
						key={step}
						initial={{ opacity: 0, x: direction * 24 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
					>
						{step === 1 && (
							<div className="space-y-1">
								<Field label="Agency Name" error={errors.agencyName}>
									<TextInput
										value={data.agencyName}
										onChange={(v) => set('agencyName', v)}
										onBlur={() => blur('agencyName')}
										placeholder="Your agency name"
										autoComplete="organization"
										hasError={!!errors.agencyName}
									/>
								</Field>
								<Field
									label="Website"
									error={errors.website}
									hint="Optional · e.g. example.com"
								>
									<TextInput
										value={data.website}
										onChange={(v) => set('website', v)}
										onBlur={() => blur('website')}
										placeholder="https://example.com"
										autoComplete="url"
										inputMode="url"
										hasError={!!errors.website}
									/>
								</Field>
								<Field
									label="Phone"
									error={errors.phone}
									hint="Optional · international format"
								>
									<TextInput
										value={data.phone}
										onChange={(v) => set('phone', v)}
										onBlur={() => blur('phone')}
										placeholder="+49 123 456 789"
										type="tel"
										autoComplete="tel"
										inputMode="tel"
										hasError={!!errors.phone}
									/>
								</Field>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-1">
								<div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-4">
									<Field
										label="Street"
										error={errors.street}
										hint="Start typing and pick from suggestions"
									>
										<AddressAutocomplete
											value={data.street}
											onChange={(v) => set('street', v)}
											onSelect={applyAddress}
											placeholder="Start typing your address…"
											autoComplete="address-line1"
											error={errors.street}
										/>
									</Field>
									<Field label="Nr." error={errors.number}>
										<TextInput
											value={data.number}
											onChange={(v) => set('number', v)}
											onBlur={() => blur('number')}
											placeholder="12a"
											hasError={!!errors.number}
										/>
									</Field>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
									<Field label="Zip Code" error={errors.zip}>
										<TextInput
											value={data.zip}
											onChange={(v) => set('zip', v)}
											onBlur={() => blur('zip')}
											placeholder="10115"
											autoComplete="postal-code"
											hasError={!!errors.zip}
										/>
									</Field>
									<Field label="City" error={errors.city}>
										<TextInput
											value={data.city}
											onChange={(v) => set('city', v)}
											onBlur={() => blur('city')}
											placeholder="Berlin"
											autoComplete="address-level2"
											hasError={!!errors.city}
										/>
									</Field>
									<Field label="Country" error={errors.country}>
										<TextInput
											value={data.country}
											onChange={(v) => set('country', v)}
											onBlur={() => blur('country')}
											placeholder="Germany"
											autoComplete="country-name"
											hasError={!!errors.country}
										/>
									</Field>
								</div>
							</div>
						)}

						{step === 3 && (
							<div className="space-y-1">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Field label="Your Name" error={errors.name}>
										<TextInput
											value={data.name}
											onChange={(v) => set('name', v)}
											onBlur={() => blur('name')}
											placeholder="Jane Doe"
											autoComplete="name"
											hasError={!!errors.name}
										/>
									</Field>
									<Field
										label="Email"
										error={errors.email}
										hint="Used to login"
									>
										<TextInput
											value={data.email}
											onChange={(v) => set('email', v)}
											onBlur={() => blur('email')}
											placeholder="jane@agency.com"
											type="email"
											autoComplete="email"
											inputMode="email"
											hasError={!!errors.email}
										/>
									</Field>
								</div>
								<Field
									label="Password"
									error={errors.password}
									hint="8+ chars, mix letters and numbers"
								>
									<TextInput
										value={data.password}
										onChange={(v) => set('password', v)}
										onBlur={() => blur('password')}
										type="password"
										placeholder="••••••••"
										autoComplete="new-password"
										hasError={!!errors.password}
									/>
								</Field>
								<Field
									label="Access Code"
									error={errors.accessCode}
									hint="Provided by us. New? Contact info@smove.ai"
								>
									<TextInput
										value={data.accessCode}
										onChange={(v) => set('accessCode', v.toUpperCase())}
										onBlur={() => blur('accessCode')}
										placeholder="Your access code"
										hasError={!!errors.accessCode}
									/>
								</Field>
							</div>
						)}

						{step === 4 && (
							<div className="space-y-6">
								<div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
									<div className="flex items-start gap-3">
										<div
											className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm"
											aria-hidden="true"
										>
											<ImageIcon className="size-5" />
										</div>
										<div>
											<h2 className="text-base font-semibold text-gray-900">
												Make Smove feel like your agency
											</h2>
											<p className="mt-1 text-sm leading-6 text-gray-500">
												Add a transparent logo and your primary color. You can
												skip this and update it later.
											</p>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px]">
									<div>
										<span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
											Logo
										</span>
										<button
											type="button"
											onClick={() => logoInputRef.current?.click()}
											className="group flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-6 text-center transition-colors hover:border-primary hover:bg-blue-50/50"
										>
											{data.logoPreviewUrl ? (
												<div
													className="h-16 w-40 bg-contain bg-center bg-no-repeat"
													style={{
														backgroundImage: `url(${data.logoPreviewUrl})`,
													}}
													role="img"
													aria-label="Selected logo preview"
												/>
											) : (
												<div className="flex size-12 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition-colors group-hover:text-primary">
													<Upload className="size-5" />
												</div>
											)}
											<span className="mt-4 text-sm font-semibold text-gray-900">
												{data.logoFile ? data.logoFile.name : 'Upload logo'}
											</span>
											<span className="mt-1 text-xs text-gray-500">
												SVG, PNG, or WebP with transparent background
											</span>
										</button>
										<input
											ref={logoInputRef}
											type="file"
											accept="image/svg+xml,image/png,image/webp"
											className="sr-only"
											onChange={(e) =>
												handleLogoFileChange(e.target.files?.[0] ?? null)
											}
										/>
										{data.logoFile && (
											<button
												type="button"
												onClick={clearLogoFile}
												className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
											>
												<X className="size-3" />
												Remove logo
											</button>
										)}
									</div>

									<Field label="Primary Color" error={errors.brandColor}>
										<div className="flex items-center gap-2">
											<input
												type="color"
												value={
													HEX_COLOR_RE.test(data.brandColor)
														? data.brandColor
														: '#1541FC'
												}
												onChange={(e) =>
													set('brandColor', e.target.value.toUpperCase())
												}
												aria-label="Primary brand color"
												className="h-11 w-12 cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
											/>
											<TextInput
												value={data.brandColor}
												onChange={(v) => set('brandColor', v.toUpperCase())}
												onBlur={() => blur('brandColor')}
												placeholder="#1541FC"
												hasError={!!errors.brandColor}
											/>
										</div>
									</Field>
								</div>

								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{(['bg-white', 'bg-gray-950'] as const).map((previewBg) => (
										<div
											key={previewBg}
											className={`${previewBg} flex h-28 items-center justify-center rounded-2xl border border-gray-200 p-4`}
										>
											{data.logoPreviewUrl ? (
												<div
													className="h-12 w-36 bg-contain bg-center bg-no-repeat"
													style={{
														backgroundImage: `url(${data.logoPreviewUrl})`,
													}}
													role="img"
													aria-label="Logo contrast preview"
												/>
											) : (
												<div
													className="rounded-full px-4 py-2 text-sm font-bold text-white"
													style={{ backgroundColor: data.brandColor }}
												>
													{data.agencyName || 'Your agency'}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</motion.div>

					{submitError && (
						<motion.div
							className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
						>
							{submitError}
						</motion.div>
					)}

					<div className="mt-7 flex items-center justify-between gap-3">
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={goBack}
								disabled={step === 1 || submitting}
								className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
							>
								<ArrowLeft className="size-4" />
								Back
							</button>
							{step === STEPS.length && (
								<button
									type="button"
									onClick={() => void handleSubmit(true)}
									disabled={submitting}
									className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50"
								>
									Skip for now
								</button>
							)}
						</div>

						{step < STEPS.length ? (
							<button
								type="button"
								onClick={goNext}
								className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
							>
								Continue
								<ArrowRight className="size-4" />
							</button>
						) : (
							<button
								type="button"
								onClick={() => void handleSubmit()}
								disabled={submitting}
								className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
							>
								{submitting ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Finishing setup…
									</>
								) : (
									<>
										Finish setup
										<ArrowRight className="size-4" />
									</>
								)}
							</button>
						)}
					</div>
				</div>

				<Link
					href="/register"
					className="mt-6 text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1"
				>
					<ArrowLeft className="size-3" />
					Back to role selection
				</Link>
			</main>
		</div>
	)
}
