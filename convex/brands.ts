import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import {
	internalMutation,
	mutation,
	query,
	type MutationCtx,
	type QueryCtx,
} from './_generated/server'
import type { Id } from './_generated/dataModel'

const CHANNEL = v.union(
	v.literal('linkedin'),
	v.literal('instagram'),
	v.literal('facebook'),
)

async function assertBrandOwner(
	ctx: QueryCtx | MutationCtx,
	brandId: Id<'brands'>,
) {
	const userId = await getAuthUserId(ctx)
	if (!userId) throw new Error('You must be signed in.')
	const brand = await ctx.db.get(brandId)
	if (!brand) throw new Error('Brand not found.')
	const agency = await ctx.db.get(brand.agencyId)
	if (!agency || agency.ownerId !== userId) {
		throw new Error('Not authorized.')
	}
	return { brand, agency, userId }
}

export const listByAgency = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return []

		const agency = await ctx.db
			.query('agencies')
			.withIndex('by_owner', (q) => q.eq('ownerId', userId))
			.unique()
		if (!agency) return []

		return await ctx.db
			.query('brands')
			.withIndex('by_agency', (q) => q.eq('agencyId', agency._id))
			.collect()
	},
})

export const getById = query({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return null

		const brand = await ctx.db.get(args.brandId)
		if (!brand) return null

		const agency = await ctx.db.get(brand.agencyId)
		if (!agency || agency.ownerId !== userId) return null

		return brand
	},
})

export const create = mutation({
	args: {
		name: v.string(),
		website: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) {
			throw new Error('You must be signed in to create a brand.')
		}

		const agency = await ctx.db
			.query('agencies')
			.withIndex('by_owner', (q) => q.eq('ownerId', userId))
			.unique()
		if (!agency) {
			throw new Error('You must register an agency first.')
		}

		return await ctx.db.insert('brands', {
			agencyId: agency._id,
			name: args.name,
			status: 'active',
			website: args.website,
			createdAt: Date.now(),
			onboardingStep: 1,
		})
	},
})

export const generateBrandUploadUrl = mutation({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error('You must be signed in.')
		return await ctx.storage.generateUploadUrl()
	},
})

export const updateOnboarding = mutation({
	args: {
		brandId: v.id('brands'),
		step: v.optional(v.number()),
		name: v.optional(v.string()),
		website: v.optional(v.string()),
		generalInfo: v.optional(
			v.object({
				language: v.optional(v.string()),
				location: v.optional(v.string()),
				contactName: v.optional(v.string()),
				contactEmail: v.optional(v.string()),
			}),
		),
		companyProfile: v.optional(
			v.object({
				fieldOfBusiness: v.optional(v.string()),
				coreIdentity: v.optional(v.string()),
				coreMessage: v.optional(v.string()),
				tagline: v.optional(v.string()),
				mission: v.optional(v.string()),
				vision: v.optional(v.string()),
				values: v.optional(v.array(v.string())),
				products: v.optional(v.array(v.string())),
				reasonsToBelieve: v.optional(v.array(v.string())),
				keyMessages: v.optional(v.array(v.string())),
			}),
		),
		visualIdentity: v.optional(
			v.object({
				logoStorageId: v.optional(v.id('_storage')),
				iconStorageIds: v.optional(v.array(v.id('_storage'))),
				iconStorageId: v.optional(v.id('_storage')),
				darkLogoStorageId: v.optional(v.id('_storage')),
				lightLogoStorageId: v.optional(v.id('_storage')),
				darkIconStorageId: v.optional(v.id('_storage')),
				lightIconStorageId: v.optional(v.id('_storage')),
				primaryColors: v.optional(v.array(v.string())),
				secondaryColors: v.optional(v.array(v.string())),
				gradients: v.optional(
					v.array(
						v.object({
							from: v.string(),
							to: v.string(),
							type: v.optional(
								v.union(
									v.literal('linear'),
									v.literal('radial'),
									v.literal('conic'),
								),
							),
							angle: v.optional(v.number()),
						}),
					),
				),
				headlineFontStorageId: v.optional(v.id('_storage')),
				headlineFontName: v.optional(v.string()),
				sublineFontStorageId: v.optional(v.id('_storage')),
				sublineFontName: v.optional(v.string()),
				photographyStorageIds: v.optional(v.array(v.id('_storage'))),
				illustrationStorageIds: v.optional(v.array(v.id('_storage'))),
				imageryStorageIds: v.optional(v.array(v.id('_storage'))),
			}),
		),
		voice: v.optional(
			v.object({
				archetype: v.optional(v.string()),
				attributes: v.optional(v.array(v.string())),
				pointOfView: v.optional(v.string()),
				formality: v.optional(v.string()),
				emojiUsage: v.optional(v.string()),
				wordsToUse: v.optional(v.array(v.string())),
				wordsToAvoid: v.optional(v.array(v.string())),
				samplePosts: v.optional(v.array(v.string())),
				tonalityExample: v.optional(v.string()),
			}),
		),
		guardrails: v.optional(
			v.object({
				topicsToAvoid: v.optional(v.array(v.string())),
				bannedClaims: v.optional(v.array(v.string())),
				mandatoryDisclaimers: v.optional(v.string()),
			}),
		),
		referencePosts: v.optional(
			v.array(
				v.object({
					url: v.optional(v.string()),
					caption: v.optional(v.string()),
					imageStorageId: v.optional(v.id('_storage')),
					channel: v.optional(CHANNEL),
				}),
			),
		),
		channels: v.optional(v.array(CHANNEL)),
	},
	handler: async (ctx, args) => {
		const { brand } = await assertBrandOwner(ctx, args.brandId)

		const patch: Record<string, unknown> = {}
		if (args.step !== undefined) patch.onboardingStep = args.step
		if (args.name !== undefined) patch.name = args.name
		if (args.website !== undefined) patch.website = args.website
		if (args.generalInfo !== undefined) patch.generalInfo = args.generalInfo
		if (args.companyProfile !== undefined)
			patch.companyProfile = args.companyProfile
		if (args.visualIdentity !== undefined)
			patch.visualIdentity = args.visualIdentity
		if (args.voice !== undefined) patch.voice = args.voice
		if (args.guardrails !== undefined) patch.guardrails = args.guardrails
		if (args.referencePosts !== undefined)
			patch.referencePosts = args.referencePosts
		if (args.channels !== undefined) patch.channels = args.channels

		await ctx.db.patch(brand._id, patch)
	},
})

const mergeDefined = <T extends Record<string, unknown>>(
	base: T,
	patch: Partial<T>,
): T => {
	const out = { ...base }
	for (const [key, value] of Object.entries(patch)) {
		if (value !== undefined) (out as Record<string, unknown>)[key] = value
	}
	return out
}

export const applyImport = internalMutation({
	args: {
		brandId: v.id('brands'),
		source: v.union(v.literal('website'), v.literal('brandbook')),
		name: v.optional(v.string()),
		website: v.optional(v.string()),
		brandBookStorageId: v.optional(v.id('_storage')),
		generalInfo: v.optional(
			v.object({
				language: v.optional(v.string()),
				location: v.optional(v.string()),
				contactName: v.optional(v.string()),
				contactEmail: v.optional(v.string()),
			}),
		),
		companyProfile: v.optional(
			v.object({
				fieldOfBusiness: v.optional(v.string()),
				coreIdentity: v.optional(v.string()),
				coreMessage: v.optional(v.string()),
				tagline: v.optional(v.string()),
				mission: v.optional(v.string()),
				vision: v.optional(v.string()),
				values: v.optional(v.array(v.string())),
				products: v.optional(v.array(v.string())),
				reasonsToBelieve: v.optional(v.array(v.string())),
				keyMessages: v.optional(v.array(v.string())),
			}),
		),
		visualIdentity: v.optional(
			v.object({
				logoStorageId: v.optional(v.id('_storage')),
				iconStorageIds: v.optional(v.array(v.id('_storage'))),
				primaryColors: v.optional(v.array(v.string())),
				secondaryColors: v.optional(v.array(v.string())),
				headlineFontName: v.optional(v.string()),
				sublineFontName: v.optional(v.string()),
			}),
		),
		voice: v.optional(
			v.object({
				archetype: v.optional(v.string()),
				attributes: v.optional(v.array(v.string())),
				pointOfView: v.optional(v.string()),
				formality: v.optional(v.string()),
				emojiUsage: v.optional(v.string()),
				wordsToUse: v.optional(v.array(v.string())),
				wordsToAvoid: v.optional(v.array(v.string())),
				samplePosts: v.optional(v.array(v.string())),
			}),
		),
		guardrails: v.optional(
			v.object({
				topicsToAvoid: v.optional(v.array(v.string())),
				bannedClaims: v.optional(v.array(v.string())),
				mandatoryDisclaimers: v.optional(v.string()),
			}),
		),
	},
	handler: async (ctx, args) => {
		const brand = await ctx.db.get(args.brandId)
		if (!brand) throw new Error('Brand not found.')

		const patch: Record<string, unknown> = {
			importSource: args.source,
			importedAt: Date.now(),
			onboardingStep: 8,
		}
		if (args.name !== undefined) patch.name = args.name
		if (args.website !== undefined) patch.website = args.website
		if (args.brandBookStorageId !== undefined)
			patch.brandBookStorageId = args.brandBookStorageId
		if (args.generalInfo)
			patch.generalInfo = mergeDefined(
				brand.generalInfo ?? {},
				args.generalInfo,
			)
		if (args.companyProfile)
			patch.companyProfile = mergeDefined(
				brand.companyProfile ?? {},
				args.companyProfile,
			)
		if (args.visualIdentity)
			patch.visualIdentity = mergeDefined(
				brand.visualIdentity ?? {},
				args.visualIdentity,
			)
		if (args.voice)
			patch.voice = mergeDefined(brand.voice ?? {}, args.voice)
		if (args.guardrails)
			patch.guardrails = mergeDefined(
				brand.guardrails ?? {},
				args.guardrails,
			)

		await ctx.db.patch(args.brandId, patch)
	},
})

export const remove = mutation({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const { brand } = await assertBrandOwner(ctx, args.brandId)

		const personas = await ctx.db
			.query('brandPersonas')
			.withIndex('by_brand', (q) => q.eq('brandId', brand._id))
			.collect()
		await Promise.all(personas.map((p) => ctx.db.delete(p._id)))

		const buckets = await ctx.db
			.query('brandContentBuckets')
			.withIndex('by_brand', (q) => q.eq('brandId', brand._id))
			.collect()
		await Promise.all(buckets.map((b) => ctx.db.delete(b._id)))

		await ctx.db.delete(brand._id)
	},
})

export const completeOnboarding = mutation({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const { brand } = await assertBrandOwner(ctx, args.brandId)
		await ctx.db.patch(brand._id, {
			onboardingCompletedAt: Date.now(),
			onboardingStep: 8,
		})
	},
})

export const getWithMedia = query({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return null

		const brand = await ctx.db.get(args.brandId)
		if (!brand) return null

		const agency = await ctx.db.get(brand.agencyId)
		if (!agency || agency.ownerId !== userId) return null

		const v = brand.visualIdentity
		const resolveUrl = (id?: Id<'_storage'>) =>
			id ? ctx.storage.getUrl(id) : Promise.resolve(null)

		const iconIds =
			v?.iconStorageIds ??
			(v?.iconStorageId ? [v.iconStorageId] : v?.darkIconStorageId ? [v.darkIconStorageId] : [])
		const photographyIds = v?.photographyStorageIds ?? v?.imageryStorageIds ?? []
		const illustrationIds = v?.illustrationStorageIds ?? []

		const [
			logoUrl,
			iconUrls,
			headlineFontUrl,
			sublineFontUrl,
			photographyUrls,
			illustrationUrls,
			referencePostImageUrls,
			brandBookUrl,
		] = await Promise.all([
			resolveUrl(v?.logoStorageId ?? v?.darkLogoStorageId),
			Promise.all(iconIds.map((id) => ctx.storage.getUrl(id))),
			resolveUrl(v?.headlineFontStorageId),
			resolveUrl(v?.sublineFontStorageId),
			Promise.all(photographyIds.map((id) => ctx.storage.getUrl(id))),
			Promise.all(illustrationIds.map((id) => ctx.storage.getUrl(id))),
			Promise.all(
				(brand.referencePosts ?? []).map((p) =>
					resolveUrl(p.imageStorageId),
				),
			),
			resolveUrl(brand.brandBookStorageId),
		])

		return {
			...brand,
			media: {
				logoUrl,
				iconUrl: iconUrls[0] ?? null,
				iconUrls,
				headlineFontUrl,
				sublineFontUrl,
				photographyUrls,
				illustrationUrls,
				imageryUrls: [...photographyUrls, ...illustrationUrls],
				referencePostImageUrls,
				brandBookUrl,
			},
		}
	},
})
