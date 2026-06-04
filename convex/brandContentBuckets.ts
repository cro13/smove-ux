import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server'
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
	if (!agency || agency.ownerId !== userId) throw new Error('Not authorized.')
}

export const listByBrand = query({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return []
		const brand = await ctx.db.get(args.brandId)
		if (!brand) return []
		const agency = await ctx.db.get(brand.agencyId)
		if (!agency || agency.ownerId !== userId) return []

		const buckets = await ctx.db
			.query('brandContentBuckets')
			.withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
			.collect()
		return buckets.sort((a, b) => a.order - b.order)
	},
})

export const create = mutation({
	args: {
		brandId: v.id('brands'),
		channel: CHANNEL,
	},
	handler: async (ctx, args) => {
		await assertBrandOwner(ctx, args.brandId)
		const existing = await ctx.db
			.query('brandContentBuckets')
			.withIndex('by_brand_channel', (q) =>
				q.eq('brandId', args.brandId).eq('channel', args.channel),
			)
			.collect()
		return await ctx.db.insert('brandContentBuckets', {
			brandId: args.brandId,
			channel: args.channel,
			title: '',
			order: existing.length,
			isActive: false,
			createdAt: Date.now(),
		})
	},
})

export const update = mutation({
	args: {
		bucketId: v.id('brandContentBuckets'),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		goal: v.optional(v.string()),
		mediaType: v.optional(v.string()),
		dos: v.optional(v.string()),
		donts: v.optional(v.string()),
		useEmojis: v.optional(v.string()),
		exampleCaption: v.optional(v.string()),
		usePrimarySources: v.optional(v.boolean()),
		scheduleDays: v.optional(v.array(v.string())),
		scheduleTime: v.optional(v.string()),
		isActive: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const bucket = await ctx.db.get(args.bucketId)
		if (!bucket) throw new Error('Content bucket not found.')
		await assertBrandOwner(ctx, bucket.brandId)

		const { bucketId, ...rest } = args
		const patch: Record<string, unknown> = {}
		for (const [k, val] of Object.entries(rest)) {
			if (val !== undefined) patch[k] = val
		}
		if (Object.keys(patch).length > 0) {
			await ctx.db.patch(bucketId, patch)
		}
	},
})

export const remove = mutation({
	args: { bucketId: v.id('brandContentBuckets') },
	handler: async (ctx, args) => {
		const bucket = await ctx.db.get(args.bucketId)
		if (!bucket) return
		await assertBrandOwner(ctx, bucket.brandId)
		await ctx.db.delete(args.bucketId)
	},
})
