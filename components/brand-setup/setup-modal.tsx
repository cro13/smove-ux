'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'

import type { Id } from '@/convex/_generated/dataModel'

import { BrandSetupWizard } from './brand-setup-wizard'

type Props = {
	brandId: Id<'brands'>
	onClose: () => void
}

export function SetupModal({ brandId, onClose }: Props) {
	return (
		<DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-900/30 duration-150 supports-backdrop-filter:backdrop-blur-md data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
				<DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 flex h-[92vh] w-[calc(100%-2rem)] max-w-[1480px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl bg-[#FAF9F7] shadow-2xl ring-1 ring-black/10 outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
					<DialogPrimitive.Title className="sr-only">
						Brand onboarding
					</DialogPrimitive.Title>
					<DialogPrimitive.Close
						aria-label="Close onboarding"
						className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow-sm ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white hover:text-gray-900"
					>
						<X className="size-4" />
					</DialogPrimitive.Close>
					<div className="min-h-0 flex-1">
						<BrandSetupWizard brandId={brandId} onExit={onClose} />
					</div>
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}
