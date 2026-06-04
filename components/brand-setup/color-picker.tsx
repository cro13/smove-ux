'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'

import { cn } from '@/lib/utils'

import { GRADIENT_TYPES, gradientCss, type Gradient } from './gradient'
import { isValidHex } from './validation'

type ColorSwatchListProps = {
	colors: string[]
	onChange: (colors: string[]) => void
	max?: number
}

export function ColorSwatchList({ colors, onChange, max = 6 }: ColorSwatchListProps) {
	const [editingIndex, setEditingIndex] = useState<number | null>(null)

	const handleAdd = () => {
		if (colors.length >= max) return
		onChange([...colors, '#2563EB'])
		setEditingIndex(colors.length)
	}

	const handleChange = (idx: number, color: string) => {
		const next = [...colors]
		next[idx] = color.toUpperCase()
		onChange(next)
	}

	const handleRemove = (idx: number) => {
		onChange(colors.filter((_, i) => i !== idx))
		if (editingIndex === idx) setEditingIndex(null)
	}

	return (
		<div className="space-y-2">
			<AnimatePresence initial={false}>
				{colors.map((color, idx) => (
					<motion.div
						key={idx}
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						className="flex items-center gap-2"
					>
						<ColorSwatch
							color={color}
							isEditing={editingIndex === idx}
							onToggleEdit={() =>
								setEditingIndex(editingIndex === idx ? null : idx)
							}
							onChange={(c) => handleChange(idx, c)}
						/>
						<input
							value={color}
							onChange={(e) => handleChange(idx, e.target.value)}
							maxLength={7}
							className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 font-mono text-xs text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/10"
						/>
						<button
							type="button"
							onClick={() => handleRemove(idx)}
							className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
							aria-label="Remove color"
						>
							<X className="size-3.5" />
						</button>
					</motion.div>
				))}
			</AnimatePresence>
			{colors.length < max && (
				<button
					type="button"
					onClick={handleAdd}
					className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
				>
					<Plus className="size-3" />
					Add color
				</button>
			)}
		</div>
	)
}

type ColorSwatchProps = {
	color: string
	isEditing: boolean
	onToggleEdit: () => void
	onChange: (c: string) => void
}

function ColorSwatch({ color, isEditing, onToggleEdit, onChange }: ColorSwatchProps) {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isEditing) return
		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onToggleEdit()
			}
		}
		setTimeout(() => document.addEventListener('mousedown', onClick), 0)
		return () => document.removeEventListener('mousedown', onClick)
	}, [isEditing, onToggleEdit])

	const safe = isValidHex(color) ? color : '#2563EB'

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={onToggleEdit}
				className={cn(
					'size-9 rounded-lg border border-gray-200 shadow-inner transition-transform hover:scale-105',
					isEditing && 'ring-2 ring-primary ring-offset-2',
				)}
				style={{ background: safe }}
				aria-label="Pick color"
			/>
			<AnimatePresence>
				{isEditing && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -4 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -4 }}
						transition={{ duration: 0.15 }}
						className="absolute z-40 mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
					>
						<HexColorPicker color={safe} onChange={(c) => onChange(c)} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

type GradientListProps = {
	gradients: Gradient[]
	onChange: (gradients: Gradient[]) => void
	max?: number
}

export function GradientList({ gradients, onChange, max = 4 }: GradientListProps) {
	const [editing, setEditing] = useState<{ index: number; end: 'from' | 'to' } | null>(
		null,
	)

	const handleAdd = () => {
		if (gradients.length >= max) return
		onChange([
			...gradients,
			{ from: '#2563EB', to: '#7C3AED', type: 'linear', angle: 135 },
		])
	}

	const handlePatch = (idx: number, patch: Partial<Gradient>) => {
		const next = [...gradients]
		next[idx] = { ...next[idx], ...patch }
		onChange(next)
	}

	const handleRemove = (idx: number) => {
		onChange(gradients.filter((_, i) => i !== idx))
		if (editing?.index === idx) setEditing(null)
	}

	if (gradients.length === 0) {
		return (
			<button
				type="button"
				onClick={handleAdd}
				className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3 py-3 text-xs font-medium text-gray-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
			>
				<Plus className="size-3" />
				Add a gradient
			</button>
		)
	}

	return (
		<div className="space-y-3">
			<AnimatePresence initial={false}>
				{gradients.map((gradient, idx) => {
					const type = gradient.type ?? 'linear'
					const angle = gradient.angle ?? 135
					return (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: -4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							className="space-y-3 rounded-xl border border-gray-200 p-3"
						>
							<div className="flex items-center gap-2">
								<GradientEndSwatch
									color={gradient.from}
									isEditing={editing?.index === idx && editing.end === 'from'}
									onToggleEdit={() =>
										setEditing(
											editing?.index === idx && editing.end === 'from'
												? null
												: { index: idx, end: 'from' },
										)
									}
									onChange={(c) => handlePatch(idx, { from: c.toUpperCase() })}
								/>
								<div
									className="h-9 flex-1 rounded-lg border border-gray-200 shadow-inner"
									style={{ background: gradientCss(gradient) }}
								/>
								<GradientEndSwatch
									color={gradient.to}
									isEditing={editing?.index === idx && editing.end === 'to'}
									onToggleEdit={() =>
										setEditing(
											editing?.index === idx && editing.end === 'to'
												? null
												: { index: idx, end: 'to' },
										)
									}
									onChange={(c) => handlePatch(idx, { to: c.toUpperCase() })}
								/>
								<button
									type="button"
									onClick={() => handleRemove(idx)}
									className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
									aria-label="Remove gradient"
								>
									<X className="size-3.5" />
								</button>
							</div>

							<div className="flex flex-wrap items-center gap-3">
								<div className="inline-flex rounded-lg bg-gray-100 p-0.5">
									{GRADIENT_TYPES.map((t) => (
										<button
											key={t.value}
											type="button"
											onClick={() => handlePatch(idx, { type: t.value })}
											className={cn(
												'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
												type === t.value
													? 'bg-white text-gray-900 shadow-sm'
													: 'text-gray-500 hover:text-gray-900',
											)}
										>
											{t.label}
										</button>
									))}
								</div>

								{type !== 'radial' && (
									<label className="flex flex-1 items-center gap-2 text-[11px] text-gray-500">
										<span className="shrink-0">Angle</span>
										<input
											type="range"
											min={0}
											max={360}
											step={15}
											value={angle}
											onChange={(e) =>
												handlePatch(idx, { angle: Number(e.target.value) })
											}
											className="h-1 flex-1 cursor-pointer accent-primary"
											aria-label="Gradient angle"
										/>
										<span className="w-9 shrink-0 text-right font-mono tabular-nums text-gray-700">
											{angle}°
										</span>
									</label>
								)}
							</div>
						</motion.div>
					)
				})}
			</AnimatePresence>
			{gradients.length < max && (
				<button
					type="button"
					onClick={handleAdd}
					className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
				>
					<Plus className="size-3" />
					Add gradient
				</button>
			)}
		</div>
	)
}

function GradientEndSwatch({
	color,
	isEditing,
	onToggleEdit,
	onChange,
}: {
	color: string
	isEditing: boolean
	onToggleEdit: () => void
	onChange: (c: string) => void
}) {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isEditing) return
		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onToggleEdit()
			}
		}
		setTimeout(() => document.addEventListener('mousedown', onClick), 0)
		return () => document.removeEventListener('mousedown', onClick)
	}, [isEditing, onToggleEdit])

	const safe = isValidHex(color) ? color : '#2563EB'

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={onToggleEdit}
				className={cn(
					'size-9 rounded-lg border border-gray-200 shadow-inner transition-transform hover:scale-105',
					isEditing && 'ring-2 ring-primary ring-offset-2',
				)}
				style={{ background: safe }}
				aria-label="Pick gradient color"
			/>
			<AnimatePresence>
				{isEditing && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -4 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -4 }}
						transition={{ duration: 0.15 }}
						className="absolute z-40 mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
					>
						<HexColorPicker color={safe} onChange={(c) => onChange(c)} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
