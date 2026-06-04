'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

import {
	FacebookGlyph,
	InstagramGlyph,
	LinkedinGlyph,
} from '@/components/brand-setup/glyphs'
import { CHANNELS, CHANNEL_LABEL, type Channel } from '@/components/brand-setup/types'
import type { Id } from '@/convex/_generated/dataModel'
import { cn } from '@/lib/utils'

interface ChannelsSectionProps {
	brandId: Id<'brands'>
	channels: Channel[]
}

const glyphFor: Record<Channel, ReactNode> = {
	facebook: <FacebookGlyph className="size-4" />,
	instagram: <InstagramGlyph className="size-4" />,
	linkedin: <LinkedinGlyph className="size-4" />,
}

const accentFor: Record<Channel, string> = {
	facebook: 'text-[#1877F2]',
	instagram: 'text-[#E1306C]',
	linkedin: 'text-[#0A66C2]',
}

export function ChannelsSection({ brandId, channels }: ChannelsSectionProps) {
	const selected = new Set(channels)

	return (
		<section>
			<div className="mb-3 flex items-baseline justify-between">
				<h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
					Channels
				</h2>
				<Link
					href={`/brands/${brandId}/setup`}
					className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					Manage
				</Link>
			</div>
			<div className="grid gap-3 sm:grid-cols-3">
				{CHANNELS.map((channel) => {
					const isSelected = selected.has(channel)
					return (
						<div
							key={channel}
							className={cn(
								'flex items-center gap-3 rounded-2xl border p-4 transition-colors',
								isSelected
									? 'border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
									: 'border-dashed border-black/[0.08] bg-transparent',
							)}
						>
							<span
								className={cn(
									'flex size-9 shrink-0 items-center justify-center rounded-xl',
									isSelected
										? cn('bg-foreground/[0.04]', accentFor[channel])
										: 'bg-foreground/[0.03] text-muted-foreground/40',
								)}
							>
								{glyphFor[channel]}
							</span>
							<div className="min-w-0 flex-1">
								<p
									className={cn(
										'text-sm font-semibold',
										isSelected ? 'text-foreground' : 'text-muted-foreground',
									)}
								>
									{CHANNEL_LABEL[channel]}
								</p>
								{isSelected ? (
									<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
										<span className="size-1.5 rounded-full bg-emerald-500" />
										Connected
									</span>
								) : (
									<Link
										href={`/brands/${brandId}/setup`}
										className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
									>
										<Plus className="size-3" />
										Add channel
									</Link>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</section>
	)
}
