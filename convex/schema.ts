import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
	...authTables,

	waitlist: defineTable({
		fullName: v.string(),
		email: v.string(),
		agencyName: v.string(),
		phone: v.optional(v.string()),
		referralSource: v.optional(v.string()),
		createdAt: v.number(),
	}).index('by_email', ['email']),

	agencies: defineTable({
		ownerId: v.id('users'),
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
		createdAt: v.number(),
	})
		.index('by_owner', ['ownerId'])
		.index('by_access_code', ['accessCode']),

	brands: defineTable({
		agencyId: v.id('agencies'),
		name: v.string(),
		status: v.union(
			v.literal('active'),
			v.literal('inactive'),
			v.literal('paused'),
		),
		website: v.optional(v.string()),
		createdAt: v.number(),

		onboardingStep: v.optional(v.number()),
		onboardingCompletedAt: v.optional(v.number()),

		importSource: v.optional(
			v.union(v.literal('website'), v.literal('brandbook')),
		),
		importedAt: v.optional(v.number()),
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

				// Deprecated single icon — superseded by iconStorageIds.
				iconStorageId: v.optional(v.id('_storage')),

				// Deprecated light/dark variants — kept for backward compatibility.
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

				// Deprecated combined imagery — superseded by the categories above.
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

				// Deprecated single example — superseded by samplePosts.
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
					channel: v.optional(
						v.union(
							v.literal('linkedin'),
							v.literal('instagram'),
							v.literal('facebook'),
						),
					),
				}),
			),
		),

		channels: v.optional(
			v.array(
				v.union(
					v.literal('linkedin'),
					v.literal('instagram'),
					v.literal('facebook'),
				),
			),
		),
		ingestKey: v.optional(v.string()),
		approvalPhone: v.optional(v.string()),
	})
		.index('by_agency', ['agencyId'])
		.index('by_ingest_key', ['ingestKey']),

	submissions: defineTable({
		brandId: v.optional(v.id('brands')),
		agencyId: v.id('agencies'),
		senderPhone: v.string(),
		senderName: v.optional(v.string()),
		messageBody: v.string(),
		imageStorageId: v.optional(v.id('_storage')),
		status: v.union(
			v.literal('pending'),
			v.literal('processing'),
			v.literal('published'),
			v.literal('rejected'),
		),
		approvalMessageId: v.optional(v.string()),
		rawPayload: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index('by_brand', ['brandId'])
		.index('by_agency', ['agencyId'])
		.index('by_status', ['status'])
		.index('by_approval_message', ['approvalMessageId']),

	brandPersonas: defineTable({
		brandId: v.id('brands'),
		channel: v.union(
			v.literal('linkedin'),
			v.literal('instagram'),
			v.literal('facebook'),
		),
		name: v.string(),
		shortDescription: v.optional(v.string()),
		gender: v.optional(v.string()),
		ageMin: v.optional(v.number()),
		ageMax: v.optional(v.number()),
		location: v.optional(v.string()),
		profession: v.optional(v.string()),
		goals: v.optional(v.string()),
		challenges: v.optional(v.string()),
		interests: v.optional(v.string()),
		order: v.number(),
		createdAt: v.number(),
	})
		.index('by_brand', ['brandId'])
		.index('by_brand_channel', ['brandId', 'channel']),

	brandContentBuckets: defineTable({
		brandId: v.id('brands'),
		channel: v.union(
			v.literal('linkedin'),
			v.literal('instagram'),
			v.literal('facebook'),
		),
		title: v.string(),
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
		order: v.number(),
		createdAt: v.number(),
	})
		.index('by_brand', ['brandId'])
		.index('by_brand_channel', ['brandId', 'channel']),

	accessCodes: defineTable({
		code: v.string(),
		usesRemaining: v.number(),
		createdAt: v.number(),
	}).index('by_code', ['code']),
})
