'use client'

import { useMutation, useQuery } from 'convex/react'
import {
	ArrowLeft,
	Check,
	Clock,
	Image as ImageIcon,
	Inbox,
	Loader2,
	MessageSquare,
	X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'

import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

export default function SubmissionsPage() {
	const params = useParams()
	const brandId = params.brandId as Id<'brands'>

	const brand = useQuery(api.brands.getById, { brandId })
	const submissions = useQuery(api.submissions.listByBrand, { brandId })
	const updateStatus = useMutation(api.submissions.updateStatus)

	const [expandedId, setExpandedId] = useState<Id<'submissions'> | null>(
		null,
	)

	if (brand === undefined || submissions === undefined) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
		)
	}

	if (brand === null) return null

	const handleApprove = async (id: Id<'submissions'>) => {
		await updateStatus({ submissionId: id, status: 'processing' })
	}

	const handleReject = async (id: Id<'submissions'>) => {
		await updateStatus({ submissionId: id, status: 'rejected' })
	}

	return (
		<div className="mx-auto max-w-5xl p-6 lg:p-8">
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<Link
						href={`/brands/${brandId}`}
						className="flex size-8 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
						aria-label="Back to brand"
					>
						<ArrowLeft className="size-4" />
					</Link>
					<div>
						<h1 className="text-lg font-semibold text-foreground">
							Submissions
						</h1>
						<p className="text-sm text-foreground/60">
							Content received via WhatsApp for {brand.name}
						</p>
					</div>
				</div>

				{brand.ingestKey ? (
					<IngestKeyBanner ingestKey={brand.ingestKey} />
				) : (
					<SetupIngestKeyBanner brandId={brandId} />
				)}

				{submissions.length === 0 ? (
					<EmptyState hasKey={Boolean(brand.ingestKey)} />
				) : (
					<div className="space-y-3">
						{submissions.map((submission) => (
							<SubmissionCard
								key={submission._id}
								submission={submission}
								isExpanded={expandedId === submission._id}
								onToggle={() =>
									setExpandedId(
										expandedId === submission._id
											? null
											: submission._id,
									)
								}
								onApprove={() => handleApprove(submission._id)}
								onReject={() => handleReject(submission._id)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

type Submission = {
	_id: Id<'submissions'>
	senderPhone: string
	senderName?: string
	messageBody: string
	imageUrl: string | null
	status: 'pending' | 'processing' | 'published' | 'rejected'
	createdAt: number
}

type SubmissionCardProps = {
	submission: Submission
	isExpanded: boolean
	onToggle: () => void
	onApprove: () => void
	onReject: () => void
}

function SubmissionCard({
	submission,
	isExpanded,
	onToggle,
	onApprove,
	onReject,
}: SubmissionCardProps) {
	const statusConfig = {
		pending: { label: 'Pending', variant: 'outline' as const },
		processing: { label: 'Processing', variant: 'default' as const },
		published: { label: 'Published', variant: 'secondary' as const },
		rejected: { label: 'Rejected', variant: 'destructive' as const },
	}

	const { label, variant } = statusConfig[submission.status]
	const maskedPhone = maskPhone(submission.senderPhone)
	const displayName = submission.senderName || maskedPhone
	const timeAgo = formatRelativeTime(submission.createdAt)

	return (
		<div className="overflow-hidden rounded-xl border border-foreground/10 bg-white transition-shadow hover:shadow-sm">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center gap-4 p-4 text-left"
				aria-label={`Toggle submission from ${displayName}`}
				tabIndex={0}
			>
				{submission.imageUrl ? (
					<div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
						<Image
							src={submission.imageUrl}
							alt="Submission"
							fill
							className="object-cover"
						/>
					</div>
				) : (
					<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
						<MessageSquare className="size-5 text-foreground/40" />
					</div>
				)}

				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-foreground">
							{displayName}
						</span>
						<Badge variant={variant}>{label}</Badge>
					</div>
					<p className="mt-0.5 truncate text-sm text-foreground/60">
						{submission.messageBody}
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-1.5 text-xs text-foreground/40">
					<Clock className="size-3" />
					{timeAgo}
				</div>
			</button>

			{isExpanded && (
				<div className="border-t border-foreground/5 bg-foreground/[0.02] p-4">
					<div className="flex gap-4">
						{submission.imageUrl && (
							<div className="relative h-48 w-64 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
								<Image
									src={submission.imageUrl}
									alt="Submission full"
									fill
									className="object-contain"
								/>
							</div>
						)}
						<div className="flex-1 space-y-3">
							<div>
								<span className="text-xs font-medium uppercase tracking-wide text-foreground/40">
									Message
								</span>
								<p className="mt-1 text-sm text-foreground">
									{submission.messageBody}
								</p>
							</div>
							<div>
								<span className="text-xs font-medium uppercase tracking-wide text-foreground/40">
									From
								</span>
								<p className="mt-1 text-sm text-foreground">
									{submission.senderName
										? `${submission.senderName} (${maskedPhone})`
										: maskedPhone}
								</p>
							</div>
						</div>
					</div>

					{submission.status === 'pending' && (
						<div className="mt-4 flex items-center gap-2 border-t border-foreground/5 pt-4">
							<button
								type="button"
								onClick={onApprove}
								className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
								aria-label="Approve submission"
								tabIndex={0}
							>
								<Check className="size-3.5" />
								Approve
							</button>
							<button
								type="button"
								onClick={onReject}
								className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5"
								aria-label="Reject submission"
								tabIndex={0}
							>
								<X className="size-3.5" />
								Reject
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

function IngestKeyBanner({ ingestKey }: { ingestKey: string }) {
	return (
		<div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
			<div className="flex items-center gap-3">
				<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
					<MessageSquare className="size-4 text-primary" />
				</div>
				<div>
					<p className="text-sm font-medium text-foreground">
						WhatsApp Ingest Key:{' '}
						<code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-primary">
							{ingestKey}
						</code>
					</p>
					<p className="mt-0.5 text-xs text-foreground/60">
						Employees send images to your WhatsApp number with this
						key prefix, e.g. &quot;{ingestKey}: Photo from the
						event&quot;
					</p>
				</div>
			</div>
		</div>
	)
}

function SetupIngestKeyBanner({ brandId }: { brandId: Id<'brands'> }) {
	const setIngestKey = useMutation(api.submissions.setIngestKey)
	const [key, setKey] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async () => {
		if (!key.trim()) return
		setIsSubmitting(true)
		setError('')
		try {
			await setIngestKey({ brandId, ingestKey: key })
		} catch (err: any) {
			setError(err.message ?? 'Failed to set key')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="rounded-xl border border-amber-500/20 bg-amber-50/50 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
				<div className="flex-1">
					<p className="text-sm font-medium text-foreground">
						Set up a brand key to start receiving submissions
					</p>
					<p className="mt-0.5 text-xs text-foreground/60">
						A short code (e.g. &quot;AMAZON&quot;) that employees
						prefix their WhatsApp messages with.
					</p>
					<div className="mt-2 flex items-center gap-2">
						<input
							type="text"
							value={key}
							onChange={(e) => setKey(e.target.value.toUpperCase())}
							placeholder="e.g. AMAZON"
							className="h-8 w-40 rounded-lg border border-foreground/10 bg-white px-2.5 text-sm font-mono uppercase placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
							maxLength={20}
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleSubmit()
							}}
							aria-label="Brand ingest key"
							tabIndex={0}
						/>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={isSubmitting || !key.trim()}
							className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
							aria-label="Save brand key"
							tabIndex={0}
						>
							{isSubmitting ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								'Save'
							)}
						</button>
					</div>
					{error && (
						<p className="mt-1.5 text-xs text-red-600">{error}</p>
					)}
				</div>
			</div>
		</div>
	)
}

function EmptyState({ hasKey }: { hasKey: boolean }) {
	return (
		<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-foreground/10 py-16">
			<div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5">
				<Inbox className="size-6 text-foreground/30" />
			</div>
			<p className="mt-3 text-sm font-medium text-foreground/70">
				No submissions yet
			</p>
			<p className="mt-1 max-w-xs text-center text-xs text-foreground/50">
				{hasKey
					? 'Submissions will appear here as soon as someone sends a message with your brand key to the WhatsApp number.'
					: 'Set up your brand key above to start receiving WhatsApp submissions.'}
			</p>
			{hasKey && (
				<div className="mt-4 flex items-center gap-2 rounded-lg bg-foreground/5 px-3 py-2">
					<ImageIcon className="size-4 text-foreground/40" />
					<span className="text-xs text-foreground/60">
						Send an image + brand key to test
					</span>
				</div>
			)}
		</div>
	)
}

function maskPhone(phone: string): string {
	if (phone.length <= 6) return phone
	return phone.slice(0, 4) + '****' + phone.slice(-2)
}

function formatRelativeTime(timestamp: number): string {
	const diff = Date.now() - timestamp
	const minutes = Math.floor(diff / 60000)
	if (minutes < 1) return 'just now'
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}
