'use client'

import { useMutation } from 'convex/react'
import { motion } from 'framer-motion'
import { FormEvent, useState } from 'react'

import { api } from '@/convex/_generated/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'

interface WaitlistFormProps {
	isOpen: boolean
	onClose: () => void
}

export function WaitlistForm({ isOpen, onClose }: WaitlistFormProps) {
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const submitWaitlist = useMutation(api.waitlist.submit)

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsLoading(true)

		const formData = new FormData(e.currentTarget)

		try {
			await submitWaitlist({
				fullName: formData.get('fullName') as string,
				email: formData.get('email') as string,
				agencyName: formData.get('agencyName') as string,
				phone: (formData.get('phone') as string) || undefined,
				referralSource: (formData.get('referralSource') as string) || undefined,
			})
			setIsSubmitted(true)
		} catch {
			setIsSubmitted(true)
		} finally {
			setIsLoading(false)
		}
	}

	const handleClose = () => {
		setIsSubmitted(false)
		onClose()
	}

	if (isSubmitted) {
		return (
			<Modal isOpen={isOpen} onClose={handleClose} title="You're on the list!">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center py-4"
				>
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
						<span className="text-success text-2xl">&#10003;</span>
					</div>
					<p className="text-muted-foreground">
						We&apos;ll be in touch soon with updates about Smove AI.
					</p>
				</motion.div>
			</Modal>
		)
	}

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Join the Waitlist">
			<p className="text-sm text-muted-foreground mb-6">
				Be among the first to experience Smove AI
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					name="fullName"
					type="text"
					placeholder="Full Name"
					required
					className="h-11 rounded-xl"
				/>
				<Input
					name="email"
					type="email"
					placeholder="Company Email"
					required
					className="h-11 rounded-xl"
				/>
				<Input
					name="agencyName"
					type="text"
					placeholder="Agency Name"
					required
					className="h-11 rounded-xl"
				/>
				<Input
					name="phone"
					type="tel"
					placeholder="Phone Number"
					className="h-11 rounded-xl"
				/>
				<select
					name="referralSource"
					className="w-full h-11 px-2.5 rounded-xl border border-input bg-transparent text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none transition-colors appearance-none"
					defaultValue=""
				>
					<option value="" disabled className="bg-popover text-muted-foreground">
						How did you hear about us?
					</option>
					<option value="linkedin" className="bg-popover">LinkedIn</option>
					<option value="google" className="bg-popover">Google Search</option>
					<option value="referral" className="bg-popover">Referral from a colleague</option>
					<option value="social" className="bg-popover">Social Media</option>
					<option value="event" className="bg-popover">Event or Conference</option>
					<option value="other" className="bg-popover">Other</option>
				</select>
				<Button
					type="submit"
					className="w-full h-11 rounded-xl glow-button"
					disabled={isLoading}
				>
					{isLoading ? 'Submitting...' : 'Get started'}
				</Button>
			</form>
		</Modal>
	)
}
