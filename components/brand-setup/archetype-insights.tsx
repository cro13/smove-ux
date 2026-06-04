'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import Image from 'next/image'

import type { Archetype } from './data'

export function ArchetypeInsights({ archetype }: { archetype: Archetype }) {
	return (
		<motion.section
			key={archetype.id}
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
			className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
		>
			<div className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
				<Info className="size-4 text-primary" />
				Archetype insights
			</div>

			<div className="mb-4 flex flex-col items-center gap-2 text-center">
				<div className="relative size-16">
					<Image
						src={archetype.image}
						alt={archetype.name}
						fill
						className="object-contain"
						sizes="64px"
					/>
				</div>
				<p className="text-base font-bold text-gray-900">{archetype.name}</p>
			</div>

			<div className="space-y-3">
				<Row label="Human emotion" value={archetype.humanEmotion} />
				<Row label="Brand voice" value={archetype.brandVoice} />
				<Row label="Brand message" value={`“${archetype.brandMessage}”`} italic />
				<Row label="Strategy" value={archetype.strategy} />
			</div>
		</motion.section>
	)
}

function Row({
	label,
	value,
	italic,
}: {
	label: string
	value: string
	italic?: boolean
}) {
	return (
		<div>
			<p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
				{label}
			</p>
			<p className={`mt-0.5 text-sm text-gray-700 ${italic ? 'italic' : ''}`}>
				{value}
			</p>
		</div>
	)
}
