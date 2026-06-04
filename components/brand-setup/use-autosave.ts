'use client'

import { useCallback, useEffect, useRef } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type Options<T> = {
	data: T
	save: (data: T) => void | Promise<void>
	delay?: number
	enabled?: boolean
	onStatus?: (status: SaveStatus) => void
}

export function useAutosave<T>({
	data,
	save,
	delay = 700,
	enabled = true,
	onStatus,
}: Options<T>) {
	const dataRef = useRef(data)
	const saveRef = useRef(save)
	const statusRef = useRef(onStatus)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const lastSavedRef = useRef<string>(JSON.stringify(data))

	useEffect(() => {
		dataRef.current = data
	}, [data])

	useEffect(() => {
		saveRef.current = save
	}, [save])

	useEffect(() => {
		statusRef.current = onStatus
	}, [onStatus])

	const flush = useCallback(async () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
		const next = JSON.stringify(dataRef.current)
		if (next === lastSavedRef.current) return
		statusRef.current?.('saving')
		try {
			await saveRef.current(dataRef.current)
			lastSavedRef.current = next
			statusRef.current?.('saved')
		} catch (err) {
			console.error('Autosave failed', err)
			statusRef.current?.('error')
		}
	}, [])

	useEffect(() => {
		if (!enabled) return
		const next = JSON.stringify(data)
		if (next === lastSavedRef.current) return
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(() => {
			void flush()
		}, delay)
	}, [data, delay, enabled, flush])

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current)
				void flush()
			}
		}
	}, [flush])

	useEffect(() => {
		const handler = (e: BeforeUnloadEvent) => {
			if (!timerRef.current) return
			e.preventDefault()
			void flush()
		}
		window.addEventListener('beforeunload', handler)
		return () => window.removeEventListener('beforeunload', handler)
	}, [flush])
}
