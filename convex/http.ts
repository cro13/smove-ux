import { httpRouter } from 'convex/server'

import { internal } from './_generated/api'
import { httpAction } from './_generated/server'
import { auth } from './auth'

const http = httpRouter()

auth.addHttpRoutes(http)

http.route({
	path: '/whapi/webhook',
	method: 'POST',
	handler: httpAction(async (ctx, request) => {
		const body = await request.json()

		const messages = body.messages ?? []
		if (messages.length === 0) {
			return new Response(JSON.stringify({ status: 'ignored' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		for (const msg of messages) {
			if (msg.from_me) continue

			const buttonId = msg.reply?.buttons_reply?.id ?? ''
			if (buttonId.includes('approve_') || buttonId.includes('reject_')) {
				await ctx.runMutation(internal.approvals.handleApprovalReply, {
					buttonId,
				})
				continue
			}

			const senderPhone =
				msg.from ?? msg.chat_id?.split('@')[0] ?? 'unknown'
			const senderName = msg.from_name ?? undefined

			const text = extractText(msg)
			const { brandKey, messageBody } = parseBrandKey(text)

			if (!brandKey) continue

			const brandLookup = await ctx.runQuery(
				internal.submissions.lookupBrandByIngestKey,
				{ ingestKey: brandKey },
			)

			if (!brandLookup) continue

			let imageStorageId: string | undefined
			if (msg.type === 'image' || msg.type === 'video') {
				const media = msg[msg.type]
				const mediaUrl = media?.link ?? buildMediaUrl(media?.id)
				if (mediaUrl) {
					imageStorageId = await downloadAndStore(ctx, mediaUrl)
				}
			}

			await ctx.runMutation(internal.submissions.createFromWebhook, {
				brandId: brandLookup.brandId,
				agencyId: brandLookup.agencyId,
				senderPhone,
				senderName,
				messageBody: messageBody || '(no text)',
				imageStorageId: imageStorageId as any,
				rawPayload: JSON.stringify(msg).slice(0, 4000),
			})
		}

		return new Response(JSON.stringify({ status: 'ok' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})
	}),
})

function extractText(msg: any): string {
	if (msg.type === 'image' && msg.image?.caption) return msg.image.caption
	if (msg.type === 'video' && msg.video?.caption) return msg.video.caption
	if (msg.type === 'text' && msg.text?.body) return msg.text.body
	if (msg.type === 'document' && msg.document?.caption)
		return msg.document.caption
	return ''
}

function parseBrandKey(text: string): {
	brandKey: string
	messageBody: string
} {
	const colonIndex = text.indexOf(':')
	if (colonIndex === -1 || colonIndex > 20) {
		return { brandKey: '', messageBody: text }
	}
	const potentialKey = text.slice(0, colonIndex).trim()
	if (/^[A-Za-z0-9_-]+$/.test(potentialKey)) {
		return {
			brandKey: potentialKey.toUpperCase(),
			messageBody: text.slice(colonIndex + 1).trim(),
		}
	}
	return { brandKey: '', messageBody: text }
}

function buildMediaUrl(mediaId: string | undefined): string | undefined {
	if (!mediaId) return undefined
	const baseUrl = process.env.WHAPI_BASE_URL ?? 'https://gate.whapi.cloud'
	return `${baseUrl}/media/${mediaId}`
}

async function downloadAndStore(
	ctx: any,
	url: string,
): Promise<string | undefined> {
	try {
		const token = process.env.WHAPI_API_TOKEN
		const headers: Record<string, string> = {}
		if (token && url.includes('gate.whapi.cloud')) {
			headers['Authorization'] = `Bearer ${token}`
		}
		const res = await fetch(url, { headers })
		if (!res.ok) return undefined
		const blob = await res.blob()
		return await ctx.storage.store(blob)
	} catch {
		return undefined
	}
}

export default http
