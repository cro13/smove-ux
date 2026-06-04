'use node'

import { GoogleGenAI, Type } from '@google/genai'
import { v } from 'convex/values'

import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { action, type ActionCtx } from './_generated/server'

type BrandfetchFormat = { src?: string; format?: string }
type BrandfetchLogo = { type?: string; formats?: BrandfetchFormat[] }
type BrandfetchColor = { hex?: string; type?: string }
type BrandfetchFont = { name?: string; type?: string }
type BrandfetchResponse = {
	domain?: string
	description?: string
	longDescription?: string
	logos?: BrandfetchLogo[]
	colors?: BrandfetchColor[]
	fonts?: BrandfetchFont[]
}

const normalizeDomain = (input: string): string =>
	input
		.trim()
		.replace(/^https?:\/\//i, '')
		.replace(/^www\./i, '')
		.split('/')[0]
		.toLowerCase()

const pickLogo = (
	bf: BrandfetchResponse,
	type: string,
): BrandfetchLogo | undefined => bf.logos?.find((l) => l.type === type)

const storeRemoteImage = async (
	ctx: ActionCtx,
	logo?: BrandfetchLogo,
): Promise<Id<'_storage'> | undefined> => {
	const formats = logo?.formats ?? []
	const chosen =
		formats.find((f) => f.format === 'png') ??
		formats.find((f) => f.format === 'svg') ??
		formats.find((f) => f.format === 'webp') ??
		formats[0]
	if (!chosen?.src) return undefined
	try {
		const res = await fetch(chosen.src)
		if (!res.ok) return undefined
		const blob = await res.blob()
		return await ctx.storage.store(blob)
	} catch {
		return undefined
	}
}

const dedupe = (values: (string | undefined)[]): string[] => [
	...new Set(values.filter((value): value is string => Boolean(value))),
]

export const importFromWebsite = action({
	args: { brandId: v.id('brands'), domain: v.string() },
	handler: async (ctx, args) => {
		const brand = await ctx.runQuery(api.brands.getById, {
			brandId: args.brandId,
		})
		if (!brand) throw new Error('Not authorized.')

		const apiKey = process.env.BRANDFETCH_API_KEY
		if (!apiKey) throw new Error('Brandfetch is not configured.')

		const domain = normalizeDomain(args.domain)
		if (!domain) throw new Error('Enter a valid website or domain.')

		const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
			headers: { Authorization: `Bearer ${apiKey}` },
		})
		if (!res.ok) {
			throw new Error(`Could not find brand data for ${domain}.`)
		}
		const bf = (await res.json()) as BrandfetchResponse

		const [logoStorageId, iconStorageId] = await Promise.all([
			storeRemoteImage(ctx, pickLogo(bf, 'logo')),
			storeRemoteImage(
				ctx,
				pickLogo(bf, 'icon') ?? pickLogo(bf, 'symbol'),
			),
		])

		const primaryColors = dedupe(
			(bf.colors ?? [])
				.filter((c) => c.type === 'accent' || c.type === 'brand')
				.map((c) => c.hex),
		).slice(0, 4)
		const secondaryColors = dedupe(
			(bf.colors ?? [])
				.filter((c) => c.type === 'dark' || c.type === 'light')
				.map((c) => c.hex),
		).slice(0, 4)

		await ctx.runMutation(internal.brands.applyImport, {
			brandId: args.brandId,
			source: 'website',
			website: bf.domain ? `https://${bf.domain}` : undefined,
			companyProfile: {
				coreIdentity: bf.longDescription ?? bf.description ?? undefined,
			},
			visualIdentity: {
				logoStorageId,
				iconStorageIds: iconStorageId ? [iconStorageId] : undefined,
				primaryColors: primaryColors.length ? primaryColors : undefined,
				secondaryColors: secondaryColors.length
					? secondaryColors
					: undefined,
				headlineFontName: bf.fonts?.find((f) => f.type === 'title')?.name,
				sublineFontName: bf.fonts?.find((f) => f.type === 'body')?.name,
			},
		})

		return { ok: true }
	},
})

const ARCHETYPE_IDS = [
	'outlaw',
	'magician',
	'hero',
	'lover',
	'jester',
	'everyman',
	'caregiver',
	'ruler',
	'creator',
	'innocent',
	'sage',
	'explorer',
] as const

const LANGUAGE_CODES = [
	'en-US',
	'en-GB',
	'de',
	'fr',
	'es',
	'it',
	'pt',
	'nl',
] as const

const FIELDS_OF_BUSINESS = [
	'SaaS',
	'E-commerce',
	'Fintech',
	'Healthcare',
	'Education',
	'Marketing & Advertising',
	'Real Estate',
	'Fashion',
	'Food & Beverage',
	'Travel & Hospitality',
	'Manufacturing',
	'Consulting',
	'Non-profit',
	'Other',
] as const

const POV_VALUES = ['we', 'you', 'i', 'mixed'] as const
const FORMALITY_VALUES = ['casual', 'balanced', 'formal'] as const
const EMOJI_VALUES = ['none', 'minimal', 'frequent'] as const

type ExtractedColor = {
	name?: string
	hex?: string
	rgb?: string
	cmyk?: string
	pantone?: string
	estimatedHex?: string
}

type ExtractedBrand = {
	name?: string
	generalInfo?: {
		language?: string
		location?: string
		contactName?: string
		contactEmail?: string
	}
	companyProfile?: {
		fieldOfBusiness?: string
		coreIdentity?: string
		coreMessage?: string
		tagline?: string
		mission?: string
		vision?: string
		values?: string[]
		products?: string[]
		reasonsToBelieve?: string[]
		keyMessages?: string[]
	}
	visualIdentity?: {
		primaryColors?: ExtractedColor[]
		secondaryColors?: ExtractedColor[]
		headlineFontName?: string
		sublineFontName?: string
	}
	voice?: {
		archetype?: string
		attributes?: string[]
		pointOfView?: string
		formality?: string
		emojiUsage?: string
		wordsToUse?: string[]
		wordsToAvoid?: string[]
		samplePosts?: string[]
	}
	guardrails?: {
		topicsToAvoid?: string[]
		bannedClaims?: string[]
		mandatoryDisclaimers?: string
	}
}

const str = (value?: string): string | undefined => value?.trim() || undefined
const arr = (value?: string[]): string[] | undefined =>
	value && value.length ? value.filter(Boolean) : undefined

const channel = (n: number): string =>
	Math.min(255, Math.max(0, Math.round(n)))
		.toString(16)
		.padStart(2, '0')
		.toUpperCase()

const fromRgb = (r: number, g: number, b: number): string =>
	`#${channel(r)}${channel(g)}${channel(b)}`

const normalizeHex = (value?: string): string | undefined => {
	const match = value?.match(/[0-9a-f]{6}|[0-9a-f]{3}/i)
	if (!match) return undefined
	const hex = match[0]
	const full =
		hex.length === 3
			? hex
					.split('')
					.map((c) => c + c)
					.join('')
			: hex
	return `#${full.toUpperCase()}`
}

const rgbToHex = (value?: string): string | undefined => {
	const nums = value?.match(/\d+(?:\.\d+)?/g)
	if (!nums || nums.length < 3) return undefined
	const [r, g, b] = nums.slice(0, 3).map(Number)
	return fromRgb(r, g, b)
}

const cmykToHex = (value?: string): string | undefined => {
	const nums = value?.match(/\d+(?:\.\d+)?/g)
	if (!nums || nums.length < 4) return undefined
	const parts = nums.slice(0, 4).map(Number)
	const scale = parts.some((n) => n > 1) ? 100 : 1
	const [c, m, y, k] = parts.map((n) => n / scale)
	return fromRgb(
		255 * (1 - c) * (1 - k),
		255 * (1 - m) * (1 - k),
		255 * (1 - y) * (1 - k),
	)
}

const colorToHex = (color?: ExtractedColor): string | undefined =>
	normalizeHex(color?.hex) ??
	rgbToHex(color?.rgb) ??
	cmykToHex(color?.cmyk) ??
	normalizeHex(color?.estimatedHex)

const colorArr = (colors?: ExtractedColor[]): string[] | undefined => {
	if (!colors || !colors.length) return undefined
	const seen = new Set<string>()
	const out: string[] = []
	for (const color of colors) {
		const hex = colorToHex(color)
		if (hex && !seen.has(hex)) {
			seen.add(hex)
			out.push(hex)
		}
	}
	return out.length ? out : undefined
}
const pickEnum = (
	value: string | undefined,
	allowed: readonly string[],
): string | undefined => (value && allowed.includes(value) ? value : undefined)

const stringArray = (description?: string) => ({
	type: Type.ARRAY,
	items: { type: Type.STRING },
	...(description ? { description } : {}),
})

const enumString = (allowed: readonly string[], description: string) => ({
	type: Type.STRING,
	enum: [...allowed],
	description,
})

const colorArray = (description: string) => ({
	type: Type.ARRAY,
	description,
	items: {
		type: Type.OBJECT,
		properties: {
			name: {
				type: Type.STRING,
				description:
					'Color name or label exactly as shown (e.g. "Lindt Gold", "Marineblau", "UCC Red"). Omit only if the swatch is truly unlabeled.',
			},
			hex: {
				type: Type.STRING,
				description:
					'HEX exactly as printed for this swatch (e.g. "#1A2B3C"). Omit if no HEX appears next to this color.',
			},
			rgb: {
				type: Type.STRING,
				description:
					'RGB exactly as printed, three numbers in R,G,B order (e.g. "26, 43, 60" or "R26 G43 B60"). Omit if not printed.',
			},
			cmyk: {
				type: Type.STRING,
				description:
					'CMYK exactly as printed, four numbers in C,M,Y,K order (e.g. "80, 60, 40, 20" or "C80 M60 Y40 K20"). Omit if not printed.',
			},
			pantone: {
				type: Type.STRING,
				description:
					'Pantone/PMS reference exactly as printed (e.g. "Pantone 286 C", "PMS 2945 C"). Include it even when other notations exist. Omit if not printed.',
			},
			estimatedHex: {
				type: Type.STRING,
				description:
					'REQUIRED whenever no printed hex is available for this swatch. Compute the 6-digit "#RRGGBB" hex: convert from the printed RGB if present (most accurate), else from the printed CMYK, else the closest Pantone match. This guarantees every swatch resolves to a hex. Omit only when the hex field is already filled.',
			},
		},
	},
})

const EXTRACTION_SCHEMA = {
	type: Type.OBJECT,
	properties: {
		name: {
			type: Type.STRING,
			description:
				'The brand or company name as it should be displayed. Prefer the concise everyday name over a long legal name.',
		},
		generalInfo: {
			type: Type.OBJECT,
			properties: {
				language: enumString(
					LANGUAGE_CODES,
					'Primary communication language as a locale code.',
				),
				location: {
					type: Type.STRING,
					description: 'Headquarters location as "City, Country".',
				},
				contactName: { type: Type.STRING },
				contactEmail: { type: Type.STRING },
			},
		},
		companyProfile: {
			type: Type.OBJECT,
			properties: {
				fieldOfBusiness: enumString(
					FIELDS_OF_BUSINESS,
					'Closest matching industry category.',
				),
				coreIdentity: {
					type: Type.STRING,
					description: 'Who the brand is and what it does.',
				},
				coreMessage: {
					type: Type.STRING,
					description: 'The central message of the brand.',
				},
				tagline: {
					type: Type.STRING,
					description: 'Brand tagline or claim.',
				},
				mission: { type: Type.STRING },
				vision: { type: Type.STRING },
				values: stringArray('Brand values, one per item.'),
				products: stringArray('Products or services offered.'),
				reasonsToBelieve: stringArray(
					'Proof points or reasons customers trust the brand.',
				),
				keyMessages: stringArray('Short, repeatable supporting claims.'),
			},
		},
		visualIdentity: {
			type: Type.OBJECT,
			properties: {
				primaryColors: colorArray(
					'The core/main brand palette — colors the document presents as primary, main, or mandatory brand colors (e.g. "Markenfarben", "Primary", "mandatory reference colours"). One entry per distinct swatch. Exclude percentage tint/shade variations of a base color.',
				),
				secondaryColors: colorArray(
					'Accent, supporting, sub-brand, or product palette swatches — anything marked secondary/accent or explicitly NOT part of the core brand palette (e.g. WYLD\'s "Produktfarben"). One entry per distinct swatch. Exclude percentage tint/shade variations of a base color.',
				),
				headlineFontName: { type: Type.STRING },
				sublineFontName: { type: Type.STRING },
			},
		},
		voice: {
			type: Type.OBJECT,
			properties: {
				archetype: enumString(
					ARCHETYPE_IDS,
					'Best-fitting brand archetype id.',
				),
				attributes: stringArray('Adjectives describing the tone of voice.'),
				pointOfView: enumString(
					POV_VALUES,
					'Narrative point of view used in copy.',
				),
				formality: enumString(FORMALITY_VALUES, 'Overall formality level.'),
				emojiUsage: enumString(EMOJI_VALUES, 'How often emojis are used.'),
				wordsToUse: stringArray('Preferred words or phrases.'),
				wordsToAvoid: stringArray('Words or phrases to avoid.'),
				samplePosts: stringArray(
					'Verbatim example copy that demonstrates the tone of voice.',
				),
			},
		},
		guardrails: {
			type: Type.OBJECT,
			properties: {
				topicsToAvoid: stringArray('Topics the brand must not discuss.'),
				bannedClaims: stringArray('Claims that must never be made.'),
				mandatoryDisclaimers: {
					type: Type.STRING,
					description: 'Legal lines that must appear on relevant content.',
				},
			},
		},
	},
}

const EXTRACTION_PROMPT = `You are extracting a brand's guidelines from the attached brand book PDF to prefill an onboarding form.

Work through the ENTIRE document, every page, before answering. Brand books place information in dedicated sections that can appear anywhere — colors, typography, and messaging are often deep in the middle or in an appendix, not near the front. Read text in tables, captions, swatch labels, callout boxes, and inline prose, not just headings and body paragraphs. The document may be in any language (English, German, French, etc.).

General rules:
- Only populate a field when the document gives clear evidence for it. Omit anything you are unsure about instead of guessing — EXCEPT colors, where you must always resolve a hex (see the COLORS protocol below).
- Ignore placeholder and dummy text such as "Lorem ipsum". Never extract it as values, sample posts, or messages.
- Preserve the document's original language for every free-text value (do not translate). Fields with a fixed set of allowed values are the only exception: always return one of the allowed values.
- Detect the brand's primary communication language from the language the document itself is written in, and map it to the closest allowed locale.

COLORS protocol (highest priority — do not skip a defined color):
- Find every color the brand defines. Color definitions appear in several layouts: (a) swatch grids with the name and value notations stacked beneath each swatch, (b) value notations listed without a name next to a colored block, and (c) inline in prose, e.g. "Lindt Gold: Pantone 872C / CMYK 10 30 70 10 / RGB 204 176 98". Capture colors from ALL of these layouts.
- A swatch is valid even if only ONE notation is printed. Brand books very often omit some systems — many print only CMYK + Pantone, or only RGB, and never print a HEX at all. Never drop a color just because its HEX (or any other notation) is missing.
- For each color, fill every notation that IS printed for that exact swatch, in its own field: hex, rgb (R,G,B), cmyk (C,M,Y,K), pantone. Leave a field empty only when that notation is not printed. Read the numbers carefully even when crowded or low-contrast; if a value is clearly mangled or incomplete, omit just that one field rather than guessing.
- Always make the color resolvable to a hex. If a printed HEX exists, put it in hex. If NOT, you MUST fill estimatedHex with a computed 6-digit "#RRGGBB": convert from the printed RGB when available (most accurate), otherwise from the printed CMYK, otherwise the closest match to the Pantone. estimatedHex is mandatory for every swatch that lacks a printed hex.
- Sort colors: put the core/main/mandatory brand palette in primaryColors, and accent / supporting / sub-brand / product colors (anything the document marks as secondary or explicitly NOT part of the main brand palette) in secondaryColors. When in doubt, prefer primaryColors.
- One entry per distinct color. Do NOT create separate entries for percentage tints/shades (e.g. "60%", "Black 40%") of a color already listed.

Other field guidance:
- name: the brand/company name shown on the cover or in the logo (prefer the short everyday name, e.g. an acronym, over the full legal name).
- coreIdentity: the brand essence / "who and what we are" statement (e.g. a "Markenessenz" section).
- mission: the brand's purpose or "why" (e.g. the WHY of a Golden Circle).
- values: guiding principles or value pillars (e.g. the HOW pillars of a Golden Circle, or a list like "Flexibility | Quality | Modularity").
- products: concrete offerings or "what we do" items (e.g. the WHAT of a Golden Circle).
- attributes: tone-of-voice adjectives, including the positive "Dos" of any tonality section.
- pointOfView: infer from how the brand refers to itself (e.g. "Wir"/"We" implies "we").
- Fonts: return the font family name (e.g. "Poppins") for the headline and body/subline fonts.`

export const importFromBrandBook = action({
	args: { brandId: v.id('brands'), storageId: v.id('_storage') },
	handler: async (ctx, args) => {
		const brand = await ctx.runQuery(api.brands.getById, {
			brandId: args.brandId,
		})
		if (!brand) throw new Error('Not authorized.')

		const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
		if (!apiKey) throw new Error('Gemini is not configured.')

		const blob = await ctx.storage.get(args.storageId)
		if (!blob) throw new Error('Could not read the uploaded file.')
		const base64 = Buffer.from(await blob.arrayBuffer()).toString('base64')

		const ai = new GoogleGenAI({ apiKey })
		const response = await ai.models.generateContent({
			model: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash',
			contents: [
				{
					role: 'user',
					parts: [
						{
							inlineData: {
								mimeType: 'application/pdf',
								data: base64,
							},
						},
						{ text: EXTRACTION_PROMPT },
					],
				},
			],
			config: {
				temperature: 0,
				responseMimeType: 'application/json',
				responseSchema: EXTRACTION_SCHEMA,
			},
		})

		const text = response.text
		console.log('[brandImport] Gemini raw response', {
			brandId: args.brandId,
			model: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash',
			usage: response.usageMetadata,
			text,
		})
		if (!text) throw new Error('Could not extract brand details.')

		let data: ExtractedBrand
		try {
			data = JSON.parse(text) as ExtractedBrand
		} catch {
			throw new Error('Could not parse the extracted brand details.')
		}

		const general = data.generalInfo ?? {}
		const profile = data.companyProfile ?? {}
		const visual = data.visualIdentity ?? {}
		const voice = data.voice ?? {}
		const guardrails = data.guardrails ?? {}

		await ctx.runMutation(internal.brands.applyImport, {
			brandId: args.brandId,
			source: 'brandbook',
			name: str(data.name),
			brandBookStorageId: args.storageId,
			generalInfo: {
				language: pickEnum(general.language, LANGUAGE_CODES),
				location: str(general.location),
				contactName: str(general.contactName),
				contactEmail: str(general.contactEmail),
			},
			companyProfile: {
				fieldOfBusiness: pickEnum(profile.fieldOfBusiness, FIELDS_OF_BUSINESS),
				coreIdentity: str(profile.coreIdentity),
				coreMessage: str(profile.coreMessage),
				tagline: str(profile.tagline),
				mission: str(profile.mission),
				vision: str(profile.vision),
				values: arr(profile.values),
				products: arr(profile.products),
				reasonsToBelieve: arr(profile.reasonsToBelieve),
				keyMessages: arr(profile.keyMessages),
			},
			visualIdentity: {
				primaryColors: colorArr(visual.primaryColors),
				secondaryColors: colorArr(visual.secondaryColors),
				headlineFontName: str(visual.headlineFontName),
				sublineFontName: str(visual.sublineFontName),
			},
			voice: {
				archetype: pickEnum(voice.archetype, ARCHETYPE_IDS),
				attributes: arr(voice.attributes),
				pointOfView: pickEnum(voice.pointOfView, POV_VALUES),
				formality: pickEnum(voice.formality, FORMALITY_VALUES),
				emojiUsage: pickEnum(voice.emojiUsage, EMOJI_VALUES),
				wordsToUse: arr(voice.wordsToUse),
				wordsToAvoid: arr(voice.wordsToAvoid),
				samplePosts: arr(voice.samplePosts),
			},
			guardrails: {
				topicsToAvoid: arr(guardrails.topicsToAvoid),
				bannedClaims: arr(guardrails.bannedClaims),
				mandatoryDisclaimers: str(guardrails.mandatoryDisclaimers),
			},
		})

		return { ok: true }
	},
})
