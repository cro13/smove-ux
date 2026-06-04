import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const submit = mutation({
	args: {
		fullName: v.string(),
		email: v.string(),
		agencyName: v.string(),
		phone: v.optional(v.string()),
		referralSource: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('waitlist')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.first()

		if (existing) {
			return { success: true, alreadyExists: true }
		}

		await ctx.db.insert('waitlist', {
			...args,
			createdAt: Date.now(),
		})

		return { success: true, alreadyExists: false }
	},
})

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('waitlist').order('desc').collect()
	},
})
