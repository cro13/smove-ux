import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

const FALLBACK_VALID_CODES = new Set(['TEST', 'SMOVE2025'])
const INVALID_ACCESS_CODE_MESSAGE =
	'Invalid access code. New here? Contact info@smove.ai to get one.'

const normalizeAccessCode = (code: string) => code.trim().toUpperCase()

export const validateAccessCode = query({
	args: {
		accessCode: v.string(),
	},
	handler: async (ctx, args) => {
		const accessCode = normalizeAccessCode(args.accessCode)
		const codeRow = await ctx.db
			.query('accessCodes')
			.withIndex('by_code', (q) => q.eq('code', accessCode))
			.unique()

		if (codeRow) {
			if (codeRow.usesRemaining <= 0) {
				return {
					isValid: false,
					message: 'Access code has no remaining uses.',
				}
			}

			return { isValid: true }
		}

		if (FALLBACK_VALID_CODES.has(accessCode)) {
			return { isValid: true }
		}

		return {
			isValid: false,
			message: INVALID_ACCESS_CODE_MESSAGE,
		}
	},
})

export const generateLogoUploadUrl = mutation({
	handler: async (ctx) => await ctx.storage.generateUploadUrl(),
})

export const registerAgency = mutation({
	args: {
		name: v.string(),
		website: v.optional(v.string()),
		phone: v.optional(v.string()),
		brandColor: v.optional(v.string()),
		logoFileName: v.optional(v.string()),
		logoStorageId: v.optional(v.id('_storage')),
		street: v.string(),
		number: v.string(),
		zip: v.string(),
		city: v.string(),
		country: v.string(),
		accessCode: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) {
			throw new Error('You must be signed in to register an agency.')
		}

		const existing = await ctx.db
			.query('agencies')
			.withIndex('by_owner', (q) => q.eq('ownerId', userId))
			.unique()
		if (existing) {
			throw new Error('This account is already linked to an agency.')
		}

		const accessCode = normalizeAccessCode(args.accessCode)
		const codeRow = await ctx.db
			.query('accessCodes')
			.withIndex('by_code', (q) => q.eq('code', accessCode))
			.unique()

		if (codeRow) {
			if (codeRow.usesRemaining <= 0) {
				throw new Error('Access code has no remaining uses.')
			}
			await ctx.db.patch(codeRow._id, {
				usesRemaining: codeRow.usesRemaining - 1,
			})
		} else if (!FALLBACK_VALID_CODES.has(accessCode)) {
			throw new Error(INVALID_ACCESS_CODE_MESSAGE)
		}

		return await ctx.db.insert('agencies', {
			ownerId: userId,
			name: args.name,
			website: args.website,
			phone: args.phone,
			brandColor: args.brandColor,
			logoFileName: args.logoFileName,
			logoStorageId: args.logoStorageId,
			street: args.street,
			number: args.number,
			zip: args.zip,
			city: args.city,
			country: args.country,
			accessCode,
			createdAt: Date.now(),
		})
	},
})

export const updateAgency = mutation({
	args: {
		name: v.optional(v.string()),
		website: v.optional(v.string()),
		phone: v.optional(v.string()),
		brandColor: v.optional(v.string()),
		logoFileName: v.optional(v.string()),
		logoStorageId: v.optional(v.id('_storage')),
		street: v.optional(v.string()),
		number: v.optional(v.string()),
		zip: v.optional(v.string()),
		city: v.optional(v.string()),
		country: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) {
			throw new Error('You must be signed in.')
		}

		const agency = await ctx.db
			.query('agencies')
			.withIndex('by_owner', (q) => q.eq('ownerId', userId))
			.unique()
		if (!agency) {
			throw new Error('No agency found for this account.')
		}

		const updates: Record<string, unknown> = {}
		for (const [key, value] of Object.entries(args)) {
			if (value !== undefined) {
				updates[key] = value
			}
		}

		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(agency._id, updates)
		}
	},
})

export const removeLogo = mutation({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) {
			throw new Error('You must be signed in.')
		}

		const agency = await ctx.db
			.query('agencies')
			.withIndex('by_owner', (q) => q.eq('ownerId', userId))
			.unique()
		if (!agency) {
			throw new Error('No agency found for this account.')
		}

		if (agency.logoStorageId) {
			await ctx.storage.delete(agency.logoStorageId)
		}
		await ctx.db.patch(agency._id, {
			logoStorageId: undefined,
			logoFileName: undefined,
		})
	},
})

export const myAgency = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return null
		const agency = await ctx.db
			.query('agencies')
			.withIndex('by_owner', (q) => q.eq('ownerId', userId))
			.unique()
		if (!agency) return null
		const logoUrl = agency.logoStorageId
			? await ctx.storage.getUrl(agency.logoStorageId)
			: null
		return { ...agency, logoUrl }
	},
})

export const currentUser = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx)
		if (!userId) return null
		return await ctx.db.get(userId)
	},
})
