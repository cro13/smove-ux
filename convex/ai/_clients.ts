'use node'

import Anthropic from '@anthropic-ai/sdk'
import OpenAI, { toFile } from 'openai'

import type { Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'

export { toFile }
export type { Anthropic }

export const getAnthropicClient = () => {
	const apiKey = process.env.ANTHROPIC_API_KEY
	if (!apiKey) throw new Error('Anthropic is not configured.')
	return new Anthropic({ apiKey })
}

export const getOpenAIClient = () => {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) throw new Error('OpenAI is not configured.')
	return new OpenAI({ apiKey })
}

export const extractJson = (text: string): string => {
	const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
	if (fenced) return fenced[1].trim()
	const braceStart = text.indexOf('{')
	const braceEnd = text.lastIndexOf('}')
	if (braceStart !== -1 && braceEnd > braceStart) {
		return text.slice(braceStart, braceEnd + 1)
	}
	return text.trim()
}

export const fetchImageAsBase64 = async (
	ctx: ActionCtx,
	storageId: Id<'_storage'>,
): Promise<{ base64: string; mediaType: string }> => {
	const blob = await ctx.storage.get(storageId)
	if (!blob) throw new Error('Could not read image from storage.')
	const buffer = Buffer.from(await blob.arrayBuffer())
	const mediaType = blob.type || 'image/png'
	return { base64: buffer.toString('base64'), mediaType }
}
