'use client'

import { ReactNode } from 'react'

interface MarqueeProps {
	children: ReactNode
	className?: string
	reverse?: boolean
	speed?: number
}

export function Marquee({
	children,
	className = '',
	reverse = false,
	speed = 40,
}: MarqueeProps) {
	return (
		<div className={`overflow-hidden ${className}`}>
			<div
				className={`flex gap-6 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
				style={{ animationDuration: `${speed}s` }}
			>
				{children}
				{children}
			</div>
		</div>
	)
}
