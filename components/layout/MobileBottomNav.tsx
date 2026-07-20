"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, Info, MessageSquare, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/portfolio", label: "Works", icon: Images },
    { href: "/booking", label: "Book", icon: Calendar, highlight: true },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: MessageSquare },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Mobile Navigation Bar"
            className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0B0B0B]/95 backdrop-blur-xl border-t border-white/10 pb-safe px-3 pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
        >
            <div className="flex items-center justify-around max-w-md mx-auto h-14">
                {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.highlight) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className="group relative flex flex-col items-center justify-center min-w-[56px] h-full"
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-300 shadow-md",
                                    isActive
                                        ? "bg-white text-black border-white scale-105"
                                        : "bg-white/10 text-white border-white/30 group-hover:bg-white group-hover:text-black"
                                )}>
                                    <Icon size={20} strokeWidth={2} />
                                </div>
                                <span className="sr-only">{item.label}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[48px] h-full px-2 rounded-lg transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white",
                                isActive ? "text-white font-bold" : "text-[#A1A1A1] hover:text-white"
                            )}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.5} className="transition-transform duration-200 group-active:scale-95" />
                            <span className="text-[10px] uppercase font-semibold tracking-wider mt-1 leading-none">
                                {item.label}
                            </span>
                            {isActive && (
                                <span className="w-1 h-1 rounded-full bg-white mt-1" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
