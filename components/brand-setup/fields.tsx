'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type FieldProps = {
	label?: string
	error?: string
	hint?: string
	required?: boolean
	children: React.ReactNode
	className?: string
}

export function Field({ label, error, hint, required, children, className }: FieldProps) {
	return (
		<label className={cn('block', className)}>
			{label && (
				<span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
					{label}
					{required && <span className="ml-0.5 text-red-500">*</span>}
				</span>
			)}
			{children}
			<div className="mt-1 min-h-[16px]">
				<AnimatePresence mode="wait">
					{error ? (
						<motion.p
							key="err"
							initial={{ opacity: 0, y: -4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							className="text-xs text-red-500"
						>
							{error}
						</motion.p>
					) : hint ? (
						<motion.p
							key="hint"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="text-xs text-gray-400"
						>
							{hint}
						</motion.p>
					) : null}
				</AnimatePresence>
			</div>
		</label>
	)
}

type TextInputProps = {
	value: string
	onChange: (v: string) => void
	onBlur?: () => void
	placeholder?: string
	type?: string
	autoComplete?: string
	inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
	error?: boolean
	disabled?: boolean
	maxLength?: number
}

export function TextInput({
	value,
	onChange,
	onBlur,
	placeholder,
	type = 'text',
	autoComplete,
	inputMode,
	error,
	disabled,
	maxLength,
}: TextInputProps) {
	return (
		<input
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onBlur={onBlur}
			placeholder={placeholder}
			autoComplete={autoComplete}
			inputMode={inputMode}
			disabled={disabled}
			maxLength={maxLength}
			aria-invalid={error}
			className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:ring-red-100"
		/>
	)
}

type TextareaProps = {
	value: string
	onChange: (v: string) => void
	onBlur?: () => void
	placeholder?: string
	rows?: number
	maxLength?: number
	error?: boolean
}

export function Textarea({
	value,
	onChange,
	onBlur,
	placeholder,
	rows = 3,
	maxLength,
	error,
}: TextareaProps) {
	return (
		<textarea
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onBlur={onBlur}
			placeholder={placeholder}
			rows={rows}
			maxLength={maxLength}
			aria-invalid={error}
			className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-red-300"
		/>
	)
}

type NumberInputProps = {
	value: string
	onChange: (v: string) => void
	onBlur?: () => void
	placeholder?: string
	min?: number
	max?: number
	error?: boolean
}

export function NumberInput({
	value,
	onChange,
	onBlur,
	placeholder,
	min = 0,
	max = 99,
	error,
}: NumberInputProps) {
	const handleChange = (raw: string) => {
		const digits = raw.replace(/\D/g, '')
		if (digits === '') return onChange('')
		const n = parseInt(digits, 10)
		if (Number.isNaN(n)) return onChange('')
		const clamped = Math.max(min, Math.min(max, n))
		onChange(String(clamped))
	}
	return (
		<input
			type="text"
			inputMode="numeric"
			pattern="[0-9]*"
			value={value}
			onChange={(e) => handleChange(e.target.value)}
			onBlur={onBlur}
			placeholder={placeholder}
			aria-invalid={error}
			className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm tabular-nums text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-red-300"
		/>
	)
}

type SelectOption = { value: string; label: string }

type SelectProps = {
	value: string
	onChange: (v: string) => void
	options: readonly SelectOption[]
	placeholder?: string
	error?: boolean
}

export function Select({ value, onChange, options, placeholder, error }: SelectProps) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)
	const selected = options.find((o) => o.value === value)

	useEffect(() => {
		if (!open) return
		const onClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', onClick)
		return () => document.removeEventListener('mousedown', onClick)
	}, [open])

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				data-invalid={error || undefined}
				className={cn(
					'flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-sm text-left transition-all hover:border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10 data-[invalid]:border-red-300',
					selected ? 'text-gray-900' : 'text-gray-400',
				)}
			>
				<span className="truncate">{selected?.label ?? placeholder}</span>
				<ChevronDown
					className={cn(
						'size-4 shrink-0 text-gray-400 transition-transform',
						open && 'rotate-180',
					)}
				/>
			</button>
			<AnimatePresence>
				{open && (
					<motion.ul
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						transition={{ duration: 0.15 }}
						className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
					>
						{options.map((o) => (
							<li key={o.value}>
								<button
									type="button"
									onClick={() => {
										onChange(o.value)
										setOpen(false)
									}}
									className={cn(
										'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50',
										o.value === value ? 'text-primary' : 'text-gray-700',
									)}
								>
									{o.label}
									{o.value === value && <Check className="size-4" />}
								</button>
							</li>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</div>
	)
}

type TagInputProps = {
	value: string[]
	onChange: (v: string[]) => void
	placeholder?: string
	maxItems?: number
}

export function TagInput({ value, onChange, placeholder, maxItems = 20 }: TagInputProps) {
	const [draft, setDraft] = useState('')
	const inputId = useId()

	const handleAdd = () => {
		const v = draft.trim()
		if (!v) return
		if (value.includes(v)) return setDraft('')
		if (value.length >= maxItems) return
		onChange([...value, v])
		setDraft('')
	}

	const handleRemove = (idx: number) => {
		onChange(value.filter((_, i) => i !== idx))
	}

	return (
		<div
			className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-2 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 hover:border-gray-300"
			onClick={() => document.getElementById(inputId)?.focus()}
		>
			<AnimatePresence initial={false}>
				{value.map((tag, idx) => (
					<motion.span
						key={`${tag}-${idx}`}
						initial={{ opacity: 0, scale: 0.85 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.85 }}
						transition={{ duration: 0.15 }}
						className="inline-flex items-center gap-1 rounded-lg bg-primary/8 px-2 py-1 text-xs font-medium text-primary"
					>
						{tag}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation()
								handleRemove(idx)
							}}
							className="rounded-md text-primary/60 hover:bg-primary/10 hover:text-primary"
							aria-label={`Remove ${tag}`}
						>
							<X className="size-3" />
						</button>
					</motion.span>
				))}
			</AnimatePresence>
			<input
				id={inputId}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ',') {
						e.preventDefault()
						handleAdd()
					}
					if (e.key === 'Backspace' && !draft && value.length > 0) {
						handleRemove(value.length - 1)
					}
				}}
				placeholder={value.length === 0 ? placeholder : ''}
				className="min-w-[120px] flex-1 bg-transparent px-1.5 py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
			/>
			{draft.trim() && (
				<button
					type="button"
					onClick={handleAdd}
					className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
				>
					<Plus className="size-3" />
					Add
				</button>
			)}
		</div>
	)
}

type SelectableCardProps = {
	selected: boolean
	onClick: () => void
	children: React.ReactNode
	className?: string
}

export function SelectableCard({
	selected,
	onClick,
	children,
	className,
}: SelectableCardProps) {
	return (
		<motion.button
			type="button"
			onClick={onClick}
			whileHover={{ y: -2 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				'group relative w-full overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all',
				selected
					? 'border-primary shadow-[0_8px_24px_-12px_rgba(37,99,235,0.4)]'
					: 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
				className,
			)}
		>
			{selected && (
				<motion.div
					layoutId={undefined}
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-white shadow-sm"
				>
					<Check className="size-3" strokeWidth={3} />
				</motion.div>
			)}
			{children}
		</motion.button>
	)
}
