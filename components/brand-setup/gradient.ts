import { isValidHex } from './validation'

export type GradientType = 'linear' | 'radial' | 'conic'

export type Gradient = {
	from: string
	to: string
	type?: GradientType
	angle?: number
}

const safe = (color: string, fallback: string) =>
	isValidHex(color) ? color : fallback

export function gradientCss(gradient: Gradient): string {
	const from = safe(gradient.from, '#2563EB')
	const to = safe(gradient.to, '#7C3AED')
	const angle = gradient.angle ?? 135

	switch (gradient.type ?? 'linear') {
		case 'radial':
			return `radial-gradient(circle at 30% 30%, ${from}, ${to})`
		case 'conic':
			return `conic-gradient(from ${angle}deg at 50% 50%, ${from}, ${to})`
		default:
			return `linear-gradient(${angle}deg, ${from}, ${to})`
	}
}

export const GRADIENT_TYPES: { value: GradientType; label: string }[] = [
	{ value: 'linear', label: 'Linear' },
	{ value: 'radial', label: 'Radial' },
	{ value: 'conic', label: 'Conic' },
]

export const ANGLE_PRESETS = [0, 45, 90, 135, 180, 225, 270, 315]
