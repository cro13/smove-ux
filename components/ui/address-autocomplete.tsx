'use client'

import { Loader2, MapPin } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type PhotonFeature = {
	geometry: { coordinates: [number, number]; type: 'Point' }
	properties: {
		osm_id: number
		osm_type: string
		country?: string
		city?: string
		state?: string
		postcode?: string
		street?: string
		housenumber?: string
		name?: string
		type?: string
		district?: string
		locality?: string
	}
}

export type ResolvedAddress = {
	street: string
	number: string
	zip: string
	city: string
	country: string
}

type Props = {
	value: string
	onChange: (v: string) => void
	onSelect: (address: ResolvedAddress) => void
	placeholder?: string
	autoComplete?: string
	error?: string
}

const PHOTON_URL = 'https://photon.komoot.io/api'

function formatLabel(p: PhotonFeature['properties']): {
	primary: string
	secondary: string
} {
	const primary = [p.street, p.housenumber].filter(Boolean).join(' ') || p.name || ''
	const secondary = [p.postcode, p.city || p.district || p.locality, p.country]
		.filter(Boolean)
		.join(', ')
	return { primary, secondary }
}

function toResolvedAddress(p: PhotonFeature['properties']): ResolvedAddress {
	return {
		street: p.street ?? p.name ?? '',
		number: p.housenumber ?? '',
		zip: p.postcode ?? '',
		city: p.city ?? p.district ?? p.locality ?? '',
		country: p.country ?? '',
	}
}

export function AddressAutocomplete({
	value,
	onChange,
	onSelect,
	placeholder,
	autoComplete,
	error,
}: Props) {
	const [suggestions, setSuggestions] = useState<PhotonFeature[]>([])
	const [focused, setFocused] = useState(false)
	const [dismissed, setDismissed] = useState(false)
	const [loading, setLoading] = useState(false)
	const [highlighted, setHighlighted] = useState(0)
	const wrapperRef = useRef<HTMLDivElement>(null)
	const abortRef = useRef<AbortController | null>(null)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const ignoreNextQueryRef = useRef(false)

	const runQuery = useCallback(async (q: string) => {
		if (!q || q.trim().length < 3) {
			setSuggestions([])
			setLoading(false)
			return
		}
		abortRef.current?.abort()
		const ctrl = new AbortController()
		abortRef.current = ctrl
		setLoading(true)
		try {
			const url = `${PHOTON_URL}/?q=${encodeURIComponent(q)}&limit=6`
			const res = await fetch(url, { signal: ctrl.signal })
			if (!res.ok) throw new Error('Address lookup failed')
			const data = (await res.json()) as { features: PhotonFeature[] }
			const sorted = [...data.features].sort((a, b) => {
				const aStreet = a.properties.street || a.properties.name ? 1 : 0
				const bStreet = b.properties.street || b.properties.name ? 1 : 0
				return bStreet - aStreet
			})
			setSuggestions(sorted)
			setHighlighted(0)
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				setSuggestions([])
			}
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		if (ignoreNextQueryRef.current) {
			ignoreNextQueryRef.current = false
			return
		}
		setDismissed(false)
		if (debounceRef.current) clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => runQuery(value), 300)
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current)
		}
	}, [value, runQuery])

	const handleSelect = (feature: PhotonFeature) => {
		const resolved = toResolvedAddress(feature.properties)
		ignoreNextQueryRef.current = true
		onSelect(resolved)
		setSuggestions([])
		setDismissed(true)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (suggestions.length === 0) return
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			setHighlighted((h) => Math.min(suggestions.length - 1, h + 1))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setHighlighted((h) => Math.max(0, h - 1))
		} else if (e.key === 'Enter') {
			e.preventDefault()
			handleSelect(suggestions[highlighted])
		} else if (e.key === 'Escape') {
			setDismissed(true)
		}
	}

	const showDropdown =
		focused &&
		!dismissed &&
		(loading || suggestions.length > 0) &&
		value.trim().length >= 3

	return (
		<div className="relative" ref={wrapperRef}>
			<div className="relative">
				<input
					type="text"
					value={value}
					onChange={(e) => {
						setDismissed(false)
						onChange(e.target.value)
					}}
					onFocus={() => setFocused(true)}
					onBlur={() => {
						// Delay so onMouseDown of a suggestion can fire first
						setTimeout(() => setFocused(false), 150)
					}}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					autoComplete={autoComplete}
					aria-invalid={!!error}
					aria-autocomplete="list"
					aria-expanded={showDropdown}
					className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-red-300"
				/>
				<MapPin className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
				{loading && (
					<Loader2 className="size-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
				)}
			</div>

			{showDropdown && (
				<ul className="absolute z-30 mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto">
					{loading && suggestions.length === 0 && (
						<li className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
							<Loader2 className="size-4 animate-spin" />
							Searching addresses…
						</li>
					)}
					{suggestions.map((feature, i) => {
						const label = formatLabel(feature.properties)
						const isHighlighted = i === highlighted
						return (
							<li
								key={`${feature.properties.osm_type}-${feature.properties.osm_id}-${i}`}
								onMouseDown={(e) => {
									e.preventDefault()
									handleSelect(feature)
								}}
								onMouseEnter={() => setHighlighted(i)}
								className={`px-4 py-2.5 cursor-pointer flex items-start gap-3 ${
									isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'
								}`}
							>
								<MapPin className="size-4 text-gray-400 mt-0.5 flex-shrink-0" />
								<div className="min-w-0 flex-1">
									<p className="text-sm text-gray-900 font-medium truncate">
										{label.primary || label.secondary}
									</p>
									{label.primary && label.secondary && (
										<p className="text-xs text-gray-500 truncate">
											{label.secondary}
										</p>
									)}
								</div>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
