'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

interface BrandHeaderProps {
	name: string
	status: 'active' | 'inactive' | 'paused'
}

const statusConfig = {
	active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
	inactive: { label: 'Inactive', className: 'bg-gray-50 text-gray-600 border-gray-200' },
	paused: { label: 'Paused', className: 'bg-amber-50 text-amber-700 border-amber-200' },
} as const

export function BrandHeader({ name, status }: BrandHeaderProps) {
	const config = statusConfig[status]

	return (
		<div className="flex items-center gap-4">
			<Link
				href="/brands"
				className="flex size-9 items-center justify-center rounded-lg border border-border bg-white text-foreground/60 shadow-sm transition-colors hover:bg-accent hover:text-foreground"
				aria-label="Back to dashboard"
			>
				<ArrowLeft className="size-4" />
			</Link>
			<h1
				className="text-xl font-semibold text-foreground lg:text-2xl"
				style={{ letterSpacing: '-0.03em' }}
			>
				{name}
			</h1>
			<span
				className={cn(
					'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
					config.className,
				)}
			>
				<span
					className={cn(
						'size-1.5 rounded-full',
						status === 'active' && 'bg-emerald-500',
						status === 'inactive' && 'bg-gray-400',
						status === 'paused' && 'bg-amber-500',
					)}
				/>
				{config.label}
			</span>
		</div>
	)
}
