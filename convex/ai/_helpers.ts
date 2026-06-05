export const buildDynamicElementsSchema = (metadataJson: string) => {
	try {
		const meta = JSON.parse(metadataJson)
		const layers: Array<{ id: string; type?: string }> = []

		const findDynamic = (children: unknown[]) => {
			for (const child of children) {
				const c = child as Record<string, unknown>
				const isDynamic =
					String(
						(c.custom as Record<string, unknown>)?.isDynamic ?? '',
					).toLowerCase() === 'true'
				if (isDynamic && c.id) {
					layers.push({
						id: String(c.id),
						type: String(c.type ?? 'unknown'),
					})
				}
				if (Array.isArray(c.children)) findDynamic(c.children)
			}
		}

		if (meta.pages?.[0]?.children) {
			findDynamic(meta.pages[0].children)
		} else if (meta.dynamic_layers) {
			const dl = Array.isArray(meta.dynamic_layers)
				? meta.dynamic_layers
				: Object.values(meta.dynamic_layers)
			for (const l of dl as Array<Record<string, unknown>>) {
				if (l.id) layers.push({ id: String(l.id), type: String(l.type ?? 'unknown') })
			}
		} else if (meta.editable_areas) {
			const ea = Array.isArray(meta.editable_areas)
				? meta.editable_areas
				: Object.values(meta.editable_areas)
			for (const a of ea as Array<Record<string, unknown>>) {
				const id = a.id ?? a.name ?? a.layer_id
				if (id) layers.push({ id: String(id), type: String(a.type ?? 'unknown') })
			}
		}

		if (layers.length > 0) {
			const properties: Record<string, unknown> = {}
			const required: string[] = []
			for (const layer of layers) {
				properties[layer.id] = {
					type: 'object',
					properties: {
						id: { type: 'string' },
						type: { type: 'string' },
						role: {
							type: 'string',
							description:
								'Classify: Headline, Subline, Topline, Body, CTA, Label, Quote, Caption, Hero Image, Background Image, Supporting Image, Product Image, Portrait, Icon, or Other: [specify]',
						},
						purpose: {
							type: 'string',
							description:
								'How this element functions within the concept — what it achieves and how it relates to other dynamic elements.',
						},
					},
					required: ['id', 'type', 'role', 'purpose'],
				}
				required.push(layer.id)
			}
			return { type: 'object', properties, required }
		}
	} catch {
		// fall through to generic schema
	}

	return {
		type: 'object',
		description:
			'Map of dynamic element IDs to their analysis. Each must include id, type, role, and purpose.',
		additionalProperties: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				type: { type: 'string' },
				role: { type: 'string' },
				purpose: { type: 'string' },
			},
			required: ['id', 'type', 'role', 'purpose'],
		},
	}
}

export const buildBrandContext = (brand: {
	name: string
	companyProfile?: {
		fieldOfBusiness?: string
		coreIdentity?: string
		coreMessage?: string
		tagline?: string
		mission?: string
		vision?: string
		values?: string[]
		products?: string[]
		keyMessages?: string[]
	} | null
	visualIdentity?: {
		headlineFontName?: string
		sublineFontName?: string
		primaryColors?: string[]
		secondaryColors?: string[]
	} | null
	voice?: {
		archetype?: string
		attributes?: string[]
		pointOfView?: string
		formality?: string
		emojiUsage?: string
		wordsToUse?: string[]
		wordsToAvoid?: string[]
		samplePosts?: string[]
	} | null
	guardrails?: {
		topicsToAvoid?: string[]
		bannedClaims?: string[]
		mandatoryDisclaimers?: string
	} | null
}): string => {
	const parts: string[] = [`Brand: ${brand.name}`]
	const cp = brand.companyProfile
	if (cp) {
		if (cp.fieldOfBusiness) parts.push(`Industry: ${cp.fieldOfBusiness}`)
		if (cp.coreIdentity) parts.push(`Identity: ${cp.coreIdentity}`)
		if (cp.coreMessage) parts.push(`Core Message: ${cp.coreMessage}`)
		if (cp.tagline) parts.push(`Tagline: ${cp.tagline}`)
		if (cp.mission) parts.push(`Mission: ${cp.mission}`)
		if (cp.values?.length) parts.push(`Values: ${cp.values.join(', ')}`)
		if (cp.keyMessages?.length)
			parts.push(`Key Messages: ${cp.keyMessages.join('; ')}`)
	}
	const vi = brand.visualIdentity
	if (vi) {
		if (vi.headlineFontName)
			parts.push(`Headline Font: ${vi.headlineFontName}`)
		if (vi.sublineFontName)
			parts.push(`Body/Subline Font: ${vi.sublineFontName}`)
		if (vi.primaryColors?.length)
			parts.push(`Primary Colors: ${vi.primaryColors.join(', ')}`)
		if (vi.secondaryColors?.length)
			parts.push(`Secondary Colors: ${vi.secondaryColors.join(', ')}`)
	}
	const vo = brand.voice
	if (vo) {
		if (vo.archetype) parts.push(`Archetype: ${vo.archetype}`)
		if (vo.attributes?.length)
			parts.push(`Voice Attributes: ${vo.attributes.join(', ')}`)
		if (vo.formality) parts.push(`Formality: ${vo.formality}`)
		if (vo.emojiUsage) parts.push(`Emoji Usage: ${vo.emojiUsage}`)
		if (vo.wordsToUse?.length)
			parts.push(`Words to Use: ${vo.wordsToUse.join(', ')}`)
		if (vo.wordsToAvoid?.length)
			parts.push(`Words to Avoid: ${vo.wordsToAvoid.join(', ')}`)
		if (vo.samplePosts?.length)
			parts.push(`Sample Posts:\n${vo.samplePosts.join('\n---\n')}`)
	}
	const gr = brand.guardrails
	if (gr) {
		if (gr.topicsToAvoid?.length)
			parts.push(`Topics to Avoid: ${gr.topicsToAvoid.join(', ')}`)
		if (gr.bannedClaims?.length)
			parts.push(`Banned Claims: ${gr.bannedClaims.join(', ')}`)
		if (gr.mandatoryDisclaimers)
			parts.push(`Mandatory Disclaimers: ${gr.mandatoryDisclaimers}`)
	}
	return parts.join('\n')
}

export const buildImagePrompt = (
	analysis: {
		visual_concept: {
			concept_role?: string
			content_to_show: string
			artdirector_instructions: {
				location: string
				hero_subject: string
				moment: string
				imperfections: string
				what_makes_this_visually_interesting: string
			}
		}
		text_elements?: {
			headline?: string
			subline?: string
		}
		caption?: string
	},
	styleProfile: string | undefined,
	templateInterpretation: string | undefined,
	brandContext: {
		headlineFontName?: string
		sublineFontName?: string
		primaryColors?: string[]
		secondaryColors?: string[]
	},
	hasUserImage: boolean,
): string => {
	const ad = analysis.visual_concept.artdirector_instructions
	const parts: string[] = []

	parts.push(
		'YOU ARE COMPOSITING A SOCIAL MEDIA POST FROM TWO INPUT IMAGES.',
		'',
		'INPUT IMAGE 1 = The brand\'s post template. This defines the EXACT layout, including:',
		'- All static elements (logo, background color, decorative elements, speech bubble shape) — reproduce these PIXEL-PERFECTLY. They must appear in the final image exactly as they do in the template.',
		'- Placeholder areas for dynamic content (text and photo) — these are the ONLY parts you replace.',
		'',
	)

	if (hasUserImage) {
		parts.push(
			'INPUT IMAGE 2 = The user\'s submitted photo from the field.',
			'CRITICAL: Place this EXACT photo into the template\'s image area. Do NOT generate a new image, do NOT replace the subject, breed, background, or scene. The user\'s actual photo must be recognizable in the output. You may crop, color-grade, or style-match it to the brand aesthetic, but the CONTENT of the photo must remain the user\'s original.',
			'',
		)
	}

	parts.push(
		'TASK: Merge these two images into one final composite that looks like a finished social media post. The template\'s static elements (logo, background, layout) stay untouched. The user\'s photo fills the image area. The text areas get new content as specified below.',
		'',
		'VISUAL CONCEPT:',
		analysis.visual_concept.content_to_show,
		'',
		`Location: ${ad.location}`,
		`Hero subject: ${ad.hero_subject}`,
		`Moment: ${ad.moment}`,
		`Imperfections: ${ad.imperfections}`,
		`What makes this visually interesting: ${ad.what_makes_this_visually_interesting}`,
	)

	if (templateInterpretation) {
		try {
			const interp = JSON.parse(templateInterpretation)
			parts.push('', 'TEMPLATE LAYOUT (reproduce the template structure exactly):')
			if (interp.visual_overview?.layout_structure) {
				parts.push(`Layout: ${interp.visual_overview.layout_structure}`)
			}
			if (interp.visual_overview?.brand_vibe) {
				parts.push(`Brand Vibe: ${interp.visual_overview.brand_vibe}`)
			}
			if (interp.visual_overview?.template_description) {
				parts.push(
					`Template Description (STATIC elements like logo, background must be preserved): ${interp.visual_overview.template_description}`,
				)
			}
			if (interp.content_concept?.format) {
				parts.push(`Format: ${interp.content_concept.format}`)
			}
			if (interp.content_concept?.narrative_logic) {
				parts.push(
					`Narrative Logic: ${interp.content_concept.narrative_logic}`,
				)
			}
			if (interp.dynamic_elements) {
				const elements = Object.values(
					interp.dynamic_elements as Record<
						string,
						{ role?: string; type?: string; purpose?: string }
					>,
				)
				if (elements.length > 0) {
					parts.push('', 'Dynamic elements (ONLY these get replaced with new content):')
					for (const el of elements) {
						parts.push(
							`  - ${el.role ?? 'Unknown'} (${el.type ?? '?'}): ${el.purpose ?? ''}`,
						)
					}
				}
			}
		} catch {
			// skip
		}
	}

	if (brandContext.headlineFontName || brandContext.sublineFontName) {
		parts.push('', 'TYPOGRAPHY (use these exact fonts for any text in the image):')
		if (brandContext.headlineFontName) {
			parts.push(
				`Headline font: "${brandContext.headlineFontName}" — use this for the main text/headline`,
			)
		}
		if (brandContext.sublineFontName) {
			parts.push(
				`Body/subline font: "${brandContext.sublineFontName}" — use this for secondary text`,
			)
		}
	}

	if (brandContext.primaryColors?.length) {
		parts.push(
			'',
			`BRAND COLORS: Primary: ${brandContext.primaryColors.join(', ')}${brandContext.secondaryColors?.length ? `, Secondary: ${brandContext.secondaryColors.join(', ')}` : ''}`,
		)
	}

	if (styleProfile) {
		try {
			const style = JSON.parse(styleProfile)
			parts.push(
				'',
				'BRAND PHOTOGRAPHY STYLE (reference only — do NOT re-color or re-grade the user\'s photo):',
				`Aesthetic: ${style.aesthetic_signature}`,
				`Mood: ${style.mood}`,
				`Avoid: ${style.avoid}`,
				'NOTE: The user\'s photo colors, lighting, and tones must be preserved as-is. This style profile is for reference when the template needs new visual elements, NOT for altering the user\'s submitted photo.',
			)
		} catch {
			parts.push('', `BRAND STYLE (reference only): ${styleProfile}`)
		}
	}

	if (analysis.text_elements) {
		parts.push('', 'TEXT TO RENDER IN THE IMAGE (use the brand fonts specified above):')
		if (analysis.text_elements.headline) {
			parts.push(`Headline: "${analysis.text_elements.headline}"`)
		}
		if (analysis.text_elements.subline) {
			parts.push(`Subline: "${analysis.text_elements.subline}"`)
		}
	}

	return parts.join('\n')
}

export const parseDimensions = (
	metadata: string,
): { width: number; height: number } => {
	try {
		const parsed = JSON.parse(metadata)

		const tryPair = (
			obj: Record<string, unknown>,
		): { width: number; height: number } | null => {
			const w = obj.width
			const h = obj.height
			if (typeof w === 'number' && typeof h === 'number') {
				return { width: w, height: h }
			}
			return null
		}

		const top = tryPair(parsed)
		if (top) return top

		if (parsed.dimensions) {
			const dim = tryPair(parsed.dimensions)
			if (dim) return dim
		}

		if (parsed.pages?.[0]) {
			const page = tryPair(parsed.pages[0])
			if (page) return page
		}

		if (parsed.canvas) {
			const canvas = tryPair(parsed.canvas)
			if (canvas) return canvas
		}

		if (typeof parsed.aspect_ratio === 'string') {
			const match = parsed.aspect_ratio.match(/^(\d+):(\d+)$/)
			if (match) {
				const aw = parseInt(match[1], 10)
				const ah = parseInt(match[2], 10)
				return { width: aw, height: ah }
			}
		}

		if (typeof parsed.aspectRatio === 'string') {
			const match = parsed.aspectRatio.match(/^(\d+):(\d+)$/)
			if (match) {
				const aw = parseInt(match[1], 10)
				const ah = parseInt(match[2], 10)
				return { width: aw, height: ah }
			}
		}
	} catch {
		// fall through
	}
	return { width: 1080, height: 1350 }
}

export const dimensionsToSize = (
	width: number,
	height: number,
): 'auto' | '1024x1024' | '1536x1024' | '1024x1536' => {
	const ratio = width / height
	if (ratio > 1.2) return '1536x1024'
	if (ratio <= 0.85) return '1024x1536'
	return '1024x1024'
}

const MEDIA_TYPE_RATIOS: Record<string, { width: number; height: number }> = {
	'Portrait Post (4:5)': { width: 4, height: 5 },
	'Square Post (1:1)': { width: 1, height: 1 },
	'Landscape Post (1.91:1)': { width: 191, height: 100 },
	'Story (9:16)': { width: 9, height: 16 },
	'Reel / Video': { width: 9, height: 16 },
}

export const mediaTypeToSize = (
	mediaType: string | undefined,
): 'auto' | '1024x1024' | '1536x1024' | '1024x1536' | null => {
	if (!mediaType) return null
	const known = MEDIA_TYPE_RATIOS[mediaType]
	if (known) return dimensionsToSize(known.width, known.height)

	const ratioMatch = mediaType.match(/\((\d+(?:\.\d+)?):(\d+(?:\.\d+)?)\)/)
	if (ratioMatch) {
		const w = parseFloat(ratioMatch[1])
		const h = parseFloat(ratioMatch[2])
		return dimensionsToSize(w, h)
	}

	return null
}
