'use client'

import { useMutation } from 'convex/react'
import { ArrowRight, ArrowUpRight, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

import {
	FacebookGlyph,
	InstagramGlyph,
	LinkedinGlyph,
} from '@/components/brand-setup/glyphs'
import {
	CHANNEL_LABEL,
	STEPS,
	type Channel,
} from '@/components/brand-setup/types'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

interface BrandCardProps {
	brand: Doc<'brands'>
	view?: 'grid' | 'list'
}

const glyphFor: Record<Channel, ReactNode> = {
	facebook: <FacebookGlyph className="size-3.5" />,
	instagram: <InstagramGlyph className="size-3.5" />,
	linkedin: <LinkedinGlyph className="size-3.5" />,
}

const statusDot: Record<Doc<'brands'>['status'], string> = {
	active: 'bg-emerald-500',
	paused: 'bg-amber-400',
	inactive: 'bg-gray-300',
}

export function BrandCard({ brand, view = 'grid' }: BrandCardProps) {
	const isDraft = !brand.onboardingCompletedAt
	const displayName = brand.name || 'Untitled brand'
	const initial = displayName.charAt(0).toUpperCase()
	const accent = brand.visualIdentity?.primaryColors?.[0]
	const channels = (brand.channels ?? []) as Channel[]
	const step = Math.max(1, Math.min(STEPS.length, brand.onboardingStep ?? 1))
	const progress = ((step - 1) / (STEPS.length - 1)) * 100
	const removeBrand = useMutation(api.brands.remove)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const handleConfirmDelete = async () => {
		setIsDeleting(true)
		try {
			await removeBrand({ brandId: brand._id })
		} finally {
			setIsDeleting(false)
			setConfirmOpen(false)
		}
	}

	const brandMenu = (
		<DropdownMenu>
			<DropdownMenuTrigger
				onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
				aria-label="Brand options"
				className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/40 outline-none transition-colors hover:bg-foreground/[0.05] hover:text-foreground/60"
			>
				<MoreHorizontal className="size-3.5" />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem
					destructive
					onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmOpen(true) }}
				>
					<Trash2 className="size-3.5" strokeWidth={1.75} />
					Delete brand
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)

	const confirmDialog = (
		<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
						<Trash2 className="size-5" strokeWidth={1.75} />
					</div>
					<DialogTitle>Delete {displayName}?</DialogTitle>
					<DialogDescription>
						This will permanently remove the brand and all its data. This
						action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<button
						onClick={() => setConfirmOpen(false)}
						disabled={isDeleting}
						className="inline-flex h-8 items-center justify-center rounded-lg border border-black/[0.08] bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.04] disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={handleConfirmDelete}
						disabled={isDeleting}
						className="inline-flex h-8 items-center justify-center rounded-lg bg-red-500 px-3 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
					>
						{isDeleting ? 'Deleting…' : 'Delete brand'}
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)

	if (view === 'list') {
		return (
			<>
				<Link
					href={
						isDraft ? `/brands/${brand._id}/setup` : `/brands/${brand._id}`
					}
					className="group flex items-center gap-4 rounded-xl border border-black/[0.06] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:border-black/10 hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)]"
				>
					<span
						className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
						style={{ backgroundColor: accent ?? '#1A1A1A' }}
					>
						{initial}
					</span>

					<div className="min-w-0 flex-1">
						<p
							className={cn(
								'truncate text-sm font-semibold leading-none',
								brand.name ? 'text-foreground' : 'italic text-foreground/50',
							)}
						>
							{displayName}
						</p>
						<span className="mt-0.5 block text-xs">
							{isDraft ? (
								<span className="font-medium text-primary">
									In setup · step {step} of {STEPS.length}
								</span>
							) : (
								<span className="inline-flex items-center gap-1.5 capitalize text-muted-foreground">
									<span className={cn('size-1.5 rounded-full', statusDot[brand.status])} />
									{brand.status}
								</span>
							)}
						</span>
					</div>

					{isDraft ? (
						<div className="w-24 shrink-0">
							<div className="h-1 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
								<div
									className="h-full rounded-full bg-primary"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					) : (
						<div className="flex shrink-0 items-center gap-1">
							{channels.length > 0 ? (
								channels.map((channel) => (
									<span
										key={channel}
										className="flex size-6 items-center justify-center rounded-md bg-foreground/[0.04] text-foreground/55"
										title={CHANNEL_LABEL[channel]}
									>
										{glyphFor[channel]}
									</span>
								))
							) : (
								<span className="text-xs text-muted-foreground/50">—</span>
							)}
						</div>
					)}

					<span className="shrink-0 text-muted-foreground/30 transition-all group-hover:text-foreground/60">
						{isDraft ? (
							<ArrowRight className="size-4 group-hover:translate-x-0.5" />
						) : (
							<ArrowUpRight className="size-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
						)}
					</span>

					{brandMenu}
				</Link>
				{confirmDialog}
			</>
		)
	}

	const avatarBg = accent ? `${accent}18` : 'rgb(37 99 235 / 0.09)'
	const avatarColor = accent ?? '#2563EB'

	return (
		<>
			<Link
				href={
					isDraft ? `/brands/${brand._id}/setup` : `/brands/${brand._id}`
				}
				className="group flex flex-col rounded-[1.75rem] bg-white p-4 shadow-[0_2px_16px_rgba(16,24,40,0.07)] transition-all hover:shadow-[0_8px_28px_rgba(16,24,40,0.11)]"
			>
				<div className="flex items-start justify-between">
					<span
						className="flex size-[3.75rem] shrink-0 items-center justify-center rounded-2xl text-2xl font-semibold"
						style={{ backgroundColor: avatarBg, color: avatarColor }}
					>
						{initial}
					</span>
					{brandMenu}
				</div>

				<p
					className={cn(
						'mt-4 truncate text-sm font-semibold',
						brand.name ? 'text-foreground' : 'italic text-foreground/40',
					)}
				>
					{displayName}
				</p>

				<div className="mt-auto pt-5">
					{isDraft ? (
						<>
							<span className="mb-1.5 block text-[11px] font-medium text-primary">
								Step {step} of {STEPS.length}
							</span>
							<div className="h-1 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
								<div
									className="h-full rounded-full bg-primary"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</>
					) : (
						<div className="flex items-center gap-1.5">
							{channels.length > 0 ? (
								channels.map((channel) => (
									<span
										key={channel}
										className="flex size-7 items-center justify-center rounded-lg bg-foreground/[0.04] text-foreground/55"
										title={CHANNEL_LABEL[channel]}
									>
										{glyphFor[channel]}
									</span>
								))
							) : (
								<span className="inline-flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
									<span className={cn('size-1.5 rounded-full', statusDot[brand.status])} />
									{brand.status}
								</span>
							)}
						</div>
					)}
				</div>
			</Link>
			{confirmDialog}
		</>
	)
}
