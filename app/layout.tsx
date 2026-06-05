import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { ConvexClientProvider } from './ConvexClientProvider'
import './globals.css'

const geistSans = Geist({
	variable: '--font-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Smove - AI for Agencies',
	description:
		'We deploy AI agents to help agencies save 80% of their time on social media retainers without compromising on quality.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col bg-background text-foreground font-sans">
				<ConvexClientProvider>{children}</ConvexClientProvider>
			</body>
		</html>
	)
}
