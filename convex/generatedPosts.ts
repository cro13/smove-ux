import { v } from 'convex/values'

import { internalMutation, query } from './_generated/server'

export const create = internalMutation({
	args: {
		submissionId: v.id('submissions'),
		brandId: v.id('brands'),
		status: v.union(
			v.literal('analyzing'),
			v.literal('generating_image'),
			v.literal('generating_copy'),
			v.literal('completed'),
			v.literal('failed'),
		),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('generatedPosts', {
			submissionId: args.submissionId,
			brandId: args.brandId,
			status: args.status,
			createdAt: Date.now(),
		})
	},
})

export const update = internalMutation({
	args: {
		postId: v.id('generatedPosts'),
		status: v.optional(
			v.union(
				v.literal('analyzing'),
				v.literal('generating_image'),
				v.literal('generating_copy'),
				v.literal('completed'),
				v.literal('failed'),
			),
		),
		analysis: v.optional(v.string()),
		generatedImageStorageId: v.optional(v.id('_storage')),
		generatedCopy: v.optional(v.string()),
		error: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { postId, ...patch } = args
		const cleaned = Object.fromEntries(
			Object.entries(patch).filter(([, val]) => val !== undefined),
		)
		await ctx.db.patch(postId, cleaned)
	},
})

export const getBySubmission = query({
	args: { submissionId: v.id('submissions') },
	handler: async (ctx, args) => {
		const posts = await ctx.db
			.query('generatedPosts')
			.withIndex('by_submission', (q) =>
				q.eq('submissionId', args.submissionId),
			)
			.order('desc')
			.collect()

		const latest = posts[0]
		if (!latest) return null

		const imageUrl = latest.generatedImageStorageId
			? await ctx.storage.getUrl(latest.generatedImageStorageId)
			: null

		return { ...latest, imageUrl }
	},
})

export const listByBrand = query({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const posts = await ctx.db
			.query('generatedPosts')
			.withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
			.order('desc')
			.collect()

		return await Promise.all(
			posts.map(async (p) => ({
				...p,
				imageUrl: p.generatedImageStorageId
					? await ctx.storage.getUrl(p.generatedImageStorageId)
					: null,
			})),
		)
	},
})
