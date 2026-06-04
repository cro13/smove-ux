'use client'

import { useMutation } from 'convex/react'
import { motion } from 'framer-motion'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

const MAX_SIZE = 2 * 1024 * 1024
const IMAGE_TYPES = new Set([
	'image/png',
	'image/jpeg',
	'image/jpg',
	'image/svg+xml',
	'image/webp',
])

type UploadZoneProps = {
	label: string
	helper?: string
	currentUrl?: string | null
	currentStorageId?: Id<'_storage'> | null
	onUploaded: (storageId: Id<'_storage'>, fileName: string) => void
	onRemove?: () => void
	background?: 'light' | 'dark'
	aspectRatio?: 'square' | 'wide'
}

export function UploadZone({
	label,
	helper,
	currentUrl,
	onUploaded,
	onRemove,
	background = 'light',
	aspectRatio = 'square',
}: UploadZoneProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [dragging, setDragging] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const generateUrl = useMutation(api.brands.generateBrandUploadUrl)

	const handleFile = async (file: File) => {
		setError(null)
		if (!IMAGE_TYPES.has(file.type)) {
			setError('Use PNG, JPG, SVG, or WebP.')
			return
		}
		if (file.size > MAX_SIZE) {
			setError('Max 2 MB.')
			return
		}
		setUploading(true)
		try {
			const uploadUrl = await generateUrl()
			const res = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': file.type },
				body: file,
			})
			if (!res.ok) throw new Error('Upload failed')
			const { storageId } = (await res.json()) as { storageId: Id<'_storage'> }
			onUploaded(storageId, file.name)
		} catch {
			setError('Upload failed. Try again.')
		} finally {
			setUploading(false)
		}
	}

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault()
		setDragging(false)
		const file = e.dataTransfer.files?.[0]
		if (file) await handleFile(file)
	}

	const dimensions =
		aspectRatio === 'wide'
			? 'h-32 sm:h-36'
			: 'aspect-square min-h-32'

	return (
		<div>
			<motion.div
				onDragOver={(e) => {
					e.preventDefault()
					setDragging(true)
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={handleDrop}
				onClick={() => inputRef.current?.click()}
				whileHover={{ scale: 1.005 }}
				className={cn(
					'group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition-all',
					dimensions,
					background === 'dark'
						? 'border-gray-700 bg-gray-900'
						: 'border-gray-200 bg-blue-50/30 hover:bg-blue-50/60',
					dragging && 'border-primary bg-blue-100/50 scale-[1.01]',
				)}
			>
				{currentUrl ? (
					<>
						<div className="relative h-full w-full">
							<Image
								src={currentUrl}
								alt={label}
								fill
								className="object-contain p-2"
								unoptimized
							/>
						</div>
						{onRemove && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation()
									onRemove()
								}}
								className="absolute top-1.5 right-1.5 rounded-full bg-white/90 p-1 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-red-500"
								aria-label={`Remove ${label}`}
							>
								<X className="size-3.5" />
							</button>
						)}
					</>
				) : uploading ? (
					<Loader2 className="size-6 animate-spin text-primary" />
				) : (
					<>
						<div
							className={cn(
								'flex size-9 items-center justify-center rounded-full transition-colors',
								background === 'dark'
									? 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'
									: 'bg-white text-gray-400 shadow-sm group-hover:text-primary',
							)}
						>
							<Upload className="size-4" />
						</div>
						<p
							className={cn(
								'mt-2 text-xs font-semibold',
								background === 'dark' ? 'text-white' : 'text-gray-900',
							)}
						>
							{label}
						</p>
						{helper && (
							<p
								className={cn(
									'mt-0.5 text-[10px]',
									background === 'dark' ? 'text-white/50' : 'text-gray-400',
								)}
							>
								{helper}
							</p>
						)}
					</>
				)}
			</motion.div>
			<input
				ref={inputRef}
				type="file"
				accept="image/png,image/jpeg,image/svg+xml,image/webp"
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
