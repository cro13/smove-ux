'use client'

import { useAction, useMutation } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, FileText, Globe, Loader2, PenLine } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

import { TextInput } from './fields'

const MAX_PDF_SIZE = 25 * 1024 * 1024

const BRANDBOOK_STEPS = [
	'Reading brand book…',
	'Extracting brand essence…',
	'Picking up your colors…',
	'Detecting typography…',
	'Capturing tone of voice…',
	'Filling in your setup…',
]

type Props = {
	brandId: Id<'brands'>
	brandName: string
	onImported: () => void
	onScratch: () => void
}

type Mode = 'idle' | 'website' | 'brandbook'

export function ImportStart({
	brandId,
	brandName,
	onImported,
	onScratch,
}: Props) {
	const importFromWebsite = useAction(api.brandImport.importFromWebsite)
	const importFromBrandBook = useAction(api.brandImport.importFromBrandBook)
	const generateUploadUrl = useMutation(api.brands.generateBrandUploadUrl)

	const [domain, setDomain] = useState('')
	const [busy, setBusy] = useState<Mode>('idle')
	const [error, setError] = useState<string | null>(null)
	const [stepIndex, setStepIndex] = useState(0)
	const fileRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (busy !== 'brandbook') {
			setStepIndex(0)
			return
		}
		const id = setInterval(
			() => setStepIndex((i) => (i + 1) % BRANDBOOK_STEPS.length),
			1800,
		)
		return () => clearInterval(id)
	}, [busy])

	const handleWebsite = async () => {
		if (!domain.trim() || busy !== 'idle') return
		setError(null)
		setBusy('website')
		try {
			await importFromWebsite({ brandId, domain })
			onImported()
		} catch {
			setError('We could not import that website. Try another or start manually.')
			setBusy('idle')
		}
	}

	const handleFile = async (file: File) => {
		if (busy !== 'idle') return
		setError(null)
		if (file.type !== 'application/pdf') {
			setError('Please upload a PDF brand book.')
			return
		}
		if (file.size > MAX_PDF_SIZE) {
			setError('PDF must be under 25 MB.')
			return
		}
		setBusy('brandbook')
		try {
			const uploadUrl = await generateUploadUrl()
			const res = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': file.type },
				body: file,
			})
			if (!res.ok) throw new Error('upload failed')
			const { storageId } = (await res.json()) as {
				storageId: Id<'_storage'>
			}
			await importFromBrandBook({ brandId, storageId })
			onImported()
		} catch {
			setError('We could not read that brand book. Try again or start manually.')
			setBusy('idle')
		}
	}

	return (
		<div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-6 py-12">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center"
			>
				<p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
					New brand
				</p>
				<h1
					className="mt-1 text-2xl text-gray-900 sm:text-3xl"
					style={{ letterSpacing: '-0.04em' }}
				>
					Set up {brandName}
				</h1>
				<p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
					Start with an import to prefill everything, then review. Or build it
					step by step.
				</p>
			</motion.div>

			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<OptionCard
					icon={<Globe className="size-5" />}
					title="Import from website"
					description="We’ll pull the logo, colors, fonts and basics from a domain."
					busy={busy === 'brandbook'}
				>
					<div className="mt-4 space-y-2">
						<TextInput
							value={domain}
							onChange={setDomain}
							placeholder="yourbrand.com"
							inputMode="url"
							disabled={busy !== 'idle'}
						/>
						<button
							type="button"
							onClick={handleWebsite}
							disabled={!domain.trim() || busy !== 'idle'}
							className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{busy === 'website' ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Importing…
								</>
							) : (
								<>
									Import
									<ArrowRight className="size-4" />
								</>
							)}
						</button>
					</div>
				</OptionCard>

				<OptionCard
					icon={<FileText className="size-5" />}
					title="Upload a brand book"
					description="Drop a PDF and we’ll extract voice, values, colors and more."
					busy={busy === 'website'}
					onClick={() => busy === 'idle' && fileRef.current?.click()}
				>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							fileRef.current?.click()
						}}
						disabled={busy !== 'idle'}
						className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{busy === 'brandbook' ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								<AnimatePresence mode="wait">
									<motion.span
										key={stepIndex}
										initial={{ opacity: 0, y: 4 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -4 }}
										transition={{ duration: 0.25 }}
									>
										{BRANDBOOK_STEPS[stepIndex]}
									</motion.span>
								</AnimatePresence>
							</>
						) : (
							'Choose PDF'
						)}
					</button>
					<input
						ref={fileRef}
						type="file"
						accept="application/pdf"
						className="sr-only"
						onChange={(e) => {
							const file = e.target.files?.[0]
							if (file) void handleFile(file)
						}}
					/>
				</OptionCard>
			</div>

			{error && (
				<motion.p
					initial={{ opacity: 0, y: -4 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700"
				>
					{error}
				</motion.p>
			)}

			<button
				type="button"
				onClick={onScratch}
				disabled={busy !== 'idle'}
				className="mx-auto mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-50"
			>
				<PenLine className="size-4" />
				Start from scratch instead
			</button>
		</div>
	)
}

function OptionCard({
	icon,
	title,
	description,
	children,
	busy,
	onClick,
}: {
	icon: React.ReactNode
	title: string
	description: string
	children: React.ReactNode
	busy?: boolean
	onClick?: () => void
}) {
	return (
		<div
			className={cn(
				'rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-opacity',
				busy && 'pointer-events-none opacity-50',
			)}
			onClick={onClick}
		>
			<span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
				{icon}
			</span>
			<h2 className="mt-3 text-base font-semibold text-gray-900">{title}</h2>
			<p className="mt-1 text-xs leading-relaxed text-gray-500">
				{description}
			</p>
			{children}
		</div>
	)
}
