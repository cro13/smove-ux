import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import {
	internalMutation,
	internalQuery,
	mutation,
	query,
} from './_generated/server'
import type { Id } from './_generated/dataModel'

export const createFromWebhook = internalMutation({
	args: {
		brandId: v.optional(v.id('brands')),
		agencyId: v.id('agencies'),
		senderPhone: v.string(),
		senderName: v.optional(v.string()),
		messageBody: v.string(),
		imageStorageId: v.optional(v.id('_storage')),
		rawPayload: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('submissions', {
			brandId: args.brandId,
			agencyId: args.agencyId,
			senderPhone: args.senderPhone,
			senderName: args.senderName,
			messageBody: args.messageBody,
			imageStorageId: args.imageStorageId,
			status: 'pending',
			rawPayload: args.rawPayload,
			createdAt: Date.now(),
		})
	},
})

export const listByBrand = query({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return []

		const brand = await ctx.db.get(args.brandId)
		if (!brand) return []

		const agency = await ctx.db.get(brand.agencyId)
		if (!agency || agency.ownerId !== userId) return []

		const submissions = await ctx.db
			.query('submissions')
			.withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
			.order('desc')
			.collect()

		const withUrls = await Promise.all(
			submissions.map(async (s) => ({
				...s,
				imageUrl: s.imageStorageId
					? await ctx.storage.getUrl(s.imageStorageId)
					: null,
			})),
		)

		return withUrls
	},
})

export const listByAgency = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return []

		const agency = await ctx.db
			.query('agencies')
			.withIndex('by_owner', (q) => q.eq('ownerId', userId))
			.unique()
		if (!agency) return []

		const submissions = await ctx.db
			.query('submissions')
			.withIndex('by_agency', (q) => q.eq('agencyId', agency._id))
			.order('desc')
			.collect()

		const withUrls = await Promise.all(
			submissions.map(async (s) => ({
				...s,
				imageUrl: s.imageStorageId
					? await ctx.storage.getUrl(s.imageStorageId)
					: null,
			})),
		)

		return withUrls
	},
})

export const updateStatus = mutation({
	args: {
		submissionId: v.id('submissions'),
		status: v.union(
			v.literal('pending'),
			v.literal('processing'),
			v.literal('published'),
			v.literal('rejected'),
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error('You must be signed in.')

		const submission = await ctx.db.get(args.submissionId)
		if (!submission) throw new Error('Submission not found.')

		const agency = await ctx.db.get(submission.agencyId)
		if (!agency || agency.ownerId !== userId) {
			throw new Error('Not authorized.')
		}

		await ctx.db.patch(args.submissionId, { status: args.status })
	},
})

export const lookupBrandByIngestKey = internalQuery({
	args: { ingestKey: v.string() },
	handler: async (ctx, args) => {
		const brand = await ctx.db
			.query('brands')
			.withIndex('by_ingest_key', (q) =>
				q.eq('ingestKey', args.ingestKey.toUpperCase()),
			)
			.unique()
		if (!brand) return null
		return { brandId: brand._id, agencyId: brand.agencyId }
	},
})

export const setIngestKey = mutation({
	args: {
		brandId: v.id('brands'),
		ingestKey: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) throw new Error('You must be signed in.')

		const brand = await ctx.db.get(args.brandId)
		if (!brand) throw new Error('Brand not found.')

		const agency = await ctx.db.get(brand.agencyId)
		if (!agency || agency.ownerId !== userId) {
			throw new Error('Not authorized.')
		}

		const key = args.ingestKey.toUpperCase().trim()
		if (key.length < 2 || key.length > 20) {
			throw new Error('Ingest key must be 2-20 characters.')
		}

		const existing = await ctx.db
			.query('brands')
			.withIndex('by_ingest_key', (q) => q.eq('ingestKey', key))
			.unique()
		if (existing && existing._id !== args.brandId) {
			throw new Error('This ingest key is already taken.')
		}

		await ctx.db.patch(args.brandId, { ingestKey: key })
	},
})
