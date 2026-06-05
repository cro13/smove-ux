'use client'

import { useAction, useMutation } from 'convex/react'
import {
	CheckCircle2,
	Loader2,
	RefreshCw,
	Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

import type { BrandWithMedia } from '../types'
import { UploadZone } from '../upload-zone'

type Props = {
	brand: BrandWithMedia
	brandId: Id<'brands'>
}

export function StepTemplates({ brand, brandId }: Props) {
	const saveTemplate = useMutation(api.brands.savePostTemplate)
	const interpretTemplate = useAction(api.ai.interpretTemplate.interpretTemplate)

	const [imageStorageId, setImageStorageId] = useState<Id<'_storage'> | undefined>(
		brand.postTemplate?.imageStorageId,
	)
	const [metadata, setMetadata] = useState(brand.postTemplate?.metadata ?? '')
	const [saving, setSaving] = useState(false)
	const [interpreting, setInterpreting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [jsonError, setJsonError] = useState<string | null>(null)

	const hasInterpretation = !!brand.postTemplate?.interpretation

	const validateJson = (value: string): boolean => {
		if (!value.trim()) {
			setJsonError('Template metadata is required.')
			return false
		}
		try {
			JSON.parse(value)
			setJsonError(null)
			return true
		} catch {
			setJsonError('Invalid JSON. Please check your syntax.')
			return false
		}
	}

	const handleSaveAndInterpret = async () => {
		if (!imageStorageId) {
			setError('Upload a template image first.')
			return
		}
		if (!validateJson(metadata)) return

		setError(null)
		setSaving(true)
		try {
			await saveTemplate({ brandId, imageStorageId, metadata })
			setSaving(false)
			setInterpreting(true)
			await interpretTemplate({ brandId })
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to process template.',
			)
		} finally {
			setSaving(false)
			setInterpreting(false)
		}
	}

	const handleReanalyze = async () => {
		setError(null)
		setInterpreting(true)
		try {
			if (imageStorageId && metadata.trim()) {
				await saveTemplate({ brandId, imageStorageId, metadata })
			}
			await interpretTemplate({ brandId })
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Re-analysis failed.',
			)
		} finally {
			setInterpreting(false)
		}
	}

	return (
		<div className="space-y-7">
			<p className="text-sm text-gray-500">
				Upload a rendered template image and provide the template
				metadata as JSON. The AI will interpret the template for use in
				post generation.
			</p>

			<Card
				title="Template Image"
				subtitle="Upload the rendered template image that shows the complete layout."
			>
				<UploadZone
					label="Template image"
					helper="PNG, JPG, or WebP · max 10 MB"
					aspectRatio="square"
					maxSizeMb={10}
					currentUrl={brand.media.templateImageUrl}
					onUploaded={(id) => setImageStorageId(id)}
					onRemove={() => setImageStorageId(undefined)}
				/>
			</Card>

			<Card
				title="Template Metadata"
				subtitle="Paste the template definition JSON containing dynamic layers, dimensions, and editable areas."
			>
				<textarea
					value={metadata}
					onChange={(e) => {
						setMetadata(e.target.value)
						if (jsonError) validateJson(e.target.value)
					}}
					onBlur={() => {
						if (metadata.trim()) validateJson(metadata)
					}}
					placeholder='{"width": 1080, "height": 1080, "dynamic_layers": [...]}'
					rows={12}
					className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
					aria-label="Template metadata JSON"
				/>
				{jsonError && (
					<p className="mt-1.5 text-xs text-red-500">{jsonError}</p>
				)}
			</Card>

			{hasInterpretation && !interpreting && (
				<Card
					title="Template Interpretation"
					subtitle="AI analysis of your template structure."
				>
					<div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
						<div className="mb-2 flex items-center gap-2">
							<CheckCircle2 className="size-4 text-emerald-600" />
							<span className="text-sm font-medium text-emerald-800">
								Template interpreted
							</span>
							{brand.postTemplate?.interpretedAt && (
								<span className="text-xs text-emerald-600">
									{new Date(brand.postTemplate.interpretedAt).toLocaleDateString()}
								</span>
							)}
						</div>
						{(() => {
							try {
								const interp = JSON.parse(brand.postTemplate!.interpretation!)
								const elements = interp.dynamic_elements
									? Object.values(
										interp.dynamic_elements as Record<
											string,
											{ id?: string; type?: string; role?: string; purpose?: string }
										>,
									)
									: []
								return (
									<div className="space-y-3 text-xs text-gray-600">
										{interp.visual_overview && (
											<InterpGroup label="Visual Overview">
												<InterpField
													label="Layout"
													value={interp.visual_overview.layout_structure}
												/>
												<InterpField
													label="Brand Vibe"
													value={interp.visual_overview.brand_vibe}
												/>
												<InterpField
													label="Description"
													value={interp.visual_overview.template_description}
												/>
											</InterpGroup>
										)}
										{interp.content_concept && (
											<InterpGroup label="Content Concept">
												<InterpField
													label="Format"
													value={interp.content_concept.format}
												/>
												<InterpField
													label="Narrative Logic"
													value={interp.content_concept.narrative_logic}
												/>
											</InterpGroup>
										)}
										{elements.length > 0 && (
											<InterpGroup label={`Dynamic Elements (${elements.length})`}>
												{elements.map((el, i) => (
													<div
														key={el.id ?? i}
														className="rounded-md border border-gray-100 bg-white/80 p-2"
													>
														<div className="mb-0.5 flex items-center gap-2">
															<span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
																{el.type ?? '?'}
															</span>
															<span className="font-medium text-gray-800">
																{el.role ?? 'Unknown role'}
															</span>
														</div>
														{el.purpose && (
															<p className="text-gray-500">{el.purpose}</p>
														)}
													</div>
												))}
											</InterpGroup>
										)}
									</div>
								)
							} catch {
								return (
									<p className="text-xs text-gray-500">
										Interpretation stored successfully.
									</p>
								)
							}
						})()}
					</div>
				</Card>
			)}

			{error && (
				<p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
					{error}
				</p>
			)}

			<div className="flex gap-3">
				<button
					type="button"
					onClick={handleSaveAndInterpret}
					disabled={saving || interpreting || !imageStorageId}
					className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
					aria-label="Save and interpret template"
				>
					{saving || interpreting ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							{saving ? 'Saving...' : 'Interpreting...'}
						</>
					) : (
						<>
							<Sparkles className="size-4" />
							{hasInterpretation ? 'Save & Re-interpret' : 'Save & Interpret'}
						</>
					)}
				</button>

				{hasInterpretation && (
					<button
						type="button"
						onClick={handleReanalyze}
						disabled={interpreting}
						className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
						aria-label="Re-analyze template"
					>
						{interpreting ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<RefreshCw className="size-4" />
						)}
						Re-analyze
					</button>
				)}
			</div>
		</div>
	)
}

function InterpField({ label, value }: { label: string; value?: string }) {
	if (!value) return null
	return (
		<p>
			<span className="font-medium text-gray-700">{label}: </span>
			{value}
		</p>
	)
}

function InterpGroup({
	label,
	children,
}: {
	label: string
	children: React.ReactNode
}) {
	return (
		<div className="rounded-lg border border-gray-100 bg-white/60 p-2.5">
			<p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
				{label}
			</p>
			<div className="space-y-1.5">{children}</div>
		</div>
	)
}

function Card({
	title,
	subtitle,
	children,
}: {
	title: string
	subtitle?: string
	children: React.ReactNode
}) {
	return (
		<div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-7">
			<div className="mb-5">
				<h2 className="text-base font-semibold text-gray-900">{title}</h2>
				{subtitle && (
					<p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
				)}
			</div>
			{children}
		</div>
	)
}
