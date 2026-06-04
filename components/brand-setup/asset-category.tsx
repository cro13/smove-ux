'use client'

import { useMutation } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

const MAX_SIZE = 5 * 1024 * 1024
const IMAGE_TYPES = new Set([
	'image/png',
	'image/jpeg',
	'image/jpg',
	'image/webp',
])

type Props = {
	label: string
	sublabel: string
	storageIds: Id<'_storage'>[]
	urls: (string | null)[]
	onChange: (storageIds: Id<'_storage'>[]) => void
	max?: number
}

export function AssetCategory({
	label,
	sublabel,
	storageIds,
	urls,
	onChange,
	max = 20,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [uploading, setUploading] = useState(false)
	const [dragging, setDragging] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const generateUrl = useMutation(api.brands.generateBrandUploadUrl)

	const isFull = storageIds.length >= max

	const handleFiles = async (files: FileList) => {
		setError(null)
		const picked = Array.from(files).slice(0, max - storageIds.length)
		if (picked.length === 0) return

		for (const file of picked) {
			if (!IMAGE_TYPES.has(file.type)) {
				setError('Use PNG, JPG, or WebP.')
				return
			}
			if (file.size > MAX_SIZE) {
				setError('Each image must be under 5 MB.')
				return
			}
		}

		setUploading(true)
		try {
			const newIds: Id<'_storage'>[] = []
			for (const file of picked) {
				const uploadUrl = await generateUrl()
				const res = await fetch(uploadUrl, {
					method: 'POST',
					headers: { 'Content-Type': file.type },
					body: file,
				})
				if (!res.ok) throw new Error('Upload failed')
				const { storageId } = (await res.json()) as {
					storageId: Id<'_storage'>
				}
				newIds.push(storageId)
			}
			onChange([...storageIds, ...newIds])
		} catch {
			setError('Upload failed. Try another file.')
		} finally {
			setUploading(false)
		}
	}

	const handleRemove = (idx: number) =>
		onChange(storageIds.filter((_, i) => i !== idx))

	return (
		<div>
			<motion.div
				onClick={() => !isFull && inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault()
					if (!isFull) setDragging(true)
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault()
					setDragging(false)
					if (!isFull && e.dataTransfer.files?.length) {
						void handleFiles(e.dataTransfer.files)
					}
				}}
				whileHover={isFull ? undefined : { scale: 1.005 }}
				className={cn(
					'flex h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors',
					isFull
						? 'cursor-not-allowed border-gray-200 bg-gray-50'
						: 'cursor-pointer border-gray-200 bg-blue-50/30 hover:bg-blue-50/60',
					dragging && 'border-primary bg-blue-100/50',
				)}
			>
				{uploading ? (
					<Loader2 className="size-5 animate-spin text-primary" />
				) : (
					<div className="flex size-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
						<Upload className="size-4" />
					</div>
				)}
			</motion.div>
			<p className="mt-3 text-center text-sm font-semibold text-gray-900">
				{label}
			</p>
			<p className="text-center text-[11px] text-gray-400">{sublabel}</p>

			{storageIds.length > 0 && (
				<div className="mt-3 grid grid-cols-3 gap-2">
					<AnimatePresence initial={false}>
						{storageIds.map((id, idx) => {
							const url = urls[idx] ?? null
							return (
								<motion.div
									key={id}
									layout
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
								>
									{url ? (
										<Image
											src={url}
											alt={`${label} ${idx + 1}`}
											fill
											className="object-cover"
											unoptimized
										/>
									) : (
										<div className="flex h-full items-center justify-center">
											<Loader2 className="size-4 animate-spin text-gray-300" />
										</div>
									)}
									<button
										type="button"
										onClick={() => handleRemove(idx)}
										className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
										aria-label={`Remove ${label} ${idx + 1}`}
									>
										<X className="size-3" />
									</button>
								</motion.div>
							)
						})}
					</AnimatePresence>
				</div>
			)}

			{error && (
				<p className="mt-2 text-center text-xs text-red-500">{error}</p>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="image/png,image/jpeg,image/webp"
				multiple
				className="sr-only"
				onChange={(e) => {
					if (e.target.files && e.target.files.length > 0) {
						void handleFiles(e.target.files)
						e.target.value = ''
					}
				}}
			/>
		</div>
	)
}
