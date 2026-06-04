export const LANGUAGES = [
	{ value: 'en-US', label: 'English (US)' },
	{ value: 'en-GB', label: 'English (UK)' },
	{ value: 'de', label: 'German' },
	{ value: 'fr', label: 'French' },
	{ value: 'es', label: 'Spanish' },
	{ value: 'it', label: 'Italian' },
	{ value: 'pt', label: 'Portuguese' },
	{ value: 'nl', label: 'Dutch' },
] as const

export const FIELDS_OF_BUSINESS = [
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

export type Archetype = {
	id: string
	name: string
	tagline: string
	color: string
	image: string
	humanEmotion: string
	brandVoice: string
	brandMessage: string
	strategy: string
}

const archetypeImage = (id: string) => `/images/archetypes/${id}.png`

export const ARCHETYPES: Archetype[] = [
	{
		id: 'outlaw',
		name: 'The Outlaw',
		tagline: 'Challenges convention and rewrites the rules.',
		color: '#0F172A',
		image: archetypeImage('outlaw'),
		humanEmotion: 'Liberation',
		brandVoice: 'Disruptive; Rebellious; Combative',
		brandMessage:
			'You don’t have to settle for status quo. First demand more, second go out and get it.',
		strategy: 'Denounce status quo, disrupt and shock',
	},
	{
		id: 'magician',
		name: 'The Magician',
		tagline: 'Makes dreams come true with vision and transformation.',
		color: '#7C3AED',
		image: archetypeImage('magician'),
		humanEmotion: 'Power',
		brandVoice: 'Mystical; Informed; Reassuring',
		brandMessage:
			'Tomorrow is brighter than today and all your dreams can come true if you believe.',
		strategy: 'Develop a vision and live by it; Transformation',
	},
	{
		id: 'hero',
		name: 'The Hero',
		tagline: 'Courageous, bold, and inspirational under pressure.',
		color: '#DC2626',
		image: archetypeImage('hero'),
		humanEmotion: 'Mastery',
		brandVoice: 'Honest; Candid; Brave',
		brandMessage:
			'We can make the world better. We have the grit and determination to outwork the rest.',
		strategy: 'Become stronger and better; Prove people wrong',
	},
	{
		id: 'lover',
		name: 'The Lover',
		tagline: 'Creates intimacy, passion, and meaningful connection.',
		color: '#EC4899',
		image: archetypeImage('lover'),
		humanEmotion: 'Intimacy',
		brandVoice: 'Sensual; Empathetic; Soothing',
		brandMessage: 'Your striking beauty is impossible to ignore.',
		strategy: 'Reaffirm Beauty; Red Carpet Treatment',
	},
	{
		id: 'jester',
		name: 'The Jester',
		tagline: 'Brings joy, humor, and lightness to the world.',
		color: '#F59E0B',
		image: archetypeImage('jester'),
		humanEmotion: 'Enjoyment',
		brandVoice: 'Fun loving; Playful; Optimistic',
		brandMessage:
			'We’re here for a short time, not for a long time. Let your hair down and start living life.',
		strategy: 'Promote Good Times; Make them laugh',
	},
	{
		id: 'everyman',
		name: 'The Everyman',
		tagline: 'Belonging, humble, and grounded in community.',
		color: '#0891B2',
		image: archetypeImage('everyman'),
		humanEmotion: 'Belonging',
		brandVoice: 'Friendly; Humble; Authentic',
		brandMessage:
			'When we treat each other with honesty and friendliness we can live together in harmony.',
		strategy: 'Align with basic values; Create a welcoming community',
	},
	{
		id: 'caregiver',
		name: 'The Caregiver',
		tagline: 'Protects and cares for others with empathy.',
		color: '#16A34A',
		image: archetypeImage('caregiver'),
		humanEmotion: 'Service',
		brandVoice: 'Caring; Warm; Reassuring',
		brandMessage:
			'Everyone deserves care and we must all strive to bestow service upon another.',
		strategy: 'Others before self; The greater good is worth sacrifice',
	},
	{
		id: 'ruler',
		name: 'The Ruler',
		tagline: 'Builds control, structure, and trust through leadership.',
		color: '#1E40AF',
		image: archetypeImage('ruler'),
		humanEmotion: 'Control',
		brandVoice: 'Commanding; Refined; Articulate',
		brandMessage:
			'You are successful in work and life. Reward your excellence and your achievements.',
		strategy: 'Exert Leadership; Demonstrate Superiority',
	},
	{
		id: 'creator',
		name: 'The Creator',
		tagline: 'Creates things of enduring value and originality.',
		color: '#F97316',
		image: archetypeImage('creator'),
		humanEmotion: 'Innovation',
		brandVoice: 'Inspirational; Daring; Provocative',
		brandMessage:
			'See potential everywhere and uncover originality with liberated imagination.',
		strategy:
			'Inspire to unlock imagination; Encourage the pursuit of originality',
	},
	{
		id: 'innocent',
		name: 'The Innocent',
		tagline: 'Optimistic, safe, and pure in intent.',
		color: '#0EA5E9',
		image: archetypeImage('innocent'),
		humanEmotion: 'Safety',
		brandVoice: 'Optimistic; Honest; Humble',
		brandMessage: 'The most wholesome things in life are unadulterated and pure.',
		strategy: 'Display wholesome virtue; Foster feel-good spirit',
	},
	{
		id: 'sage',
		name: 'The Sage',
		tagline: 'Seeker of truth, knowledge, and wisdom.',
		color: '#475569',
		image: archetypeImage('sage'),
		humanEmotion: 'Understanding',
		brandVoice: 'Knowledgeable; Assured; Guiding',
		brandMessage:
			'Education is the path to wisdom and wisdom is where the answers lie.',
		strategy: 'Show the path to wisdom; Celebrate life-long-learning',
	},
	{
		id: 'explorer',
		name: 'The Explorer',
		tagline: 'Authentic, adventurous, and freedom-driven.',
		color: '#059669',
		image: archetypeImage('explorer'),
		humanEmotion: 'Freedom',
		brandVoice: 'Exciting; Fearless; Daring',
		brandMessage: 'You only get one life. Get out and make it count.',
		strategy: 'Celebrate the journey; Acknowledge modern confinements',
	},
]

export const MEDIA_TYPES = [
	'Portrait Post (4:5)',
	'Square Post (1:1)',
	'Landscape Post (1.91:1)',
	'Story (9:16)',
	'Reel / Video',
	'Carousel',
	'Text-only',
] as const

export const EMOJI_USAGE = [
	{ value: 'none', label: 'None' },
	{ value: 'few', label: 'Few' },
	{ value: 'many', label: 'Many' },
] as const

export const DAYS_OF_WEEK = [
	{ value: 'mon', label: 'Mon' },
	{ value: 'tue', label: 'Tue' },
	{ value: 'wed', label: 'Wed' },
	{ value: 'thu', label: 'Thu' },
	{ value: 'fri', label: 'Fri' },
	{ value: 'sat', label: 'Sat' },
	{ value: 'sun', label: 'Sun' },
] as const

export const TIME_OPTIONS = (() => {
	const opts: string[] = []
	for (let h = 0; h < 24; h++) {
		for (let m = 0; m < 60; m += 10) {
			opts.push(
				`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
			)
		}
	}
	return opts
})()
