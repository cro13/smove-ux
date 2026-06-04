'use client'

import { LineChart } from 'lucide-react'

export function InsightsPanel() {
	return (
		<section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
			<div className="flex items-center justify-between border-b border-black/[0.05] px-5 py-4">
				<div>
					<h2 className="text-sm font-semibold text-foreground">
						Performance
					</h2>
					<p className="text-xs text-muted-foreground">
						Across all connected channels
					</p>
				</div>
				<div className="flex items-center gap-2">
					<select
						className="rounded-lg border border-black/[0.08] bg-white px-2.5 py-1.5 text-xs font-medium text-foreground/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
						defaultValue="all"
						aria-label="Select channel"
					>
						<option value="all">All channels</option>
						<option value="linkedin">LinkedIn</option>
						<option value="instagram">Instagram</option>
						<option value="facebook">Facebook</option>
					</select>
					<select
						className="rounded-lg border border-black/[0.08] bg-white px-2.5 py-1.5 text-xs font-medium text-foreground/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
						defaultValue="followers"
						aria-label="Select metric"
					>
						<option value="followers">Followers</option>
						<option value="impressions">Impressions</option>
						<option value="engagement">Engagement</option>
					</select>
				</div>
			</div>

			<div className="relative">
				<div
					className="absolute inset-0 opacity-[0.55]"
					style={{
						backgroundImage:
							'linear-gradient(to bottom, rgba(16,24,40,0.05) 1px, transparent 1px)',
						backgroundSize: '100% 25%',
					}}
					aria-hidden="true"
				/>
				<div className="relative flex flex-col items-center justify-center px-6 py-16">
					<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/40">
						<LineChart className="size-5" strokeWidth={1.75} />
					</div>
					<h3 className="text-sm font-semibold text-foreground">
						Nothing to chart yet
					</h3>
					<p className="mt-1 max-w-sm text-center text-xs leading-relaxed text-muted-foreground">
						Once your agents start publishing, follower growth, reach and
						engagement will plot here automatically.
					</p>
				</div>
			</div>
		</section>
	)
}
