'use client'

import { useAction } from 'convex/react'
import { CheckCircle2, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { api } from '@/convex/_generated/api'

import { AssetCategory } from '../asset-category'
import { ColorSwatchList, GradientList } from '../color-picker'
import { Field } from '../fields'
import { FontUpload } from '../font-upload'
import type {
	BrandPreviewState,
	BrandWithMedia,
	VisualIdentity,
} from '../types'
import { UploadZone } from '../upload-zone'
import { useAutosave } from '../use-autosave'

type Props = {
	brand: BrandWithMedia
	onSave: (patch: { visualIdentity?: VisualIdentity }) => void
	onPreviewChange?: (preview: Partial<BrandPreviewState>) => void
}

export function StepVisuals({ brand, onSave, onPreviewChange }: Props) {
	const extractStyle = useAction(api.ai.extractImageStyle.extractImageStyle)
	const [extracting, setExtracting] = useState(false)
	const [extractError, setExtractError] = useState<string | null>(null)

	const v = brand.visualIdentity
	const [identity, setIdentity] = useState<VisualIdentity>({
		logoStorageId: v?.logoStorageId,
		iconStorageIds: v?.iconStorageIds ?? (v?.iconStorageId ? [v.iconStorageId] : []),
		primaryColors: v?.primaryColors ?? [],
		secondaryColors: v?.secondaryColors ?? [],
		gradients: v?.gradients ?? [],
		headlineFontStorageId: v?.headlineFontStorageId,
		headlineFontName: v?.headlineFontName,
		sublineFontStorageId: v?.sublineFontStorageId,
		sublineFontName: v?.sublineFontName,
		photographyStorageIds:
			v?.photographyStorageIds ?? v?.imageryStorageIds ?? [],
		illustrationStorageIds: v?.illustrationStorageIds ?? [],
	})

	const data = useMemo(() => ({ visualIdentity: identity }), [identity])
	useAutosave({ data, save: onSave, delay: 400 })

	useEffect(() => {
		onPreviewChange?.({
			primaryColor: identity.primaryColors?.[0],
			secondaryColor: identity.secondaryColors?.[0],
			gradient: identity.gradients?.[0],
		})
	}, [identity, onPreviewChange])

	useEffect(() => () => onPreviewChange?.({}), [onPreviewChange])

	const update = <K extends keyof VisualIdentity>(
		key: K,
		value: VisualIdentity[K],
	) => setIdentity((s) => ({ ...s, [key]: value }))

	const handleExtractStyle = async () => {
		setExtracting(true)
		setExtractError(null)
		try {
			await extractStyle({ brandId: brand._id })
		} catch (err) {
			setExtractError(
				err instanceof Error ? err.message : 'Style extraction failed.',
			)
		} finally {
			setExtracting(false)
		}
	}

	const photoCount = identity.photographyStorageIds?.length ?? 0
	const hasAnalysis = !!brand.imageStyleAnalysis
	const analysisOutdated =
		hasAnalysis &&
		photoCount !== brand.imageStyleAnalysis!.analyzedImageCount

	return (
		<div className="space-y-7">
			<p className="text-sm text-gray-500">
				Upload your assets and define your style. We’ll use these to keep
				visuals on-brand.
			</p>

			<Card
				title="Logo"
				subtitle="Upload a transparent SVG, PNG or WebP so your mark sits cleanly on any background."
			>
				<UploadZone
					label="Brand logo"
					helper="Transparent SVG, PNG or WebP"
					aspectRatio="wide"
					currentUrl={brand.media.logoUrl}
					onUploaded={(id) => update('logoStorageId', id)}
					onRemove={() => update('logoStorageId', undefined)}
				/>
				<p className="mt-2 text-[11px] text-gray-400">
					The full wordmark used across posts and headers.
				</p>
			</Card>

			<Card title="Colors" subtitle="Pick the colors and gradients that define your brand.">
				<div className="grid grid-cols-1 gap-6 @xl/col:grid-cols-2">
					<Field label="Primary colors">
						<ColorSwatchList
							colors={identity.primaryColors ?? []}
							onChange={(c) => update('primaryColors', c)}
						/>
					</Field>
					<Field label="Secondary colors">
						<ColorSwatchList
							colors={identity.secondaryColors ?? []}
							onChange={(c) => update('secondaryColors', c)}
						/>
					</Field>
				</div>
				<div className="mt-6">
					<Field label="Gradients" hint="Optional · pair colors for bold backgrounds">
						<GradientList
							gradients={identity.gradients ?? []}
							onChange={(g) => update('gradients', g)}
						/>
					</Field>
				</div>
			</Card>

			<Card
				title="Typography"
				subtitle="Pick a Google Font by name, or upload your own (.ttf, .otf, .woff, .woff2). Make sure you have the licenses to use them."
			>
				<div className="grid grid-cols-1 gap-3 @xl/col:grid-cols-2">
					<FontUpload
						label="Headline font"
						hint="Used for titles and headlines"
						currentUrl={brand.media.headlineFontUrl}
						currentName={identity.headlineFontName}
						onUploaded={(id, name) => {
							update('headlineFontStorageId', id)
							update('headlineFontName', name)
						}}
						onGoogleFont={(name) => {
							update('headlineFontStorageId', undefined)
							update('headlineFontName', name)
						}}
						onRemove={() => {
							update('headlineFontStorageId', undefined)
							update('headlineFontName', undefined)
						}}
					/>
					<FontUpload
						label="Subline font"
						hint="Used for body copy and supporting text"
						currentUrl={brand.media.sublineFontUrl}
						currentName={identity.sublineFontName}
						onUploaded={(id, name) => {
							update('sublineFontStorageId', id)
							update('sublineFontName', name)
						}}
						onGoogleFont={(name) => {
							update('sublineFontStorageId', undefined)
							update('sublineFontName', name)
						}}
						onRemove={() => {
							update('sublineFontStorageId', undefined)
							update('sublineFontName', undefined)
						}}
					/>
				</div>
			</Card>

			<Card
				title="Imagery & Assets"
				subtitle="These assets serve as “Moods” to train our image generation models. Uploading high-quality examples helps the AI understand and replicate your brand’s unique visual language. Supported filetypes: JPG, JPEG, PNG, WEBP."
			>
				<div className="grid grid-cols-1 gap-5 @md/col:grid-cols-3">
					<AssetCategory
						label="Photography"
						sublabel="Max. 20 Photos"
						storageIds={identity.photographyStorageIds ?? []}
						urls={brand.media.photographyUrls}
						onChange={(ids) => update('photographyStorageIds', ids)}
						max={20}
					/>
					<AssetCategory
						label="Illustrations"
						sublabel="Max. 20"
						storageIds={identity.illustrationStorageIds ?? []}
						urls={brand.media.illustrationUrls}
						onChange={(ids) => update('illustrationStorageIds', ids)}
						max={20}
					/>
					<AssetCategory
						label="Icons"
						sublabel="Max. 20"
						storageIds={identity.iconStorageIds ?? []}
						urls={brand.media.iconUrls}
						onChange={(ids) => update('iconStorageIds', ids)}
						max={20}
					/>
				</div>
			</Card>

			{photoCount > 0 && (
				<Card
					title="Photography Style Analysis"
					subtitle="AI extracts a reproducible style profile from your photography assets for image generation."
				>
					{hasAnalysis && !extracting && (
						<div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
							<div className="mb-2 flex items-center gap-2">
								<CheckCircle2 className="size-4 text-emerald-600" />
								<span className="text-sm font-medium text-emerald-800">
									Style profile extracted
								</span>
								<span className="text-xs text-emerald-600">
									({brand.imageStyleAnalysis!.analyzedImageCount} photos analyzed)
								</span>
							</div>
							{(() => {
								try {
									const profile = JSON.parse(brand.imageStyleAnalysis!.profile)
									return (
										<div className="space-y-2 text-xs text-gray-600">
											<ProfileField label="Aesthetic" value={profile.aesthetic_signature} />
											<ProfileField label="Tradition" value={profile.dominant_aesthetic} />
											<ProfileField label="Mood" value={profile.mood} />
											{profile.lighting && (
												<ProfileGroup label="Lighting">
													<ProfileField label="Type" value={profile.lighting.type} />
													<ProfileField label="Direction" value={profile.lighting.direction} />
													<ProfileField label="Quality" value={profile.lighting.quality} />
													<ProfileField label="Notable" value={profile.lighting.notable} />
												</ProfileGroup>
											)}
											{profile.camera && (
												<ProfileGroup label="Camera">
													<ProfileField label="Lens" value={profile.camera.lens} />
													<ProfileField label="Focus" value={profile.camera.focus} />
													<ProfileField label="Angle" value={profile.camera.angle} />
												</ProfileGroup>
											)}
											{profile.color_grading && (
												<ProfileGroup label="Color Grading">
													<ProfileField label="Temperature" value={profile.color_grading.temperature} />
													<ProfileField label="Tonal Style" value={profile.color_grading.tonal_style} />
													<ProfileField label="Saturation" value={profile.color_grading.saturation} />
												</ProfileGroup>
											)}
											{profile.film_stock && (
												<ProfileGroup label="Film Stock">
													<ProfileField label="Type" value={profile.film_stock.type} />
													<ProfileField label="Grain" value={profile.film_stock.grain} />
													<ProfileField label="Finish" value={profile.film_stock.finish} />
												</ProfileGroup>
											)}
											{profile.texture && (
												<ProfileGroup label="Texture">
													<ProfileField label="Materiality" value={profile.texture.materiality} />
													<ProfileField label="Subject-specific" value={profile.texture.subject_specific} />
												</ProfileGroup>
											)}
											<ProfileField label="Imperfections" value={profile.imperfection_signals} />
											<ProfileField label="Avoid" value={profile.avoid} />
										</div>
									)
								} catch {
									return null
								}
							})()}
							{analysisOutdated && (
								<p className="mt-2 text-xs text-amber-600">
									Photos changed since last analysis. Consider re-analyzing.
								</p>
							)}
						</div>
					)}

					{extractError && (
						<p className="mb-3 text-xs text-red-500">{extractError}</p>
					)}

					<button
						type="button"
						onClick={handleExtractStyle}
						disabled={extracting}
						className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
						aria-label={hasAnalysis ? 'Re-analyze photography style' : 'Analyze photography style'}
					>
						{extracting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Analyzing...
							</>
						) : hasAnalysis ? (
							<>
								<RefreshCw className="size-4" />
								Re-analyze
							</>
						) : (
							<>
								<Sparkles className="size-4" />
								Extract Style
							</>
						)}
					</button>
				</Card>
			)}
		</div>
	)
}

function ProfileField({ label, value }: { label: string; value?: string }) {
	if (!value) return null
	return (
		<p>
			<span className="font-medium text-gray-700">{label}: </span>
			{value}
		</p>
	)
}

function ProfileGroup({
	label,
	children,
}: {
	label: string
	children: React.ReactNode
}) {
	return (
		<div className="mt-1 rounded-lg border border-gray-100 bg-white/60 p-2.5">
			<p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
				{label}
			</p>
			<div className="space-y-1">{children}</div>
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
