'use client'

import { Menu } from '@base-ui/react/menu'

import { cn } from '@/lib/utils'

function DropdownMenu({ ...props }: Menu.Root.Props) {
	return <Menu.Root {...props} />
}

function DropdownMenuTrigger({ ...props }: Menu.Trigger.Props) {
	return <Menu.Trigger {...props} />
}

function DropdownMenuContent({
	className,
	sideOffset = 4,
	side = 'bottom',
	align = 'end',
	...props
}: Menu.Popup.Props & Pick<Menu.Positioner.Props, 'sideOffset' | 'side' | 'align'>) {
	return (
		<Menu.Portal>
			<Menu.Positioner side={side} align={align} sideOffset={sideOffset}>
				<Menu.Popup
					className={cn(
						'z-50 min-w-[132px] rounded-lg bg-white p-1 shadow-[0_4px_16px_rgba(16,24,40,0.1)] ring-1 ring-black/[0.06] outline-none',
						'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
						'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
						className,
					)}
					{...props}
				/>
			</Menu.Positioner>
		</Menu.Portal>
	)
}

function DropdownMenuItem({
	className,
	destructive = false,
	...props
}: Menu.Item.Props & { destructive?: boolean }) {
	return (
		<Menu.Item
			className={cn(
				'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none select-none',
				destructive
					? 'text-red-600 hover:bg-red-50'
					: 'text-foreground hover:bg-foreground/[0.05]',
				className,
			)}
			{...props}
		/>
	)
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			role="separator"
			className={cn('-mx-1 my-1 h-px bg-border', className)}
			{...props}
		/>
	)
}

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
}
