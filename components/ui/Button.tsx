"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import Link from "next/link"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] disabled:pointer-events-none disabled:opacity-40",
    {
        variants: {
            variant: {
                default:
                    "bg-[#C9A84C] text-black font-semibold hover:bg-[#e2c47a] shadow-[0_0_20px_rgba(201,168,76,0.25)] hover:shadow-[0_0_28px_rgba(201,168,76,0.4)]",
                destructive:
                    "bg-red-700 text-white hover:bg-red-600",
                outline:
                    "border border-[#C9A84C]/50 bg-transparent text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black",
                secondary:
                    "bg-[#252525] text-[#f0ece4] hover:bg-[#2e2e2e]",
                ghost:
                    "bg-transparent text-white/70 hover:bg-white/10 hover:text-white",
                link:
                    "text-[#C9A84C] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-9 px-4 text-xs",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, children, ...props }, ref) => {
        // When asChild is true, clone the single child element and pass button styles to it
        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
                className: cn(
                    buttonVariants({ variant, size }),
                    (children as React.ReactElement<{ className?: string }>).props.className,
                    className
                ),
            })
        }
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

// Convenience link-button component — avoids the asChild pattern entirely
export function ButtonLink({
    href,
    variant,
    size,
    className,
    children,
}: {
    href: string
    children: React.ReactNode
    className?: string
} & VariantProps<typeof buttonVariants>) {
    return (
        <Link href={href} className={cn(buttonVariants({ variant, size, className }))}>
            {children}
        </Link>
    )
}

export { Button, buttonVariants }
