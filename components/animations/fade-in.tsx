'use client'

import { motion, type Variants } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
	children: ReactNode
	className?: string
	delay?: number
	duration?: number
	direction?: 'up' | 'down' | 'left' | 'right' | 'none'
	distance?: number
}

export function FadeIn({
	children,
	className,
	delay = 0,
	duration = 0.8,
	direction = 'up',
	distance = 40,
}: FadeInProps) {
	const directionOffset = {
		up: { y: distance },
		down: { y: -distance },
		left: { x: distance },
		right: { x: -distance },
		none: {},
	}

	const variants: Variants = {
		hidden: {
			opacity: 0,
			...directionOffset[direction],
		},
		visible: {
			opacity: 1,
			x: 0,
			y: 0,
			transition: {
				duration,
				delay,
				ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
			},
		},
	}

	return (
		<motion.div
			className={className}
			variants={variants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.1 }}
		>
			{children}
		</motion.div>
	)
}
