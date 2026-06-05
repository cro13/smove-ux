'use client'

import { useAction, useQuery } from 'convex/react'
import {
	ArrowRight,
	Clock,
	Grid3X3,
	Inbox,
	List,
	Loader2,
	MessageSquare,
	Send,
	Sparkles,
	X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { GeneratedPostCard } from '@/components/dashboard/brand/generated-post-card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

type ViewMode = 'list' | 'feed'

type Props = {
	brandId: Id<'brands'>
	hasTemplate?: boolean
	hasStyleAnalysis?: boolean
}

export function SubmissionsSection({ brandId, hasTemplate, hasStyleAnalysis }: Props) {
	const submissions = useQuery(api.submissions.listByBrand, { brandId })
	const sendForApproval = useAction(api.approvals.sendForApproval)
	const generatePost = useAction(api.ai.generatePost.generatePost)
	const [viewMode, setViewMode] = useState<ViewMode>('feed')
	const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
	const [sendingId, setSendingId] = useState<Id<'submissions'> | null>(null)
	const [generatingId, setGeneratingId] = useState<Id<'submissions'> | null>(null)

	const canGenerate = !!hasTemplate && !!hasStyleAnalysis

	const handleSendForApproval = async (submissionId: Id<'submissions'>) => {
		setSendingId(submissionId)
		try {
			await sendForApproval({ submissionId })
		} catch (err) {
			console.error('Failed to send for approval:', err)
		} finally {
			setSendingId(null)
		}
	}

	const handleGeneratePost = async (submissionId: Id<'submissions'>) => {
		setGeneratingId(submissionId)
		try {
			await generatePost({ submissionId, brandId })
		} catch (err) {
			console.error('Failed to generate post:', err)
		} finally {
			setGeneratingId(null)
		}
	}

	if (submissions === undefined) return null

	const pending = submissions.filter((s) => s.status === 'pending')
	const recent = submissions.slice(0, 6)

	return (
		<section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
			<div className="flex items-center justify-between border-b border-black/[0.05] px-5 py-4">
				<div className="flex items-center gap-2.5">
					<div>
						<h2 className="text-sm font-semibold text-foreground">
							On Demand
						</h2>
						<p className="text-xs text-muted-foreground">
							Content submitted via WhatsApp
						</p>
					</div>
					{pending.length > 0 && (
						<Badge variant="default">
							{pending.length} new
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2">
					<ViewToggle mode={viewMode} onChange={setViewMode} />
					<Link
						href={`/brands/${brandId}/submissions`}
						className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
						aria-label="View all submissions"
						tabIndex={0}
					>
						View all
						<ArrowRight className="size-3" />
					</Link>
				</div>
			</div>

			{recent.length === 0 ? (
				<EmptyState brandId={brandId} />
			) : viewMode === 'list' ? (
				<div className="divide-y divide-black/[0.04]">
					{recent.map((submission) => (
						<SubmissionRow
							key={submission._id}
							submission={submission}
						/>
					))}
				</div>
			) : (
				<div className="mx-auto max-w-lg space-y-4 p-5">
					{recent.map((submission) => (
						<SubmissionFeedCard
							key={submission._id}
							submission={submission}
							onImageClick={setLightboxUrl}
							onSendForApproval={handleSendForApproval}
							isSending={sendingId === submission._id}
							canGenerate={canGenerate}
							onGeneratePost={handleGeneratePost}
							isGenerating={generatingId === submission._id}
						/>
					))}
				</div>
			)}

			{lightboxUrl && (
				<Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
			)}
		</section>
	)
}

type ViewToggleProps = {
	mode: ViewMode
	onChange: (mode: ViewMode) => void
}

function ViewToggle({ mode, onChange }: ViewToggleProps) {
	return (
		<div className="flex items-center rounded-lg border border-black/[0.08] p-0.5">
			<button
				type="button"
				onClick={() => onChange('list')}
				className={`flex size-7 items-center justify-center rounded-md transition-colors ${
					mode === 'list'
						? 'bg-foreground/[0.07] text-foreground'
						: 'text-foreground/40 hover:text-foreground/60'
				}`}
				aria-label="List view"
				tabIndex={0}
			>
				<List className="size-3.5" />
			</button>
			<button
				type="button"
				onClick={() => onChange('feed')}
				className={`flex size-7 items-center justify-center rounded-md transition-colors ${
					mode === 'feed'
						? 'bg-foreground/[0.07] text-foreground'
						: 'text-foreground/40 hover:text-foreground/60'
				}`}
				aria-label="Feed view"
				tabIndex={0}
			>
				<Grid3X3 className="size-3.5" />
			</button>
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

type SubmissionRowProps = {
	submission: Submission
}

function SubmissionRow({ submission }: SubmissionRowProps) {
	const statusConfig = {
		pending: { label: 'Pending', variant: 'outline' as const },
		processing: { label: 'Processing', variant: 'default' as const },
		published: { label: 'Published', variant: 'secondary' as const },
		rejected: { label: 'Rejected', variant: 'destructive' as const },
	}

	const { label, variant } = statusConfig[submission.status]
	const displayName =
		submission.senderName || maskPhone(submission.senderPhone)

	return (
		<div className="flex items-center gap-3 px-5 py-3">
			{submission.imageUrl ? (
				<div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
					<Image
						src={submission.imageUrl}
						alt="Submission"
						fill
						className="object-cover"
					/>
				</div>
			) : (
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
					<MessageSquare className="size-4 text-foreground/40" />
				</div>
			)}

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="truncate text-sm font-medium text-foreground">
						{displayName}
					</span>
					<Badge variant={variant}>{label}</Badge>
				</div>
				<p className="truncate text-xs text-muted-foreground">
					{submission.messageBody}
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-1 text-[11px] text-foreground/40">
				<Clock className="size-3" />
				{formatRelativeTime(submission.createdAt)}
			</div>
		</div>
	)
}

type SubmissionFeedCardProps = {
	submission: Submission
	onImageClick: (url: string) => void
	onSendForApproval: (id: Id<'submissions'>) => void
	isSending: boolean
	canGenerate: boolean
	onGeneratePost: (id: Id<'submissions'>) => void
	isGenerating: boolean
}

function SubmissionFeedCard({
	submission,
	onImageClick,
	onSendForApproval,
	isSending,
	canGenerate,
	onGeneratePost,
	isGenerating,
}: SubmissionFeedCardProps) {
	const statusConfig = {
		pending: { label: 'Pending', className: 'bg-gray-100 text-gray-600' },
		processing: { label: 'Sent for approval', className: 'bg-blue-50 text-blue-600' },
		published: { label: 'Approved', className: 'bg-green-50 text-green-700' },
		rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600' },
	}

	const { label, className: statusClassName } = statusConfig[submission.status]
	const displayName =
		submission.senderName || maskPhone(submission.senderPhone)

	return (
		<div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
			{submission.imageUrl ? (
				<button
					type="button"
					onClick={() => onImageClick(submission.imageUrl!)}
					className="relative block w-full cursor-zoom-in bg-foreground/5"
					aria-label="View full image"
					tabIndex={0}
				>
					<Image
						src={submission.imageUrl}
						alt="Submission"
						width={600}
						height={0}
						className="h-auto w-full"
						style={{ height: 'auto' }}
					/>
				</button>
			) : (
				<div className="flex items-center gap-2 border-b border-black/[0.04] px-4 py-3 bg-foreground/[0.015]">
					<MessageSquare className="size-4 text-foreground/30" />
					<span className="text-xs font-medium text-foreground/50">
						Text message
					</span>
				</div>
			)}

			<div className="p-4">
				{submission.messageBody && (
					<p className="text-sm leading-relaxed text-foreground">
						{submission.messageBody}
					</p>
				)}

				<div className="mt-3 flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-medium text-foreground/60">
							{displayName}
						</span>
						<span className="text-foreground/20">·</span>
						<span className="text-xs text-foreground/40">
							{formatRelativeTime(submission.createdAt)}
						</span>
					</div>
					<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClassName}`}>
						{label}
					</span>
				</div>

				<div className="mt-3 flex gap-2">
					<button
						type="button"
						onClick={() => onSendForApproval(submission._id)}
						disabled={isSending}
						className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
						aria-label="Send for approval"
						tabIndex={0}
					>
						{isSending ? (
							<Loader2 className="size-3.5 animate-spin" />
						) : (
							<Send className="size-3.5" />
						)}
						{isSending
							? 'Sending...'
							: submission.status === 'pending'
								? 'Approve'
								: 'Re-approve'}
					</button>

					{canGenerate && (
						<button
							type="button"
							onClick={() => onGeneratePost(submission._id)}
							disabled={isGenerating}
							className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
							aria-label="Generate post"
							tabIndex={0}
						>
							{isGenerating ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<Sparkles className="size-3.5" />
							)}
							{isGenerating ? 'Generating...' : 'Generate Post'}
						</button>
					)}
				</div>

				<GeneratedPostCard submissionId={submission._id} />
			</div>
		</div>
	)
}

type LightboxProps = {
	url: string
	onClose: () => void
}

function Lightbox({ url, onClose }: LightboxProps) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label="Full size image"
		>
			<button
				type="button"
				onClick={onClose}
				className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
				aria-label="Close lightbox"
				tabIndex={0}
			>
				<X className="size-5" />
			</button>
			<Image
				src={url}
				alt="Full size submission"
				width={1200}
				height={900}
				className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
				onClick={(e) => e.stopPropagation()}
			/>
		</div>
	)
}

function EmptyState({ brandId }: { brandId: Id<'brands'> }) {
	return (
		<div className="flex flex-col items-center justify-center px-6 py-12">
			<div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/40">
				<Inbox className="size-5" strokeWidth={1.75} />
			</div>
			<h3 className="text-sm font-semibold text-foreground">
				No submissions yet
			</h3>
			<p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
				When employees send images and text to the WhatsApp number with
				your brand key, they&apos;ll appear here.
			</p>
			<Link
				href={`/brands/${brandId}/submissions`}
				className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
				aria-label="Set up submissions"
				tabIndex={0}
			>
				Set up
				<ArrowRight className="size-3" />
			</Link>
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
	if (minutes < 60) return `${minutes}m`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h`
	const days = Math.floor(hours / 24)
	return `${days}d`
}
