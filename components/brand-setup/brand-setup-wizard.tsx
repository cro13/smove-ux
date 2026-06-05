'use client'

import { useMutation, useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { ArchetypeInsights } from '@/components/brand-setup/archetype-insights'
import { BrandPreview } from '@/components/brand-setup/brand-preview'
import { ARCHETYPES } from '@/components/brand-setup/data'
import { ImportStart } from '@/components/brand-setup/import-start'
import { ReferencePostsCard } from '@/components/brand-setup/reference-posts'
import { StepChannels } from '@/components/brand-setup/steps/step-channels'
import { StepContentBuckets } from '@/components/brand-setup/steps/step-content'
import { StepGeneralInfo } from '@/components/brand-setup/steps/step-general'
import { StepPersonas } from '@/components/brand-setup/steps/step-personas'
import { StepReview } from '@/components/brand-setup/steps/step-review'
import { StepStory } from '@/components/brand-setup/steps/step-story'
import { StepVisuals } from '@/components/brand-setup/steps/step-visuals'
import { StepVoice } from '@/components/brand-setup/steps/step-voice'
import { STEPS, type BrandPreviewState } from '@/components/brand-setup/types'
import type { SaveStatus } from '@/components/brand-setup/use-autosave'
import { WizardNav } from '@/components/brand-setup/wizard-nav'
import { WizardProgress } from '@/components/brand-setup/wizard-progress'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

type Props = {
	brandId: Id<'brands'>
	onExit?: () => void
}

export function BrandSetupWizard({ brandId, onExit }: Props) {
	const router = useRouter()

	const brand = useQuery(api.brands.getWithMedia, { brandId })
	const updateOnboarding = useMutation(api.brands.updateOnboarding)
	const completeOnboarding = useMutation(api.brands.completeOnboarding)

	const [step, setStep] = useState<number>(1)
	const [direction, setDirection] = useState<1 | -1>(1)
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
	const [submitting, setSubmitting] = useState(false)
	const [validationError, setValidationError] = useState<string | null>(null)
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
	const [seededBrandId, setSeededBrandId] = useState<string | null>(null)
	const [startChoiceMade, setStartChoiceMade] = useState(false)
	const [livePreview, setLivePreview] = useState<Partial<BrandPreviewState>>({})
	const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	if (brand && brand._id !== seededBrandId) {
		setSeededBrandId(brand._id)
		const target = Math.max(
			1,
			Math.min(STEPS.length, brand.onboardingStep ?? 1),
		)
		const seeded = new Set<number>()
		for (let i = 1; i < target; i++) seeded.add(i)
		setStep(target)
		setCompletedSteps(seeded)
		setLivePreview({})
	}

	const handlePreviewChange = useCallback(
		(patch: Partial<BrandPreviewState>) => setLivePreview(patch),
		[],
	)

	const updateStatus = useCallback((next: SaveStatus) => {
		setSaveStatus(next)
		if (next !== 'saved') return
		if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
		savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 1600)
	}, [])

	const save = useCallback(
		async (patch: Parameters<typeof updateOnboarding>[0]) => {
			updateStatus('saving')
			try {
				await updateOnboarding(patch)
				updateStatus('saved')
			} catch (err) {
				console.error('Brand setup save failed', err)
				updateStatus('error')
			}
		},
		[updateOnboarding, updateStatus],
	)

	const goNext = async () => {
		setValidationError(null)
		setCompletedSteps((s) => new Set(s).add(step))
		if (step === STEPS.length) {
			setSubmitting(true)
			try {
				await completeOnboarding({ brandId })
				if (onExit) {
					onExit()
				} else {
					router.push(`/brands/${brandId}`)
				}
			} catch (err) {
				console.error('Could not complete onboarding', err)
				setSubmitting(false)
				setValidationError('Could not finish setup. Try again.')
			}
			return
		}
		setDirection(1)
		const next = Math.min(STEPS.length, step + 1)
		setStep(next)
		void save({ brandId, step: next })
	}

	const goBack = () => {
		setValidationError(null)
		setDirection(-1)
		setStep((s) => Math.max(1, s - 1))
	}

	const jumpTo = (target: number) => {
		setValidationError(null)
		setDirection(target > step ? 1 : -1)
		setStep(target)
	}

	const handleExit = () => {
		if (onExit) {
			onExit()
			return
		}
		router.push('/brands')
	}

	const handleImported = () => {
		setStartChoiceMade(true)
		setDirection(1)
		setStep(STEPS.length)
		const seeded = new Set<number>()
		for (let i = 1; i < STEPS.length; i++) seeded.add(i)
		setCompletedSteps(seeded)
	}

	if (brand === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
		)
	}

	if (brand === null) {
		if (onExit) onExit()
		else router.replace('/brands')
		return null
	}

	const currentMeta = STEPS.find((s) => s.id === step)!
	const previewState: BrandPreviewState = {
		name: brand.name,
		primaryColor: brand.visualIdentity?.primaryColors?.[0],
		secondaryColor: brand.visualIdentity?.secondaryColors?.[0],
		logoUrl: brand.media.logoUrl,
		iconUrl: brand.media.iconUrl,
		gradient: brand.visualIdentity?.gradients?.[0],
		archetype: brand.voice?.archetype,
		coreMessage: brand.companyProfile?.tagline ?? brand.companyProfile?.coreMessage,
		tonalityExample:
			brand.voice?.samplePosts?.[0] ?? brand.voice?.tonalityExample,
		...livePreview,
	}

	const showPreview = step === 3 || step === 4
	const isPersonaOrContent = step === 6 || step === 7
	const selectedArchetype = ARCHETYPES.find((a) => a.id === brand.voice?.archetype)

	const showImportStart =
		!startChoiceMade &&
		!brand.onboardingCompletedAt &&
		!brand.importSource &&
		(brand.onboardingStep ?? 1) <= 1 &&
		!brand.generalInfo &&
		!brand.companyProfile &&
		!brand.visualIdentity

	if (showImportStart) {
		return (
			<div className="h-full w-full overflow-y-auto bg-[#FAF9F7]">
				<ImportStart
					brandId={brandId}
					brandName={brand.name}
					onImported={handleImported}
					onScratch={() => setStartChoiceMade(true)}
				/>
			</div>
		)
	}

	return (
		<div className="flex h-full w-full bg-[#FAF9F7]">
			<WizardProgress
				current={step}
				completedSteps={completedSteps}
				onJump={jumpTo}
				onExit={handleExit}
			/>

			<div className="@container/wizard flex min-w-0 flex-1 flex-col overflow-y-auto">
				<div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 py-10 sm:px-8 lg:py-14 @4xl/wizard:gap-8">
					<div className="@container/col min-w-0 flex-1">
						<header className="mb-8">
							<p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
								Step {step} of {STEPS.length}
							</p>
							<motion.h1
								key={currentMeta.headline}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								className="mt-1 text-2xl text-gray-900 sm:text-3xl"
								style={{ letterSpacing: '-0.04em' }}
							>
								{currentMeta.headline}
							</motion.h1>
						</header>

						<AnimatePresence mode="wait" custom={direction}>
							<motion.section
								key={step}
								custom={direction}
								initial={{ opacity: 0, x: direction * 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -direction * 20 }}
								transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
								className={isPersonaOrContent ? 'min-w-0' : 'mx-auto w-full max-w-2xl'}
							>
								{step === 1 && (
									<StepGeneralInfo
										brand={brand}
										onSave={(patch) => save({ brandId, ...patch })}
										onValidationError={setValidationError}
									/>
								)}
								{step === 2 && (
									<StepStory
										brand={brand}
										onSave={(patch) => save({ brandId, ...patch })}
									/>
								)}
								{step === 3 && (
									<StepVisuals
										brand={brand}
										onSave={(patch) => save({ brandId, ...patch })}
										onPreviewChange={handlePreviewChange}
									/>
								)}
								{step === 4 && (
									<div className="space-y-6">
										<StepVoice
											brand={brand}
											onSave={(patch) => save({ brandId, ...patch })}
											onPreviewChange={handlePreviewChange}
										/>
										<ReferencePostsCard
											brand={brand}
											onSave={(patch) => save({ brandId, ...patch })}
										/>
									</div>
								)}
								{step === 5 && (
									<StepChannels
										brand={brand}
										onSave={(patch) => save({ brandId, ...patch })}
										onValidationError={setValidationError}
									/>
								)}
								{step === 6 && (
									<StepPersonas
										brandId={brandId}
										channels={brand.channels ?? []}
										onStatus={updateStatus}
									/>
								)}
								{step === 7 && (
									<StepContentBuckets
										brandId={brandId}
										channels={brand.channels ?? []}
										onStatus={updateStatus}
									/>
								)}
								{step === 8 && (
									<StepReview
										brand={brand}
										brandId={brandId}
										onJump={jumpTo}
									/>
								)}
							</motion.section>
						</AnimatePresence>

						{validationError && (
							<motion.p
								initial={{ opacity: 0, y: -4 }}
								animate={{ opacity: 1, y: 0 }}
								className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
							>
								{validationError}
							</motion.p>
						)}

						<WizardNav
							step={step}
							totalSteps={STEPS.length}
							saveStatus={saveStatus}
							onBack={goBack}
							onNext={goNext}
							submitting={submitting}
						/>
					</div>

					{showPreview && (
						<aside className="sticky top-8 hidden h-fit w-full max-w-xs flex-col gap-4 @4xl/wizard:flex">
							<BrandPreview brand={previewState} />
							{step === 4 && selectedArchetype && (
								<ArchetypeInsights archetype={selectedArchetype} />
							)}
						</aside>
					)}
				</div>
			</div>
		</div>
	)
}
