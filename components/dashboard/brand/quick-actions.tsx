'use client'

import { ArrowUpRight, LayoutGrid, Settings2, Users } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

import type { Id } from '@/convex/_generated/dataModel'

interface QuickActionsProps {
	brandId: Id<'brands'>
}

interface QuickAction {
	title: string
	description: string
	icon: ReactNode
	href: (brandId: Id<'brands'>) => string
}

const actions: QuickAction[] = [
	{
		title: 'Brand setup',
		description: 'Identity, voice & visuals',
		icon: <Settings2 className="size-[18px]" strokeWidth={1.75} />,
		href: (id) => `/brands/${id}/setup`,
	},
	{
		title: 'Personas',
		description: 'Who you speak to',
		icon: <Users className="size-[18px]" strokeWidth={1.75} />,
		href: (id) => `/brands/${id}/setup`,
	},
	{
		title: 'Content buckets',
		description: 'What you publish',
		icon: <LayoutGrid className="size-[18px]" strokeWidth={1.75} />,
		href: (id) => `/brands/${id}/setup`,
	},
]

export function QuickActions({ brandId }: QuickActionsProps) {
	return (
		<section>
			<div className="grid gap-3 sm:grid-cols-3">
				{actions.map((action) => (
					<Link
						key={action.title}
						href={action.href(brandId)}
						className="group flex items-center gap-3.5 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:border-black/10 hover:shadow-[0_4px_16px_rgba(16,24,40,0.06)]"
					>
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/70 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
							{action.icon}
						</span>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-semibold text-foreground">
								{action.title}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{action.description}
							</p>
						</div>
						<ArrowUpRight className="size-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground/60" />
					</Link>
				))}
			</div>
		</section>
	)
}
