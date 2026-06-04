'use client'

import { useConvexAuth } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { MobileHeader, Sidebar } from '@/components/dashboard/sidebar'

import { api } from '../../convex/_generated/api'

export default function DashboardLayout({
	children,
	modal,
}: {
	children: React.ReactNode
	modal: React.ReactNode
}) {
	const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
	const router = useRouter()
	const agency = useQuery(
		api.agencies.myAgency,
		isAuthenticated ? {} : 'skip',
	)
	const [isMobileOpen, setIsMobileOpen] = useState(false)

	useEffect(() => {
		if (!isAuthLoading && !isAuthenticated) {
			router.replace('/login')
		}
	}, [isAuthLoading, isAuthenticated, router])

	useEffect(() => {
		if (isAuthenticated && agency === null) {
			router.replace('/register/agency')
		}
	}, [isAuthenticated, agency, router])

	if (isAuthLoading || !isAuthenticated || agency === undefined) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
		)
	}

	if (agency === null) return null

	return (
		<div className="flex h-screen overflow-hidden bg-[#FAF9F7]">
			<Sidebar
				isMobileOpen={isMobileOpen}
				onMobileClose={() => setIsMobileOpen(false)}
			/>
			<div className="flex flex-1 flex-col overflow-hidden">
				<MobileHeader onMenuOpen={() => setIsMobileOpen(true)} />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
			{modal}
		</div>
	)
}
