'use node'

import { v } from 'convex/values'

import { api, internal } from '../_generated/api'
import { action } from '../_generated/server'

import {
	type Anthropic,
	extractJson,
	fetchImageAsBase64,
	getAnthropicClient,
} from './_clients'
import { buildDynamicElementsSchema } from './_helpers'
import {
	TEMPLATE_INTERPRETATION_SYSTEM,
	buildTemplateInterpretationUser,
} from './_prompts'

export const interpretTemplate = action({
	args: { brandId: v.id('brands') },
	handler: async (ctx, args) => {
		const brand = await ctx.runQuery(api.brands.getById, {
			brandId: args.brandId,
		})
		if (!brand) throw new Error('Not authorized.')
		if (!brand.postTemplate) {
			throw new Error('No post template configured.')
		}

		const anthropic = getAnthropicClient()
		const { base64, mediaType } = await fetchImageAsBase64(
			ctx,
			brand.postTemplate.imageStorageId,
		)

		const userMessage = buildTemplateInterpretationUser(
			brand.postTemplate.metadata,
		)

		const dynamicElementSchema = buildDynamicElementsSchema(
			brand.postTemplate.metadata,
		)

		const interpretationTool: Anthropic.Tool = {
			name: 'submit_template_interpretation',
			description:
				'Submit the complete template interpretation. Call this exactly once with the full analysis.',
			input_schema: {
				type: 'object' as const,
				properties: {
					visual_overview: {
						type: 'object',
						properties: {
							layout_structure: {
								type: 'string',
								description:
									'Describe the overall composition — proportions, spatial division, visual weight distribution.',
							},
							brand_vibe: {
								type: 'string',
								description:
									'Describe colors, typography, mood and professional tone as visible in the image.',
							},
							template_description: {
								type: 'string',
								description:
									'Complete description of the image as a whole, reading naturally from top to bottom / left to right. Tag dynamic elements inline as [dynamic: {layer_id} | {role}].',
							},
						},
						required: [
							'layout_structure',
							'brand_vibe',
							'template_description',
						],
					},
					content_concept: {
						type: 'object',
						properties: {
							format: {
								type: 'string',
								description:
									'Conceptual format: Myth-Rebuttal, Problem-Solution, Statement, Showcase, Quote, Before-After, Tips-List, or your own.',
							},
							narrative_logic: {
								type: 'string',
								description:
									'How the dynamic elements work together to deliver a message or tell a story. Focus on relationships, not current content.',
							},
						},
						required: ['format', 'narrative_logic'],
					},
					dynamic_elements: dynamicElementSchema,
				},
				required: [
					'visual_overview',
					'content_concept',
					'dynamic_elements',
				],
			},
		}

		const response = await anthropic.messages.create({
			model: 'claude-sonnet-4-6',
			max_tokens: 8192,
			system: TEMPLATE_INTERPRETATION_SYSTEM,
			tools: [interpretationTool],
			messages: [
				{
					role: 'user',
					content: [
						{
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
						},
						{ type: 'text', text: userMessage },
					],
				},
			],
		})

		const toolUse = response.content.find((b) => b.type === 'tool_use')
		let interpretationJson: string
		if (toolUse && toolUse.type === 'tool_use') {
			interpretationJson = JSON.stringify(toolUse.input)
		} else {
			const textBlock = response.content.find((b) => b.type === 'text')
			if (!textBlock || textBlock.type !== 'text') {
				throw new Error('No response from template interpretation.')
			}
			interpretationJson = extractJson(textBlock.text)
			JSON.parse(interpretationJson)
		}

		await ctx.runMutation(internal.brands.saveTemplateInterpretation, {
			brandId: args.brandId,
			interpretation: interpretationJson,
		})

		return { ok: true }
	},
})
