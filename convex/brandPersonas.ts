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

		const personas = await ctx.db
			.query('brandPersonas')
			.withIndex('by_brand', (q) => q.eq('brandId', args.brandId))
			.collect()
		return personas.sort((a, b) => a.order - b.order)
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
			.query('brandPersonas')
			.withIndex('by_brand_channel', (q) =>
				q.eq('brandId', args.brandId).eq('channel', args.channel),
			)
			.collect()
		return await ctx.db.insert('brandPersonas', {
			brandId: args.brandId,
			channel: args.channel,
			name: '',
			order: existing.length,
			createdAt: Date.now(),
		})
	},
})

export const update = mutation({
	args: {
		personaId: v.id('brandPersonas'),
		name: v.optional(v.string()),
		shortDescription: v.optional(v.string()),
		gender: v.optional(v.string()),
		ageMin: v.optional(v.number()),
		ageMax: v.optional(v.number()),
		location: v.optional(v.string()),
		profession: v.optional(v.string()),
		goals: v.optional(v.string()),
		challenges: v.optional(v.string()),
		interests: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const persona = await ctx.db.get(args.personaId)
		if (!persona) throw new Error('Persona not found.')
		await assertBrandOwner(ctx, persona.brandId)

		const { personaId, ...rest } = args
		const patch: Record<string, unknown> = {}
		for (const [k, val] of Object.entries(rest)) {
			if (val !== undefined) patch[k] = val
		}
		if (Object.keys(patch).length > 0) {
			await ctx.db.patch(personaId, patch)
		}
	},
})

export const remove = mutation({
	args: { personaId: v.id('brandPersonas') },
	handler: async (ctx, args) => {
		const persona = await ctx.db.get(args.personaId)
		if (!persona) return
		await assertBrandOwner(ctx, persona.brandId)
		await ctx.db.delete(args.personaId)
	},
})
