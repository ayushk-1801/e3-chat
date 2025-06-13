import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import React from 'react'

enum VaraintColor {
    orange = 'orange',
    blue = 'blue',
    green = 'green',
    primary = 'primary',
}

const GlowButton = ({
    children,
    variant = VaraintColor.primary,
    disableChevron = false,
    className
}: {
    children: React.ReactNode,
    variant?: VaraintColor,
    disableChevron?: boolean,
    className?: string
}) => {
    return (
        <button className={cn("hover:opacity-[0.90] rounded-full border font-extralight relative overflow-hidden after:absolute after:content-[''] after:inset-0 after:[box-shadow:0_0_15px_-1px_#ffffff90_inset] after:rounded-full before:absolute before:content-[''] before:inset-0 before:rounded-full flex items-center justify-center before:z-20 after:z-10 px-3 py-2",
            variant === VaraintColor.orange ? "[box-shadow:0_0_100px_-10px_#DE732C] before:[box-shadow:0_0_4px_-1px_#fff_inset] bg-[#DE732C] border-[#f8d4b3]/80" 
            : variant === VaraintColor.blue ? "[box-shadow:0_0_100px_-10px_#0165FF] before:[box-shadow:0_0_7px_-1px_#d5e5ff_inset] bg-[#126fff] border-[#9ec4ff]/90"
            : variant === VaraintColor.primary ? "[box-shadow:0_0_100px_-10px_hsl(var(--primary))] before:[box-shadow:0_0_10px_-1px_hsl(var(--primary-foreground))_inset] bg-primary border-primary/60"
            : "[box-shadow:0_0_100px_-10px_#21924c] before:[box-shadow:0_0_7px_-1px_#91e6b2_inset] bg-[#176635] border-[#c0f1d3]/70", className)}>
            <div className="flex items-center gap-2 z-30">
                {children}
                {!disableChevron && <ChevronDown className='w-4 h-4' />}
            </div>
        </button>
    )
}

export default GlowButton