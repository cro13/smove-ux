'use client'

import { useMutation } from 'convex/react'
import { motion } from 'framer-motion'
import { Check, Loader2, Search, Type, Upload, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

import { GOOGLE_FONTS } from './google-fonts'

const MAX_SIZE = 5 * 1024 * 1024
const FONT_EXT = /\.(ttf|otf|woff2?)$/i
const MAX_SUGGESTIONS = 8

type FontMode = 'google' | 'file'

type Props = {
	label: string
	hint?: string
	currentUrl?: string | null
	currentName?: string
	onUploaded: (storageId: Id<'_storage'>, fileName: string) => void
	onGoogleFont: (name: string | undefined) => void
	onRemove?: () => void
}

const loadGoogleFont = (family: string) => {
	const cleaned = family.trim()
	if (!cleaned) return
	const id = `google-font-${cleaned.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
	if (document.getElementById(id)) return
	const link = document.createElement('link')
	link.id = id
	link.rel = 'stylesheet'
	link.href = `https://fonts.googleapis.com/css2?family=${cleaned.replace(
		/\s+/g,
		'+',
	)}:wght@400;500;700&display=swap`
	document.head.appendChild(link)
}

export function FontUpload({
	label,
	hint,
	currentUrl,
	currentName,
	onUploaded,
	onGoogleFont,
	onRemove,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null)
	const generateUrl = useMutation(api.brands.generateBrandUploadUrl)
	const uid = useId()
	const fontFamily = useMemo(
		() => `brand-font-${uid.replace(/[^a-zA-Z0-9]/g, '')}`,
		[uid],
	)

	const hasFile = Boolean(currentUrl)
	const [mode, setMode] = useState<FontMode>(hasFile ? 'file' : 'google')
	const [googleName, setGoogleName] = useState(hasFile ? '' : currentName ?? '')
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [open, setOpen] = useState(false)
	const [highlighted, setHighlighted] = useState(0)

	const onGoogleFontRef = useRef(onGoogleFont)
	useEffect(() => {
		onGoogleFontRef.current = onGoogleFont
	})

	const query = googleName.trim().toLowerCase()
	const suggestions = useMemo(() => {
		const base = query
			? GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(query))
			: GOOGLE_FONTS
		return base.slice(0, MAX_SUGGESTIONS)
	}, [query])

	useEffect(() => {
		if (!currentUrl) return
		const styleId = `style-${fontFamily}`
		document.getElementById(styleId)?.remove()
		const style = document.createElement('style')
		style.id = styleId
		style.textContent = `@font-face { font-family: '${fontFamily}'; src: url('${currentUrl}'); font-display: swap; }`
		document.head.appendChild(style)
		return () => {
			document.getElementById(styleId)?.remove()
		}
	}, [currentUrl, fontFamily])

	useEffect(() => {
		if (mode !== 'google') return
		const family = googleName.trim()
		const id = setTimeout(() => {
			loadGoogleFont(family)
			onGoogleFontRef.current(family || undefined)
		}, 400)
		return () => clearTimeout(id)
	}, [mode, googleName])

	useEffect(() => {
		if (mode !== 'google' || !open) return
		suggestions.forEach(loadGoogleFont)
	}, [mode, open, suggestions])

	const handleSelect = (family: string) => {
		setGoogleName(family)
		setOpen(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!open || suggestions.length === 0) return
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setHighlighted((h) => Math.min(suggestions.length - 1, h + 1))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setHighlighted((h) => Math.max(0, h - 1))
		} else if (e.key === 'Enter') {
			e.preventDefault()
			handleSelect(suggestions[highlighted])
		} else if (e.key === 'Escape') {
			setOpen(false)
		}
	}

	const handleFile = async (file: File) => {
		setError(null)
		if (!FONT_EXT.test(file.name)) {
			setError('Use .ttf, .otf, .woff, or .woff2')
			return
		}
		if (file.size > MAX_SIZE) {
			setError('Max 5 MB.')
			return
		}
		setUploading(true)
		try {
			const uploadUrl = await generateUrl()
			const res = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': file.type || 'font/woff2' },
				body: file,
			})
			if (!res.ok) throw new Error('Upload failed')
			const { storageId } = (await res.json()) as { storageId: Id<'_storage'> }
			const cleanName = file.name.replace(FONT_EXT, '')
			onUploaded(storageId, cleanName)
		} catch {
			setError('Upload failed. Try again.')
		} finally {
			setUploading(false)
		}
	}

	const switchMode = (next: FontMode) => {
		setMode(next)
		if (next === 'google') onGoogleFont(googleName.trim() || undefined)
	}

	const googlePreview = googleName.trim()
	const isActive = hasFile || (mode === 'google' && Boolean(googlePreview))

	return (
		<div
			className={cn(
				'rounded-2xl border border-gray-200 bg-white p-4 transition-colors',
				isActive && 'border-primary/40 bg-primary/[0.02]',
			)}
		>
			<div className="flex items-center gap-3">
				<div
					className={cn(
						'flex size-9 shrink-0 items-center justify-center rounded-xl',
						isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400',
					)}
				>
					<Type className="size-4" />
				</div>
				<p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
					{label}
				</p>
				<div className="flex shrink-0 rounded-lg bg-gray-100 p-0.5">
					{(['google', 'file'] as const).map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => switchMode(m)}
							className={cn(
								'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
								mode === m
									? 'bg-white text-gray-900 shadow-sm'
									: 'text-gray-500 hover:text-gray-700',
							)}
						>
							{m === 'google' ? 'Google Font' : 'Upload'}
						</button>
					))}
				</div>
			</div>

			{hint && <p className="mt-2 text-[11px] text-gray-500">{hint}</p>}

			{mode === 'google' && (
				<div className="mt-3">
					<div className="relative">
						<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={googleName}
							onChange={(e) => {
								setGoogleName(e.target.value)
								setOpen(true)
								setHighlighted(0)
							}}
							onFocus={() => setOpen(true)}
							onBlur={() => setTimeout(() => setOpen(false), 150)}
							onKeyDown={handleKeyDown}
							placeholder="Search Google Fonts…"
							aria-autocomplete="list"
							aria-expanded={open}
							className="h-10 w-full rounded-xl border border-gray-200 pr-3 pl-9 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
						/>
						{open && suggestions.length > 0 && (
							<ul className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
								{suggestions.map((family, i) => (
									<li key={family}>
										<button
											type="button"
											onMouseDown={(e) => {
												e.preventDefault()
												handleSelect(family)
											}}
											onMouseEnter={() => setHighlighted(i)}
											className={cn(
												'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-base text-gray-900',
												i === highlighted && 'bg-primary/5',
											)}
											style={{ fontFamily: `'${family}', sans-serif` }}
										>
											<span className="truncate">{family}</span>
											{googlePreview === family && (
												<Check className="size-4 shrink-0 text-primary" />
											)}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
					{googlePreview && (
						<motion.div
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
						>
							<p
								className="truncate text-2xl text-gray-900"
								style={{
									fontFamily: `'${googlePreview}', sans-serif`,
									letterSpacing: '-0.02em',
								}}
							>
								{googlePreview}
							</p>
							<p
								className="mt-0.5 text-xs text-gray-500"
								style={{ fontFamily: `'${googlePreview}', sans-serif` }}
							>
								The quick brown fox jumps over the lazy dog
							</p>
						</motion.div>
					)}
				</div>
			)}

			{mode === 'file' && (
				<div className="mt-3">
					{!hasFile && !uploading && (
						<button
							type="button"
							onClick={() => inputRef.current?.click()}
							className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
						>
							<Upload className="size-3" />
							Upload font file
						</button>
					)}
					{uploading && <Loader2 className="size-4 animate-spin text-primary" />}
					{hasFile && (
						<motion.div
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							className="rounded-xl border border-gray-100 bg-white px-4 py-3"
						>
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<p
										className="truncate text-2xl text-gray-900"
										style={{ fontFamily, letterSpacing: '-0.02em' }}
									>
										{currentName || 'Aa'}
									</p>
									<p className="mt-0.5 text-xs text-gray-500" style={{ fontFamily }}>
										The quick brown fox jumps over the lazy dog
									</p>
								</div>
								{onRemove && (
									<button
										type="button"
										onClick={onRemove}
										className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
										aria-label={`Remove ${label}`}
									>
										<X className="size-3.5" />
									</button>
								)}
							</div>
						</motion.div>
					)}
				</div>
			)}

			<input
				ref={inputRef}
				type="file"
				accept=".ttf,.otf,.woff,.woff2"
				className="sr-only"
				onChange={(e) => {
					const file = e.target.files?.[0]
					if (file) void handleFile(file)
				}}
			/>
			{error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
		</div>
	)
}
