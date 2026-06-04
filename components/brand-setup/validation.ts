import type { Channel } from './types'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i
export const HEX_RE = /^#[0-9A-Fa-f]{6}$/

export function isValidEmail(v: string | undefined): boolean {
	if (!v) return false
	return EMAIL_RE.test(v.trim())
}

export function isValidUrl(v: string | undefined): boolean {
	if (!v) return false
	return URL_RE.test(v.trim())
}

export function isValidHex(v: string | undefined): boolean {
	if (!v) return false
	return HEX_RE.test(v.trim())
}

export function clampAge(value: string): string {
	const digitsOnly = value.replace(/\D/g, '')
	if (digitsOnly === '') return ''
	const n = parseInt(digitsOnly.slice(0, 2), 10)
	if (Number.isNaN(n)) return ''
	const clamped = Math.max(0, Math.min(99, n))
	return String(clamped)
}

export function nonEmpty(v: string | undefined): boolean {
	return Boolean(v && v.trim().length > 0)
}

export type StepValidator = {
	step: number
	isValid: boolean
	errors: Record<string, string>
}

export function validateStep1(data: {
	name?: string
	contactEmail?: string
}): StepValidator {
	const errors: Record<string, string> = {}
	if (!nonEmpty(data.name)) errors.name = 'Brand name is required'
	if (data.contactEmail && !isValidEmail(data.contactEmail)) {
		errors.contactEmail = 'Enter a valid email'
	}
	return { step: 1, errors, isValid: Object.keys(errors).length === 0 }
}

export function validateStep5(channels: Channel[] | undefined): StepValidator {
	const errors: Record<string, string> = {}
	if (!channels || channels.length === 0) {
		errors.channels = 'Pick at least one channel'
	}
	return { step: 5, errors, isValid: Object.keys(errors).length === 0 }
}
