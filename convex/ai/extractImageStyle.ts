'use node'

import { v } from 'convex/values'

import { api, internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import { action } from '../_generated/server'

import {
	type Anthropic,
	extractJson,
	fetchImageAsBase64,
	getAnthropicClient,
} from './_clients'
import {
	STYLE_EXTRACTION_SYSTEM,
	STYLE_EXTRACTION_USER,
} from './_prompts'

export const extractImageStyle = action({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const brand = await ctx.runQuery(api.brands.getById, {
			brandId: args.brandId,
		})
		if (!brand) throw new Error('Not authorized.')

		const photoIds =
			brand.visualIdentity?.photographyStorageIds ??
			brand.visualIdentity?.imageryStorageIds ??
			[]
		if (photoIds.length === 0) {
			throw new Error('No photography assets found for this brand.')
		}

		const anthropic = getAnthropicClient()

		const imageContents = await Promise.all(
			photoIds.map(async (id: Id<'_storage'>) => {
				const { base64, mediaType } = await fetchImageAsBase64(ctx, id)
				return {
					type: 'image' as const,
					source: {
						type: 'base64' as const,
						media_type: mediaType as
							| 'image/jpeg'
							| 'image/png'
							| 'image/gif'
							| 'image/webp',
						data: base64,
					},
				}
			}),
		)

		const styleProfileTool: Anthropic.Tool = {
			name: 'submit_style_profile',
			description:
				'Submit the extracted photography style profile. Call this exactly once with the complete extraction.',
			input_schema: {
				type: 'object' as const,
				properties: {
					aesthetic_signature: {
						type: 'string',
						description:
							"One-line characterization in working-photographer telegram style. Comma-separated precise phrases, NOT prose paragraphs. Example: 'Soft late-afternoon window light with warm key against cool ambient fill, shallow 85mm separation, subjects caught mid-gesture through environmental obstruction, Fuji Superia color memory.'",
					},
					dominant_aesthetic: {
						type: 'string',
						description:
							"Compact aesthetic naming, ideally referencing the photographic tradition or named photographers. Example: 'Hyper-real constructed tableau — pop-surrealist commercial photography in the Ryan Schude / David LaChapelle register'.",
					},
					lighting: {
						type: 'object',
						properties: {
							type: {
								type: 'string',
								description:
									"Source character in dense photographer language, single phrase. E.g. 'Hard direct sunlight under clear sky, unmodified solar source'.",
							},
							direction: {
								type: 'string',
								description:
									"Where light comes from and how it falls. Single dense phrase. E.g. 'High overhead to 45° front-side'.",
							},
							quality: {
								type: 'string',
								description:
									"Hard/soft, contrast ratio, falloff. Single dense phrase. E.g. 'Soft wraparound from large diffuser, 1.5:1 ratio, gradual falloff'.",
							},
							notable: {
								type: 'string',
								description:
									"The defining lighting quirk that makes this look. ONE specific signal. E.g. 'Deliberate solar lens flare as compositional accent'.",
							},
						},
						required: ['type', 'direction', 'quality', 'notable'],
					},
					camera: {
						type: 'object',
						properties: {
							lens: {
								type: 'string',
								description:
									"ONE specific focal length and aperture. E.g. '85mm f/1.4', '35mm f/2'.",
							},
							focus: {
								type: 'string',
								description:
									"DOF character and focus behavior. Single dense phrase. E.g. 'Shallow with creamy bokeh falloff, focus plane on eyes only'.",
							},
							angle: {
								type: 'string',
								description:
									"Camera-subject relationship and framing. E.g. 'Eye level to slightly elevated, observational distance'.",
							},
						},
						required: ['lens', 'focus', 'angle'],
					},
					mood: {
						type: 'string',
						description:
							"Coherent emotional frequency. Adjectives and short phrases, NOT prose. E.g. 'Observational, intimate, raw'. The actual emotional register, not 'professional' or 'nice'.",
					},
					color_grading: {
						type: 'object',
						properties: {
							temperature: {
								type: 'string',
								description:
									"Warm/cool/neutral with specifics. E.g. 'Warm-biased highlights at ~5800K, neutral-to-cool shadow fill from blue sky'.",
							},
							tonal_style: {
								type: 'string',
								description:
									"Tonal handling and contrast character. E.g. 'Crushed blacks, blown highlights, hard filmic curve'.",
							},
							saturation: {
								type: 'string',
								description:
									"Saturation behavior with specifics. E.g. 'Hyper-saturated primaries boosted 30-40% above neutral, Ektar 100 level punch'.",
							},
						},
						required: ['temperature', 'tonal_style', 'saturation'],
					},
					film_stock: {
						type: 'object',
						properties: {
							type: {
								type: 'string',
								description:
									"Specific named camera/film. E.g. 'Kodak Portra 400 35mm' or 'Fujifilm X-100 VI'.",
							},
							grain: {
								type: 'string',
								description:
									"Physical grain/noise description. E.g. 'Absent — ultra-clean sensor with zero visible noise'.",
							},
							finish: {
								type: 'string',
								description:
									"Surface finish character. E.g. 'Matte editorial flat, magazine reproduction look'.",
							},
						},
						required: ['type', 'grain', 'finish'],
					},
					texture: {
						type: 'object',
						properties: {
							materiality: {
								type: 'string',
								description:
									"How surfaces and materials read. E.g. 'Ultra-resolved surface detail at forensic sharpness'.",
							},
							subject_specific: {
								type: 'string',
								description:
									"Texture treatment patterns for recurring subject categories without naming specific subjects. E.g. 'Micro-contrast enhancement on sunlit surfaces, crisp shadow transitions'.",
							},
						},
						required: ['materiality', 'subject_specific'],
					},
					imperfection_signals: {
						type: 'string',
						description:
							"Compact list of imperfection signals. E.g. 'Deliberate controlled solar lens flare as stylistic accent, slight atmospheric haze in deep background planes'.",
					},
					avoid: {
						type: 'string',
						description:
							"Comma-separated list of anti-patterns combining universal and aesthetic-specific. E.g. 'Shallow depth of field, muted or desaturated color palettes, moody or dark low-key lighting, visible film grain'.",
					},
				},
				required: [
					'aesthetic_signature',
					'dominant_aesthetic',
					'lighting',
					'camera',
					'mood',
					'color_grading',
					'film_stock',
					'texture',
					'imperfection_signals',
					'avoid',
				],
			},
		}

		const response = await anthropic.messages.create({
			model: 'claude-sonnet-4-6',
			max_tokens: 16000,
			system: STYLE_EXTRACTION_SYSTEM,
			tools: [styleProfileTool],
			messages: [
				{
					role: 'user',
					content: [
						...imageContents,
						{ type: 'text', text: STYLE_EXTRACTION_USER },
					],
				},
			],
		})

		const toolUse = response.content.find((b) => b.type === 'tool_use')
		if (!toolUse || toolUse.type !== 'tool_use') {
			const textBlock = response.content.find((b) => b.type === 'text')
			if (textBlock && textBlock.type === 'text') {
				const profileJson = extractJson(textBlock.text)
				JSON.parse(profileJson)
				await ctx.runMutation(internal.brands.saveImageStyleAnalysis, {
					brandId: args.brandId,
					profile: profileJson,
					analyzedImageCount: photoIds.length,
				})
				return { ok: true }
			}
			throw new Error('No style profile returned from extraction.')
		}

		const profileJson = JSON.stringify(toolUse.input)

		await ctx.runMutation(internal.brands.saveImageStyleAnalysis, {
			brandId: args.brandId,
			profile: profileJson,
			analyzedImageCount: photoIds.length,
		})

		return { ok: true }
	},
})
