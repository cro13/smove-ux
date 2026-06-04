'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerChildrenProps {
	children: ReactNode
	className?: string
	staggerDelay?: number
	initialDelay?: number
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: (custom: { staggerDelay: number; initialDelay: number }) => ({
		opacity: 1,
		transition: {
			delayChildren: custom.initialDelay,
			staggerChildren: custom.staggerDelay,
		},
	}),
}

export const staggerItemVariants = {
	hidden: { opacity: 0, y: 40 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.7,
			ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
		},
	},
}

export function StaggerChildren({
	children,
	className,
	staggerDelay = 0.1,
	initialDelay = 0,
}: StaggerChildrenProps) {
	return (
		<motion.div
			className={className}
			variants={containerVariants}
			custom={{ staggerDelay, initialDelay }}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.1 }}
		>
			{children}
		</motion.div>
	)
}
