'use client'

import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import Image from 'next/image'

import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'

import { STEPS } from './types'

const SMOVE_LOGO =
	'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4ebd8e68-4cde-439b-8859-2820929ed47a_320w.png'

type WizardProgressProps = {
	current: number
	completedSteps: Set<number>
	onJump: (step: number) => void
	onExit: () => void
}

export function WizardProgress({
	current,
	completedSteps,
	onJump,
	onExit,
}: WizardProgressProps) {
	const agency = useQuery(api.agencies.myAgency)
	const progress = (current - 1) / (STEPS.length - 1)

	return (
		<aside
			className={cn(
				'hidden h-full w-72 shrink-0 flex-col lg:flex',
				'bg-gradient-to-b from-white via-white to-blue-50/40',
				'shadow-[8px_0_24px_-12px_rgba(15,23,42,0.08)]',
				'border-r border-gray-100',
			)}
		>
			<div className="flex items-center gap-2.5 border-b border-gray-100/80 px-6 py-5">
				<Image
					src={SMOVE_LOGO}
					alt="Smove"
					width={72}
					height={20}
					className="shrink-0 object-contain"
					unoptimized
				/>
				{agency && (
					<>
						<span className="h-4 w-px bg-foreground/10" />
						<span className="truncate text-xs font-medium text-foreground/50">
							{agency.name}
						</span>
					</>
				)}
			</div>

			<div className="flex-1 overflow-y-auto px-6 py-7">
				<div className="mb-7">
					<p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
						New Brand
					</p>
					<h1
						className="mt-1 text-2xl font-semibold text-gray-900"
						style={{ letterSpacing: '-0.03em' }}
					>
						Brand Onboarding
					</h1>
					<div className="mt-4 flex items-center gap-3">
						<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200/70">
							<motion.div
								className="h-full rounded-full bg-primary"
								animate={{ width: `${progress * 100}%` }}
								transition={{ type: 'spring', stiffness: 80, damping: 20 }}
							/>
						</div>
						<span className="text-[11px] font-semibold tabular-nums text-gray-500">
							{Math.round(progress * 100)}%
						</span>
					</div>
				</div>

				<ol className="space-y-0.5">
					{STEPS.map((step) => {
						const isCurrent = step.id === current
						const isCompleted = completedSteps.has(step.id)

						return (
							<li key={step.id} className="relative">
								{isCurrent && (
									<motion.span
										layoutId="wizard-active"
										className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary"
										transition={{
											type: 'spring',
											stiffness: 400,
											damping: 30,
										}}
									/>
								)}
								<button
									type="button"
									onClick={() => onJump(step.id)}
									className={cn(
										'group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/70',
										isCurrent
											? 'bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
											: '',
									)}
								>
									<span
										className={cn(
											'flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
											isCompleted
												? 'bg-primary text-white shadow-sm shadow-primary/30'
												: isCurrent
													? 'bg-white text-primary ring-2 ring-primary'
													: 'bg-gray-200 text-gray-500',
										)}
									>
										{isCompleted ? (
											<Check className="size-3.5" strokeWidth={3} />
										) : (
											step.id
										)}
									</span>
									<div className="min-w-0 flex-1">
										<p
											className={cn(
												'text-[10px] font-semibold uppercase tracking-[0.1em]',
												isCurrent
													? 'text-primary'
													: isCompleted
														? 'text-emerald-600'
														: 'text-gray-400',
											)}
										>
											{isCompleted ? 'Done' : `Step ${step.id}`}
										</p>
										<p
											className={cn(
												'truncate text-sm font-medium',
												isCurrent
													? 'text-gray-900'
													: isCompleted
														? 'text-gray-700'
														: 'text-gray-500',
											)}
											style={{ letterSpacing: '-0.01em' }}
										>
											{step.headline}
										</p>
									</div>
								</button>
							</li>
						)
					})}
				</ol>
			</div>

			<div className="border-t border-gray-100/80 px-6 py-4">
				<button
					type="button"
					onClick={onExit}
					className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
				>
					<ArrowLeft className="size-3" />
					Exit setup
				</button>
				<p className="mt-1 text-[10px] text-gray-400">
					Your draft is saved automatically.
				</p>
			</div>
		</aside>
	)
}
