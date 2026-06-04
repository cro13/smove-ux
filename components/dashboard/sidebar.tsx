'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { useMutation, useQuery } from 'convex/react'
import {
	LayoutDashboard,
	Loader2,
	LogOut,
	Menu,
	Plus,
	Settings,
	X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { api } from '../../convex/_generated/api'

const SMOVE_LOGO =
	'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4ebd8e68-4cde-439b-8859-2820929ed47a_320w.png'

interface SidebarProps {
	isMobileOpen: boolean
	onMobileClose: () => void
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
	const pathname = usePathname()
	const router = useRouter()
	const { signOut } = useAuthActions()
	const agency = useQuery(api.agencies.myAgency)
	const user = useQuery(api.agencies.currentUser)
	const brands = useQuery(api.brands.listByAgency)
	const createBrand = useMutation(api.brands.create)
	const [isCreating, setIsCreating] = useState(false)

	const handleSignOut = async () => {
		await signOut()
		router.push('/login')
	}

	const handleAddBrand = async () => {
		if (isCreating) return
		setIsCreating(true)
		try {
			const brandId = await createBrand({ name: '' })
			router.push(`/brands/${brandId}/setup`)
			onMobileClose()
		} finally {
			setIsCreating(false)
		}
	}

	const userInitial = user?.name
		? user.name.charAt(0).toUpperCase()
		: user?.email
			? user.email.charAt(0).toUpperCase()
			: '?'

	const userName = user?.name ?? user?.email ?? 'User'
	const userEmail = user?.email ?? ''

	return (
		<>
			{isMobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
					onClick={onMobileClose}
					aria-hidden
				/>
			)}

			<aside
				className={cn(
					'fixed top-0 left-0 z-50 flex h-full w-64 flex-col',
					'bg-white shadow-[2px_0_12px_-2px_rgba(0,0,0,0.06)]',
					'transition-transform duration-200 ease-in-out',
					'lg:relative lg:translate-x-0',
					isMobileOpen ? 'translate-x-0' : '-translate-x-full',
				)}
			>
				<div className="flex h-14 items-center gap-3 px-4">
					<Image
						src={SMOVE_LOGO}
						alt="Smove"
						width={72}
						height={20}
						className="shrink-0 object-contain"
						unoptimized
					/>
					{agency && (
						<>
							<span className="h-4 w-px bg-foreground/10" />
							<span className="truncate text-xs font-medium text-foreground/50">
								{agency.name}
							</span>
						</>
					)}
					<button
						onClick={onMobileClose}
						className="ml-auto rounded-md p-1 text-foreground/40 hover:bg-accent lg:hidden"
						aria-label="Close sidebar"
					>
						<X className="size-4" />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto px-3 py-4">
					<div className="mb-6">
					<Link
						href="/brands"
						className={cn(
							'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
							pathname === '/brands'
								? 'bg-accent text-foreground'
								: 'text-foreground/50 hover:bg-accent/50 hover:text-foreground',
						)}
						onClick={onMobileClose}
					>
						<LayoutDashboard className="size-4" />
						Dashboard
					</Link>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between px-3">
							<span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/30">
								Brands
							</span>
							<button
								onClick={handleAddBrand}
								disabled={isCreating}
								className="rounded-md p-0.5 text-foreground/30 transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
								aria-label="Add brand"
							>
								{isCreating ? (
									<Loader2 className="size-3.5 animate-spin" />
								) : (
									<Plus className="size-3.5" />
								)}
							</button>
						</div>

						<div className="space-y-0.5">
							{brands?.map((brand) => {
								const isActive = pathname.startsWith(`/brands/${brand._id}`)
								const displayName = brand.name || 'Untitled brand'
								const brandInitial = displayName.charAt(0).toUpperCase()
								const isDraft = !brand.onboardingCompletedAt
								return (
									<Link
										key={brand._id}
										href={`/brands/${brand._id}`}
										onClick={onMobileClose}
										className={cn(
											'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
											isActive
												? 'bg-accent font-medium text-foreground shadow-sm'
												: 'text-foreground/50 hover:bg-accent/50 hover:text-foreground',
										)}
									>
										<span
											className={cn(
												'relative flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold',
												isActive
													? 'bg-foreground text-white'
													: 'bg-accent text-foreground/50',
											)}
										>
											{brandInitial}
											{isDraft && (
												<span
													className="absolute -right-0.5 -top-0.5 flex size-2 items-center justify-center"
													aria-hidden="true"
												>
													<span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
													<span className="relative size-2 rounded-full bg-primary ring-2 ring-white" />
												</span>
											)}
										</span>
										<span
											className={cn(
												'truncate',
												!brand.name && 'italic text-foreground/40',
											)}
										>
											{displayName}
										</span>
										{isDraft ? (
											<span
												className="ml-auto inline-flex shrink-0 items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
												title={`Setup ${brand.onboardingStep ?? 1} of 8`}
											>
												Draft
											</span>
										) : (
											<span
												className={cn(
													'ml-auto size-2 shrink-0 rounded-full',
													brand.status === 'active'
														? 'bg-emerald-500'
														: brand.status === 'paused'
															? 'bg-amber-400'
															: 'bg-gray-300',
												)}
												title={brand.status}
											/>
										)}
									</Link>
								)
							})}

							{brands?.length === 0 && (
								<button
									onClick={handleAddBrand}
									disabled={isCreating}
									className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/30 transition-colors hover:bg-accent/50 hover:text-foreground/50 disabled:opacity-50"
								>
									{isCreating ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Plus className="size-4" />
									)}
									Add your first brand
								</button>
							)}
						</div>
					</div>
				</nav>

				<div className="p-3 shadow-[0_-1px_6px_-1px_rgba(0,0,0,0.05)]">
					<Link
						href="/settings"
						onClick={onMobileClose}
						className={cn(
							'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
							pathname === '/settings'
								? 'bg-accent font-medium text-foreground'
								: 'text-foreground/50 hover:bg-accent/50 hover:text-foreground',
						)}
					>
						<Settings className="size-4" />
						Settings
					</Link>

					<div className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2">
						<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-white">
							{userInitial}
						</span>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-foreground">
								{userName}
							</p>
							{userEmail && userName !== userEmail && (
								<p className="truncate text-[11px] text-foreground/40">
									{userEmail}
								</p>
							)}
						</div>
						<button
							onClick={handleSignOut}
							className="rounded-md p-1.5 text-foreground/30 transition-colors hover:bg-accent hover:text-foreground"
							aria-label="Sign out"
							tabIndex={0}
						>
							<LogOut className="size-3.5" />
						</button>
					</div>
				</div>
			</aside>
		</>
	)
}

export function MobileHeader({
	onMenuOpen,
}: {
	onMenuOpen: () => void
}) {
	const pathname = usePathname()

	const pageTitle = pathname.startsWith('/brands/')
		? 'Brand'
		: pathname === '/settings'
			? 'Settings'
			: 'Dashboard'

	return (
		<header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-white px-4 shadow-sm lg:hidden">
			<button
				onClick={onMenuOpen}
				className="rounded-lg p-1.5 text-foreground/60 hover:bg-accent"
				aria-label="Open menu"
			>
				<Menu className="size-5" />
			</button>
			<span className="text-sm font-medium">{pageTitle}</span>
		</header>
	)
}
