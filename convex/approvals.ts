import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalMutation, internalQuery } from './_generated/server'

export const sendForApproval = action({
	args: { submissionId: v.id('submissions') },
	handler: async (ctx, args) => {
		const submission = await ctx.runQuery(
			internal.approvals.getSubmissionWithBrand,
			{ submissionId: args.submissionId },
		)

		if (!submission) throw new Error('Submission not found.')
		if (!submission.approvalPhone) {
			throw new Error('No approval contact configured for this brand.')
		}

		let imageUrl: string | undefined
		if (submission.imageStorageId) {
			imageUrl = await ctx.storage.getUrl(submission.imageStorageId) ?? undefined
		}

		const baseUrl = process.env.WHAPI_BASE_URL ?? 'https://gate.whapi.cloud'
		const token = process.env.WHAPI_API_TOKEN
		if (!token) throw new Error('WHAPI_API_TOKEN not configured.')

		const bodyText = [
			`New content for approval:`,
			'',
			submission.messageBody,
			'',
			`From: ${submission.senderName || submission.senderPhone}`,
		].join('\n')

		const payload: Record<string, unknown> = {
			to: `${submission.approvalPhone}@s.whatsapp.net`,
			type: 'button',
			body: { text: bodyText },
			action: {
				buttons: [
					{ type: 'quick_reply', title: 'Approve', id: `approve_${args.submissionId}` },
					{ type: 'quick_reply', title: 'Reject', id: `reject_${args.submissionId}` },
				],
			},
		}

		if (imageUrl) {
			payload.media = imageUrl
		}

		const res = await fetch(`${baseUrl}/messages/interactive`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		})

		if (!res.ok) {
			const errorBody = await res.text()
			throw new Error(`Failed to send approval message: ${res.status} ${errorBody}`)
		}

		const result = await res.json()
		const messageId = result.message_id ?? result.id ?? undefined

		await ctx.runMutation(internal.approvals.markSentForApproval, {
			submissionId: args.submissionId,
			approvalMessageId: messageId,
		})

		return { success: true, messageId }
	},
})

export const getSubmissionWithBrand = internalQuery({
	args: { submissionId: v.id('submissions') },
	handler: async (ctx, args) => {
		const submission = await ctx.db.get(args.submissionId)
		if (!submission) return null

		let approvalPhone: string | undefined
		if (submission.brandId) {
			const brand = await ctx.db.get(submission.brandId)
			approvalPhone = brand?.approvalPhone
		}

		return { ...submission, approvalPhone }
	},
})

export const markSentForApproval = internalMutation({
	args: {
		submissionId: v.id('submissions'),
		approvalMessageId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.submissionId, {
			status: 'processing',
			approvalMessageId: args.approvalMessageId,
		})
	},
})

export const handleApprovalReply = internalMutation({
	args: {
		buttonId: v.string(),
	},
	handler: async (ctx, args) => {
		let id = args.buttonId
		const colonIdx = id.indexOf(':')
		if (colonIdx !== -1) {
			id = id.slice(colonIdx + 1)
		}

		let action: string
		let submissionId: string
		if (id.startsWith('approve_')) {
			action = 'approve'
			submissionId = id.slice('approve_'.length)
		} else if (id.startsWith('reject_')) {
			action = 'reject'
			submissionId = id.slice('reject_'.length)
		} else {
			return
		}

		if (!submissionId) return

		const submission = await ctx.db.get(submissionId as any)
		if (!submission || submission.status !== 'processing') return

		const newStatus = action === 'approve' ? 'published' : 'rejected'
		await ctx.db.patch(submission._id, { status: newStatus as any })
	},
})
