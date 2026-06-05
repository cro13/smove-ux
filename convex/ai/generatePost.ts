'use node'

import { v } from 'convex/values'

import { api, internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import { action } from '../_generated/server'

import {
	extractJson,
	fetchImageAsBase64,
	getAnthropicClient,
	getOpenAIClient,
	toFile,
} from './_clients'
import {
	buildBrandContext,
	buildImagePrompt,
	dimensionsToSize,
	mediaTypeToSize,
	parseDimensions,
} from './_helpers'
import {
	CONCEPT_SYSTEM,
	COPY_REFINEMENT_SYSTEM,
} from './_prompts'

import type Anthropic from '@anthropic-ai/sdk'

export const generatePost = action({
	args: {
		submissionId: v.id('submissions'),
		brandId: v.id('brands'),
	},
	handler: async (ctx, args): Promise<{ ok: boolean; postId: string }> => {
		const brand = await ctx.runQuery(api.brands.getById, {
			brandId: args.brandId,
		})
		if (!brand) throw new Error('Not authorized.')

		const postId: Id<'generatedPosts'> = await ctx.runMutation(
			internal.generatedPosts.create,
			{
				submissionId: args.submissionId,
				brandId: args.brandId,
				status: 'analyzing',
			},
		)

		try {
			const submission = await ctx.runQuery(api.submissions.listByBrand, {
				brandId: args.brandId,
			})
			const sub = submission.find(
				(s: { _id: string }) => s._id === args.submissionId,
			)
			if (!sub) throw new Error('Submission not found.')

			if (!brand.postTemplate?.interpretation) {
				throw new Error(
					'Template interpretation is required. Run template analysis first.',
				)
			}

			const anthropic = getAnthropicClient()

			const userParts: Anthropic.ContentBlockParam[] = []

			if (sub.imageStorageId) {
				const { base64, mediaType } = await fetchImageAsBase64(
					ctx,
					sub.imageStorageId,
				)
				userParts.push({
					type: 'image',
					source: {
						type: 'base64',
						media_type: mediaType as
							| 'image/jpeg'
							| 'image/png'
							| 'image/gif'
							| 'image/webp',
						data: base64,
					},
				})
			}

			const conceptInput = [
				`SUBMISSION TEXT: ${sub.messageBody}`,
				'',
				`TEMPLATE INTERPRETATION:\n${brand.postTemplate.interpretation}`,
				'',
				brand.imageStyleAnalysis?.profile
					? `PHOTOGRAPHY STYLE PROFILE:\n${brand.imageStyleAnalysis.profile}`
					: '',
				'',
				`BRAND CONTEXT:\n${buildBrandContext(brand)}`,
			]
				.filter(Boolean)
				.join('\n')

			userParts.push({ type: 'text', text: conceptInput })

			const conceptResponse = await anthropic.messages.create({
				model: 'claude-sonnet-4-6',
				max_tokens: 4096,
				system: CONCEPT_SYSTEM,
				messages: [{ role: 'user', content: userParts }],
			})

			const conceptText = conceptResponse.content.find(
				(b) => b.type === 'text',
			)
			if (!conceptText || conceptText.type !== 'text') {
				throw new Error('No concept response from analysis.')
			}

			const analysisJson = extractJson(conceptText.text)
			const analysis = JSON.parse(analysisJson)

			await ctx.runMutation(internal.generatedPosts.update, {
				postId,
				status: 'generating_image',
				analysis: analysisJson,
			})

			const hasUserImage = !!sub.imageStorageId
			const imagePrompt = buildImagePrompt(
				analysis,
				brand.imageStyleAnalysis?.profile,
				brand.postTemplate.interpretation,
				{
					headlineFontName: brand.visualIdentity?.headlineFontName,
					sublineFontName: brand.visualIdentity?.sublineFontName,
					primaryColors: brand.visualIdentity?.primaryColors,
					secondaryColors: brand.visualIdentity?.secondaryColors,
				},
				hasUserImage,
			)

			const contentBuckets = await ctx.runQuery(
				api.brandContentBuckets.listByBrand,
				{ brandId: args.brandId },
			)
			const bucketMediaType = contentBuckets?.find(
				(b: { mediaType?: string }) => b.mediaType,
			)?.mediaType as string | undefined

			const size = mediaTypeToSize(bucketMediaType)
				?? (() => {
					const { width, height } = parseDimensions(
						brand.postTemplate.metadata,
					)
					return dimensionsToSize(width, height)
				})()

			const openai = getOpenAIClient()

			const inputImages = []

			if (brand.postTemplate.imageStorageId) {
				const templateBlob = await ctx.storage.get(
					brand.postTemplate.imageStorageId,
				)
				if (templateBlob) {
					const templateBuf = Buffer.from(
						await templateBlob.arrayBuffer(),
					)
					inputImages.push(
						await toFile(templateBuf, 'template.png', {
							type: 'image/png',
						}),
					)
				}
			}

			if (sub.imageStorageId) {
				const userBlob = await ctx.storage.get(sub.imageStorageId)
				if (userBlob) {
					const userBuf = Buffer.from(await userBlob.arrayBuffer())
					inputImages.push(
						await toFile(userBuf, 'user-photo.png', {
							type: userBlob.type || 'image/png',
						}),
					)
				}
			}

			let imageData: { b64_json?: string | null } | undefined

			if (inputImages.length > 0) {
				const editResponse = await openai.images.edit({
					model: 'gpt-image-2-2026-04-21',
					image: inputImages.length === 1
						? inputImages[0]
						: inputImages,
					prompt: imagePrompt,
					size,
				})
				imageData = editResponse.data?.[0]
			} else {
				const genResponse = await openai.images.generate({
					model: 'gpt-image-2-2026-04-21',
					prompt: imagePrompt,
					n: 1,
					size,
				})
				imageData = genResponse.data?.[0]
			}

			if (!imageData?.b64_json) {
				throw new Error('No image generated.')
			}

			const imageBuffer = Buffer.from(imageData.b64_json, 'base64')
			const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
			const generatedImageStorageId = await ctx.storage.store(imageBlob)

			await ctx.runMutation(internal.generatedPosts.update, {
				postId,
				status: 'generating_copy',
				generatedImageStorageId,
			})

			const voiceContext = brand.voice
				? [
						brand.voice.archetype
							? `Archetype: ${brand.voice.archetype}`
							: '',
						brand.voice.attributes?.length
							? `Attributes: ${brand.voice.attributes.join(', ')}`
							: '',
						brand.voice.formality
							? `Formality: ${brand.voice.formality}`
							: '',
						brand.voice.emojiUsage
							? `Emoji Usage: ${brand.voice.emojiUsage}`
							: '',
						brand.voice.wordsToUse?.length
							? `Words to Use: ${brand.voice.wordsToUse.join(', ')}`
							: '',
						brand.voice.wordsToAvoid?.length
							? `Words to Avoid: ${brand.voice.wordsToAvoid.join(', ')}`
							: '',
						brand.voice.samplePosts?.length
							? `Sample Posts:\n${brand.voice.samplePosts.join('\n---\n')}`
							: '',
					]
						.filter(Boolean)
						.join('\n')
				: ''

			const guardrailsContext = brand.guardrails
				? [
						brand.guardrails.topicsToAvoid?.length
							? `Topics to Avoid: ${brand.guardrails.topicsToAvoid.join(', ')}`
							: '',
						brand.guardrails.bannedClaims?.length
							? `Banned Claims: ${brand.guardrails.bannedClaims.join(', ')}`
							: '',
						brand.guardrails.mandatoryDisclaimers
							? `Mandatory Disclaimers: ${brand.guardrails.mandatoryDisclaimers}`
							: '',
					]
						.filter(Boolean)
						.join('\n')
				: ''

			const copyInput = [
				`CONCEPT:\n${conceptText.text}`,
				'',
				voiceContext ? `BRAND VOICE:\n${voiceContext}` : '',
				guardrailsContext ? `GUARDRAILS:\n${guardrailsContext}` : '',
			]
				.filter(Boolean)
				.join('\n')

			const copyResponse = await anthropic.messages.create({
				model: 'claude-sonnet-4-6',
				max_tokens: 2048,
				system: COPY_REFINEMENT_SYSTEM,
				messages: [{ role: 'user', content: copyInput }],
			})

			const copyText = copyResponse.content.find(
				(b) => b.type === 'text',
			)
			if (!copyText || copyText.type !== 'text') {
				throw new Error('No copy response from refinement.')
			}

			await ctx.runMutation(internal.generatedPosts.update, {
				postId,
				status: 'completed',
				generatedCopy: copyText.text,
			})

			return { ok: true, postId }
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Unknown error'
			await ctx.runMutation(internal.generatedPosts.update, {
				postId,
				status: 'failed',
				error: message,
			})
			throw err
		}
	},
})
