'use client'

import { Link2, Plus, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Field, Select, TextInput, Textarea } from './fields'
import { CHANNEL_LABEL, CHANNELS } from './types'
import type { BrandWithMedia, Channel, ReferencePost } from './types'
import { UploadZone } from './upload-zone'
import { useAutosave } from './use-autosave'

type Props = {
	brand: BrandWithMedia
	onSave: (patch: { referencePosts?: ReferencePost[] }) => void
}

const MAX_POSTS = 6

const CHANNEL_OPTIONS = [
	{ value: '', label: 'Any channel' },
	...CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL[c] })),
]

const isEmptyPost = (p: ReferencePost) =>
	!p.url?.trim() && !p.caption?.trim() && !p.imageStorageId

export function ReferencePostsCard({ brand, onSave }: Props) {
	const [posts, setPosts] = useState<ReferencePost[]>(
		brand.referencePosts ?? [],
	)

	const data = useMemo(
		() => ({ referencePosts: posts.filter((p) => !isEmptyPost(p)) }),
		[posts],
	)
	useAutosave({ data, save: onSave, delay: 400 })

	const patchPost = (idx: number, patch: Partial<ReferencePost>) =>
		setPosts((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))

	const addPost = () =>
		setPosts((prev) => (prev.length < MAX_POSTS ? [...prev, {}] : prev))

	const removePost = (idx: number) =>
		setPosts((prev) => prev.filter((_, i) => i !== idx))

	return (
		<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
			<div className="mb-5 flex items-start gap-2.5">
				<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Link2 className="size-4" />
				</span>
				<div>
					<h2 className="text-base font-semibold text-gray-900">
						Reference posts
					</h2>
					<p className="mt-0.5 text-xs text-gray-500">
						Link real published posts so the agent learns your actual format,
						length and media style.
					</p>
				</div>
			</div>

			<div className="space-y-4">
				{posts.map((post, idx) => (
					<div
						key={idx}
						className="relative rounded-2xl border border-gray-200 p-4"
					>
						<button
							type="button"
							onClick={() => removePost(idx)}
							className="absolute right-3 top-3 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
							aria-label="Remove reference post"
						>
							<X className="size-4" />
						</button>

						<div className="grid grid-cols-1 gap-4 @xl/col:grid-cols-[1fr_auto]">
							<div className="space-y-3">
								<div className="grid grid-cols-1 gap-3 @md/col:grid-cols-[160px_1fr]">
									<Field label="Channel">
										<Select
											value={post.channel ?? ''}
											onChange={(val) =>
												patchPost(idx, {
													channel: (val || undefined) as
														| Channel
														| undefined,
												})
											}
											options={CHANNEL_OPTIONS}
											placeholder="Any channel"
										/>
									</Field>
									<Field label="Post URL">
										<TextInput
											value={post.url ?? ''}
											onChange={(val) => patchPost(idx, { url: val })}
											placeholder="https://linkedin.com/posts/…"
											type="url"
											inputMode="url"
										/>
									</Field>
								</div>
								<Field label="Why this post (optional)">
									<Textarea
										value={post.caption ?? ''}
										onChange={(val) => patchPost(idx, { caption: val })}
										placeholder="What about this post represents the brand well?"
										rows={2}
									/>
								</Field>
							</div>

							<div className="sm:w-32">
								<UploadZone
									label="Screenshot"
									helper="Optional"
									currentUrl={brand.media.referencePostImageUrls?.[idx]}
									onUploaded={(id) => patchPost(idx, { imageStorageId: id })}
									onRemove={() =>
										patchPost(idx, { imageStorageId: undefined })
									}
								/>
							</div>
						</div>
					</div>
				))}

				{posts.length < MAX_POSTS && (
					<button
						type="button"
						onClick={addPost}
						className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
					>
						<Plus className="size-3.5" />
						Add reference post
					</button>
				)}
			</div>
		</div>
	)
}
