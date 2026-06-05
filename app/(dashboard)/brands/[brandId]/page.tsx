'use client'

import { useQuery } from 'convex/react'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { AnalyticsStrip } from '@/components/dashboard/brand/analytics-strip'
import { BrandHeader } from '@/components/dashboard/brand/brand-header'
import { ChannelsSection } from '@/components/dashboard/brand/channels-section'
import { InsightsPanel } from '@/components/dashboard/brand/insights-panel'
import { QuickActions } from '@/components/dashboard/brand/quick-actions'
import { SubmissionsSection } from '@/components/dashboard/brand/submissions-section'
import { STEPS, type Channel } from '@/components/brand-setup/types'

import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

export default function BrandDetailPage() {
	const params = useParams()
	const router = useRouter()
	const brandId = params.brandId as Id<'brands'>

	const brand = useQuery(api.brands.getById, { brandId })

	useEffect(() => {
		if (brand === null) {
			router.replace('/brands')
		}
	}, [brand, router])

	if (brand === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
		)
	}

	if (brand === null) return null

	const isOnboardingComplete = Boolean(brand.onboardingCompletedAt)
	const currentStep = Math.max(1, Math.min(STEPS.length, brand.onboardingStep ?? 1))
	const displayName = brand.name || 'Untitled brand'
	const channels = (brand.channels ?? []) as Channel[]

	return (
		<div className="mx-auto max-w-6xl p-6 lg:p-8">
			<div className="space-y-7">
				<BrandHeader name={displayName} status={brand.status} />

				{!isOnboardingComplete && (
					<ResumeSetupBanner
						brandId={brand._id}
						currentStep={currentStep}
						totalSteps={STEPS.length}
					/>
				)}

				<ChannelsSection brandId={brand._id} channels={channels} />
				<QuickActions brandId={brand._id} />
				<AnalyticsStrip />
				<InsightsPanel />
				<SubmissionsSection
					brandId={brand._id}
					hasTemplate={!!brand.postTemplate?.interpretation}
					hasStyleAnalysis={!!brand.imageStyleAnalysis}
				/>
			</div>
		</div>
	)
}

type ResumeSetupBannerProps = {
	brandId: Id<'brands'>
	currentStep: number
	totalSteps: number
}

function ResumeSetupBanner({
	brandId,
	currentStep,
	totalSteps,
}: ResumeSetupBannerProps) {
	const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

	return (
		<div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-primary/[0.03] to-transparent p-5 lg:p-6">
			<div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-3xl" />
			<div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3 sm:items-center">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Sparkles className="size-5" strokeWidth={2.25} />
					</div>
					<div className="min-w-0">
						<p className="text-sm font-semibold text-foreground">
							Finish your brand setup
						</p>
						<p className="mt-0.5 text-xs text-foreground/60">
							Step {currentStep} of {totalSteps} · the dashboard fills in as you complete setup.
						</p>
						<div className="mt-2 h-1 w-44 overflow-hidden rounded-full bg-foreground/10">
							<div
								className="h-full rounded-full bg-primary transition-[width] duration-500"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				</div>
				<Link
					href={`/brands/${brandId}/setup`}
					className="inline-flex items-center justify-center gap-1.5 self-start rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:self-auto"
				>
					Resume setup
					<ArrowRight className="size-4" />
				</Link>
			</div>
		</div>
	)
}
