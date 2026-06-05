'use client'

import { useQuery } from 'convex/react'
import {
	AlertCircle,
	CheckCircle2,
	Copy,
	ImageIcon,
	Loader2,
	MessageSquare,
	Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

type Props = {
	submissionId: Id<'submissions'>
}

const STATUS_CONFIG = {
	analyzing: {
		label: 'Analyzing submission...',
		icon: Sparkles,
		color: 'text-blue-600',
	},
	generating_image: {
		label: 'Generating image...',
		icon: ImageIcon,
		color: 'text-violet-600',
	},
	generating_copy: {
		label: 'Writing copy...',
		icon: MessageSquare,
		color: 'text-amber-600',
	},
	completed: {
		label: 'Post generated',
		icon: CheckCircle2,
		color: 'text-emerald-600',
	},
	failed: {
		label: 'Generation failed',
		icon: AlertCircle,
		color: 'text-red-600',
	},
} as const

export function GeneratedPostCard({ submissionId }: Props) {
	const generatedPost = useQuery(api.generatedPosts.getBySubmission, {
		submissionId,
	})
	const [copied, setCopied] = useState(false)

	if (!generatedPost) return null

	const config = STATUS_CONFIG[generatedPost.status]
	const StatusIcon = config.icon
	const isInProgress =
		generatedPost.status === 'analyzing' ||
		generatedPost.status === 'generating_image' ||
		generatedPost.status === 'generating_copy'

	const handleCopy = async () => {
		if (!generatedPost.generatedCopy) return
		await navigator.clipboard.writeText(generatedPost.generatedCopy)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="mt-3 overflow-hidden rounded-lg border border-primary/10 bg-gradient-to-b from-primary/[0.02] to-transparent">
			<div className="flex items-center gap-2 border-b border-primary/[0.06] px-3 py-2">
				{isInProgress ? (
					<Loader2 className={`size-3.5 animate-spin ${config.color}`} />
				) : (
					<StatusIcon className={`size-3.5 ${config.color}`} />
				)}
				<span className={`text-xs font-medium ${config.color}`}>
					{config.label}
				</span>
			</div>

			{generatedPost.status === 'failed' && generatedPost.error && (
				<div className="px-3 py-2">
					<p className="text-xs text-red-500">{generatedPost.error}</p>
				</div>
			)}

			{generatedPost.imageUrl && (
				<div className="relative bg-foreground/5">
					<Image
						src={generatedPost.imageUrl}
						alt="Generated post image"
						width={600}
						height={0}
						className="h-auto w-full"
						style={{ height: 'auto' }}
					/>
				</div>
			)}

			{generatedPost.generatedCopy && (
				<div className="p-3">
					<div className="flex items-start justify-between gap-2">
						<p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
							{generatedPost.generatedCopy}
						</p>
						<button
							type="button"
							onClick={handleCopy}
							className="shrink-0 rounded-md p-1 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground/60"
							aria-label="Copy caption"
							tabIndex={0}
						>
							{copied ? (
								<CheckCircle2 className="size-3.5 text-emerald-500" />
							) : (
								<Copy className="size-3.5" />
							)}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
