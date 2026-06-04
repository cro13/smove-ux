'use client'

import { ReactNode } from 'react'

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: ReactNode
	title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md rounded-3xl p-8">
				{title && (
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">
							{title}
						</DialogTitle>
					</DialogHeader>
				)}
				{children}
			</DialogContent>
		</Dialog>
	)
}
