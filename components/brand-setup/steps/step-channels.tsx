'use client'

import { useEffect, useMemo, useState } from 'react'

import { SelectableCard } from '../fields'
import {
	FacebookGlyph,
	InstagramGlyph,
	LinkedinGlyph,
} from '../glyphs'
import { CHANNELS, type BrandWithMedia, type Channel } from '../types'
import { useAutosave } from '../use-autosave'

type Props = {
	brand: BrandWithMedia
	onSave: (patch: { channels?: Channel[] }) => void
	onValidationError: (msg: string | null) => void
}

const CHANNEL_META: Record<
	Channel,
	{
		label: string
		Icon: React.ComponentType<{ className?: string }>
		gradient: string
		tagline: string
	}
> = {
	linkedin: {
		label: 'LinkedIn',
		Icon: LinkedinGlyph,
		gradient: 'from-blue-500 to-blue-700',
		tagline: 'Reach professionals & decision-makers',
	},
	instagram: {
		label: 'Instagram',
		Icon: InstagramGlyph,
		gradient: 'from-pink-500 via-orange-500 to-yellow-400',
		tagline: 'Visual storytelling for everyday consumers',
	},
	facebook: {
		label: 'Facebook',
		Icon: FacebookGlyph,
		gradient: 'from-blue-600 to-indigo-700',
		tagline: 'Broad audience reach & community',
	},
}

export function StepChannels({ brand, onSave, onValidationError }: Props) {
	const [selected, setSelected] = useState<Set<Channel>>(
		new Set(brand.channels ?? []),
	)

	const data = useMemo(
		() => ({ channels: Array.from(selected) }),
		[selected],
	)
	useAutosave({ data, save: onSave, delay: 250 })

	useEffect(() => {
		onValidationError(
			selected.size === 0 ? 'Pick at least one channel to continue.' : null,
		)
		return () => onValidationError(null)
	}, [selected, onValidationError])

	const toggle = (channel: Channel) => {
		setSelected((s) => {
			const next = new Set(s)
			if (next.has(channel)) next.delete(channel)
			else next.add(channel)
			return next
		})
	}

	return (
		<div className="space-y-7">
			<p className="text-sm text-gray-500">
				Where do you want to be active? Pick at least one channel — you can
				configure account connections later.
			</p>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{CHANNELS.map((c) => {
					const meta = CHANNEL_META[c]
					const Icon = meta.Icon
					const isSelected = selected.has(c)
					return (
						<SelectableCard
							key={c}
							selected={isSelected}
							onClick={() => toggle(c)}
							className="p-5"
						>
							<div
								className={`mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-sm`}
							>
								<Icon className="size-6" />
							</div>
							<p
								className="text-base font-semibold text-gray-900"
								style={{ letterSpacing: '-0.02em' }}
							>
								{meta.label}
							</p>
							<p className="mt-1 text-xs text-gray-500">{meta.tagline}</p>
						</SelectableCard>
					)
				})}
			</div>

			{selected.size === 0 && (
				<div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
					Pick at least one channel to continue.
				</div>
			)}
		</div>
	)
}
