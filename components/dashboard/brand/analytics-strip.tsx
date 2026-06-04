'use client'

interface StatCard {
	label: string
	value: string
	hint: string
}

const stats: StatCard[] = [
	{ label: 'Impressions', value: '—', hint: 'No data yet' },
	{ label: 'Reactions', value: '—', hint: 'No data yet' },
	{ label: 'Followers', value: '—', hint: 'No data yet' },
	{ label: 'Engagement', value: '—', hint: 'No data yet' },
]

export function AnalyticsStrip() {
	return (
		<section>
			<div className="grid divide-y divide-black/[0.05] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
				{stats.map((stat) => (
					<div key={stat.label} className="p-5">
						<p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
							{stat.label}
						</p>
						<p
							className="mt-2 text-2xl font-semibold tabular-nums text-foreground/85"
							style={{ letterSpacing: '-0.03em' }}
						>
							{stat.value}
						</p>
						<p className="mt-1 text-xs text-muted-foreground/70">
							{stat.hint}
						</p>
					</div>
				))}
			</div>
		</section>
	)
}
