import type { FunctionReturnType } from 'convex/server'

import type { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

import type { Gradient } from './gradient'

export type { Gradient } from './gradient'

export type BrandWithMedia = NonNullable<
	FunctionReturnType<typeof api.brands.getWithMedia>
>

export type Channel = 'linkedin' | 'instagram' | 'facebook'

export const CHANNELS: Channel[] = ['linkedin', 'instagram', 'facebook']

export const CHANNEL_LABEL: Record<Channel, string> = {
	linkedin: 'LinkedIn',
	instagram: 'Instagram',
	facebook: 'Facebook',
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const STEPS = [
	{ id: 1, label: 'General', headline: 'General Information' },
	{ id: 2, label: 'Story', headline: 'Company Profile' },
	{ id: 3, label: 'Visuals', headline: 'Visual Identity' },
	{ id: 4, label: 'Voice', headline: 'Tone of Voice' },
	{ id: 5, label: 'Channels', headline: 'Communication Channels' },
	{ id: 6, label: 'Personas', headline: 'Target Personas' },
	{ id: 7, label: 'Content', headline: 'Content Buckets' },
	{ id: 8, label: 'Review', headline: 'Overview' },
] as const

export type GeneralInfo = {
	language?: string
	location?: string
	contactName?: string
	contactEmail?: string
}

export type CompanyProfile = {
	fieldOfBusiness?: string
	coreIdentity?: string
	coreMessage?: string
	tagline?: string
	mission?: string
	vision?: string
	values?: string[]
	products?: string[]
	reasonsToBelieve?: string[]
	keyMessages?: string[]
}

export type VisualIdentity = {
	logoStorageId?: Id<'_storage'>
	iconStorageIds?: Id<'_storage'>[]
	primaryColors?: string[]
	secondaryColors?: string[]
	gradients?: Gradient[]
	headlineFontStorageId?: Id<'_storage'>
	headlineFontName?: string
	sublineFontStorageId?: Id<'_storage'>
	sublineFontName?: string
	photographyStorageIds?: Id<'_storage'>[]
	illustrationStorageIds?: Id<'_storage'>[]
	imageryStorageIds?: Id<'_storage'>[]
}

export type Voice = {
	archetype?: string
	attributes?: string[]
	pointOfView?: string
	formality?: string
	emojiUsage?: string
	wordsToUse?: string[]
	wordsToAvoid?: string[]
	samplePosts?: string[]
	tonalityExample?: string
}

export type Guardrails = {
	topicsToAvoid?: string[]
	bannedClaims?: string[]
	mandatoryDisclaimers?: string
}

export type ReferencePost = {
	url?: string
	caption?: string
	imageStorageId?: Id<'_storage'>
	channel?: Channel
}

export type BrandPreviewState = {
	name: string
	primaryColor?: string
	secondaryColor?: string
	logoUrl?: string | null
	iconUrl?: string | null
	gradient?: Gradient
	archetype?: string
	coreMessage?: string
	tonalityExample?: string
}
