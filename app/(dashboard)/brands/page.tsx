'use client'

import { useMutation, useQuery } from 'convex/react'
import {
	CheckCircle2,
	LayoutGrid,
	LayoutList,
	Layers,
	Loader2,
	Palette,
	Plus,
	Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { BrandCard } from '@/components/dashboard/overview/brand-card'

import { api } from '../../../convex/_generated/api'

export default function DashboardHome() {
	const brands = useQuery(api.brands.listByAgency)
	const agency = useQuery(api.agencies.myAgency)
	const createBrand = useMutation(api.brands.create)
	const router = useRouter()
	const [isCreating, setIsCreating] = useState(false)
	const [view, setView] = useState<'grid' | 'list'>('grid')

	const handleAddBrand = async () => {
		if (isCreating) return
		setIsCreating(true)
		try {
			const brandId = await createBrand({ name: '' })
			router.push(`/brands/${brandId}/setup`)
			setIsCreating(false)
		} catch {
			setIsCreating(false)
		}
	}

	if (brands === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
		)
	}

	if (brands.length === 0) {
		return <EmptyState onAdd={handleAddBrand} isCreating={isCreating} />
	}

	const activeCount = brands.filter(
		(b) => b.onboardingCompletedAt && b.status === 'active',
	).length
	const draftCount = brands.filter((b) => !b.onboardingCompletedAt).length

	const tiles = [
		{
			label: 'Brands',
			value: brands.length,
			icon: <Layers className="size-4" strokeWidth={1.75} />,
		},
		{
			label: 'Active',
			value: activeCount,
			icon: <CheckCircle2 className="size-4" strokeWidth={1.75} />,
		},
		{
			label: 'In setup',
			value: draftCount,
			icon: <Sparkles className="size-4" strokeWidth={1.75} />,
		},
		{
			label: 'Approvals',
			value: 0,
			icon: <CheckCircle2 className="size-4" strokeWidth={1.75} />,
		},
	]

	return (
		<div className="mx-auto max-w-6xl p-6 lg:p-8">
			<div className="space-y-8">
				<header className="flex items-end justify-between gap-4">
					<div>
						<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
							Dashboard
						</p>
						<h1
							className="mt-1 text-2xl font-semibold text-foreground lg:text-3xl"
							style={{ letterSpacing: '-0.03em' }}
						>
							{agency?.name ?? 'Your agency'}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							An overview of every brand you manage.
						</p>
					</div>
					<button
						onClick={handleAddBrand}
						disabled={isCreating}
						className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
					>
						{isCreating ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Plus className="size-4" />
						)}
						New brand
					</button>
				</header>

				<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
					{tiles.map((tile) => (
						<div
							key={tile.label}
							className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
						>
							<div className="flex items-center justify-between">
								<p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
									{tile.label}
								</p>
								<span className="text-foreground/30">{tile.icon}</span>
							</div>
							<p
								className="mt-2 text-2xl font-semibold tabular-nums text-foreground"
								style={{ letterSpacing: '-0.03em' }}
							>
								{tile.value}
							</p>
						</div>
					))}
				</div>

			<section>
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
						Your brands
					</h2>
					<div className="flex items-center gap-0.5 rounded-lg border border-black/[0.06] bg-white p-0.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
						<button
							onClick={() => setView('grid')}
							aria-label="Grid view"
							className={cn(
								'flex size-6 items-center justify-center rounded-md transition-colors',
								view === 'grid'
									? 'bg-foreground/[0.06] text-foreground'
									: 'text-muted-foreground hover:text-foreground',
							)}
						>
							<LayoutGrid className="size-3.5" />
						</button>
						<button
							onClick={() => setView('list')}
							aria-label="List view"
							className={cn(
								'flex size-6 items-center justify-center rounded-md transition-colors',
								view === 'list'
									? 'bg-foreground/[0.06] text-foreground'
									: 'text-muted-foreground hover:text-foreground',
							)}
						>
							<LayoutList className="size-3.5" />
						</button>
					</div>
				</div>
				{view === 'grid' ? (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{brands.map((brand) => (
							<BrandCard key={brand._id} brand={brand} view="grid" />
						))}
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{brands.map((brand) => (
							<BrandCard key={brand._id} brand={brand} view="list" />
						))}
					</div>
				)}
			</section>

				<PendingApprovals />
			</div>
		</div>
	)
}

function PendingApprovals() {
	return (
		<section>
			<h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
				Pending approvals
			</h2>
			<div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.06] bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
				<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
					<CheckCircle2 className="size-5" strokeWidth={1.75} />
				</div>
				<h3 className="text-sm font-semibold text-foreground">
					You&apos;re all caught up
				</h3>
				<p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
					When your agents draft posts, they&apos;ll wait here for your
					approval before going live.
				</p>
			</div>
		</section>
	)
}

function EmptyState({
	onAdd,
	isCreating,
}: {
	onAdd: () => void
	isCreating: boolean
}) {
	return (
		<div className="flex h-full items-center justify-center p-6">
			<div className="w-full max-w-md text-center">
				<div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
					<Palette className="size-7 text-primary" />
				</div>
				<h1
					className="mb-2 text-2xl font-semibold text-foreground"
					style={{ letterSpacing: '-0.03em' }}
				>
					Welcome to Smove
				</h1>
				<p className="mb-8 text-sm text-muted-foreground">
					Add your first brand to start onboarding it with our guided wizard.
				</p>
				<button
					onClick={onAdd}
					disabled={isCreating}
					className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
				>
					{isCreating ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							Creating…
						</>
					) : (
						<>
							<Plus className="size-4" />
							Start a new brand
						</>
					)}
				</button>
			</div>
		</div>
	)
}
