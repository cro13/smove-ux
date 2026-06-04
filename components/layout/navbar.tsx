'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const SMOVE_LOGO_URL =
	'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4ebd8e68-4cde-439b-8859-2820929ed47a_320w.png'

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 20)
		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<motion.header
			className="fixed top-0 left-0 right-0 z-50 px-4 pt-3"
			initial={{ y: -80, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
		>
			<motion.nav
				layout
				className={cn(
					'mx-auto flex items-center justify-between transition-all duration-300',
					isScrolled
						? 'max-w-3xl rounded-full px-5 py-2 backdrop-blur-xl'
						: 'max-w-7xl px-2 py-3'
				)}
				style={
					isScrolled
						? {
								backgroundColor: 'rgba(255, 255, 255, 0.95)',
								boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.08)',
							}
						: undefined
				}
			>
				<Link href="/" className="flex items-center" aria-label="Smove home">
					<span
						className="block w-20 h-[15px] bg-cover"
						style={{ backgroundImage: `url(${SMOVE_LOGO_URL})` }}
					/>
				</Link>

				<div className="hidden md:flex items-center gap-7">
					<Link
						href="/agents"
						className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
					>
						Agents
					</Link>
					<Link
						href="/register"
						className="inline-flex items-center rounded-full bg-gray-900 text-white hover:bg-gray-800 h-9 px-4 text-sm font-medium shadow-sm transition-colors"
					>
						Get started
					</Link>
				</div>

				<button
					className="md:hidden flex flex-col gap-1.5 p-2"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					aria-label="Toggle menu"
					aria-expanded={isMobileMenuOpen}
				>
					<motion.span
						className="w-5 h-0.5 bg-gray-900 block"
						animate={isMobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
					/>
					<motion.span
						className="w-5 h-0.5 bg-gray-900 block"
						animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
					/>
					<motion.span
						className="w-5 h-0.5 bg-gray-900 block"
						animate={isMobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
					/>
				</button>
			</motion.nav>

			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						className="md:hidden mt-2 mx-auto max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
					>
						<div className="px-6 py-6 flex flex-col gap-4">
							<Link
								href="/agents"
								className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Agents
							</Link>
							<Link
								href="/register"
								onClick={() => setIsMobileMenuOpen(false)}
								className="inline-flex items-center justify-center w-full h-10 rounded-full bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium transition-colors"
							>
								Get started
							</Link>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	)
}
