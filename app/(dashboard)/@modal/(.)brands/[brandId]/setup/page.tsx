'use client'

import { useParams, useRouter } from 'next/navigation'

import { SetupModal } from '@/components/brand-setup/setup-modal'
import type { Id } from '@/convex/_generated/dataModel'

export default function InterceptedBrandSetupModal() {
	const params = useParams()
	const router = useRouter()
	const brandId = params.brandId as Id<'brands'>

	return <SetupModal brandId={brandId} onClose={() => router.back()} />
}
