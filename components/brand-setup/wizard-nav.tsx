'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type WizardNavProps = {
	step: number
	totalSteps: number
	saveStatus: SaveStatus
	onBack: () => void
	onNext: () => void
	nextLabel?: string
	nextDisabled?: boolean
	submitting?: boolean
}

export function WizardNav({
	step,
	totalSteps,
	saveStatus,
	onBack,
	onNext,
	nextLabel,
	nextDisabled,
	submitting,
}: WizardNavProps) {
	const isLast = step === totalSteps
	const label = nextLabel ?? (isLast ? 'Finish setup' : 'Continue')

	return (
		<div className="mt-10 flex items-center justify-end gap-4">
			<TransientSaveStatus status={saveStatus} />

			<button
				type="button"
				onClick={onBack}
				disabled={step === 1 || submitting}
				className={cn(
					'inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors',
					'hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-0',
				)}
			>
				<ArrowLeft className="size-4" />
				Back
			</button>

			<button
				type="button"
				onClick={onNext}
				disabled={nextDisabled || submitting}
				className={cn(
					'inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90',
					isLast && 'shadow-primary/25 hover:shadow-lg',
					(nextDisabled || submitting) && 'cursor-not-allowed opacity-50',
				)}
			>
				{submitting ? (
					<>
						<Loader2 className="size-4 animate-spin" />
						{isLast ? 'Finishing…' : 'Saving…'}
					</>
				) : (
					<>
						{label}
						<ArrowRight className="size-4" />
					</>
				)}
			</button>
		</div>
	)
}

function TransientSaveStatus({ status }: { status: SaveStatus }) {
	return (
		<AnimatePresence mode="wait">
			{status === 'saving' && (
				<motion.span
					key="saving"
					initial={{ opacity: 0, x: 4 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -4 }}
					className="flex items-center gap-1.5 text-xs font-medium text-gray-400"
				>
					<Loader2 className="size-3 animate-spin" />
					Saving
				</motion.span>
			)}
			{status === 'saved' && (
				<motion.span
					key="saved"
					initial={{ opacity: 0, x: 4 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -4 }}
					className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"
				>
					<Check className="size-3" strokeWidth={3} />
					Saved
				</motion.span>
			)}
			{status === 'error' && (
				<motion.span
					key="error"
					initial={{ opacity: 0, x: 4 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -4 }}
					className="text-xs font-medium text-red-500"
				>
					Couldn’t save — try again
				</motion.span>
			)}
		</AnimatePresence>
	)
}
