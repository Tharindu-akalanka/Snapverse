"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";

const links = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Our Works" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export function Navbar() {
    const pathname = usePathname();
    const { user, profile, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Focus trap and Escape key listener for mobile menu
    useEffect(() => {
        if (!menuOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                const toggleBtn = document.getElementById("menu-toggle");
                toggleBtn?.focus();
                return;
            }

            if (e.key === "Tab") {
                const menuContainer = document.getElementById("mobile-menu");
                if (!menuContainer) return;
                
                const focusables = menuContainer.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusables.length === 0) return;

                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        
        // Auto-focus the first element in mobile menu when opened
        const timer = setTimeout(() => {
            const menuContainer = document.getElementById("mobile-menu");
            const firstLink = menuContainer?.querySelector<HTMLElement>("a");
            firstLink?.focus();
        }, 100);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            clearTimeout(timer);
        };
    }, [menuOpen]);

    return (
        <>
            {/* Main navbar bar */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    scrolled
                        ? "bg-[#0B0B0B]/80 backdrop-blur-md border-b border-white/5"
                        : "bg-transparent py-2"
                )}
            >
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-12">

                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 shrink-0 group focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 rounded-sm outline-none"
                    >
                        <Image
                            src="/logo.png"
                            alt="SnapVerse Logo"
                            width={32}
                            height={32}
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="font-sans text-xl font-bold tracking-[0.2em] text-white uppercase">
                            SNAPVERSE
                        </span>
                    </Link>

                    {/* Desktop center links */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-10">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={pathname === link.href ? "page" : undefined}
                                className={cn(
                                    "text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 rounded-sm outline-none whitespace-nowrap",
                                    pathname === link.href
                                        ? "text-white"
                                        : "text-[#A1A1A1] hover:text-white"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* User identity — isolated from nav links */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
                                <span className="text-[10px] text-[#A1A1A1] uppercase tracking-wider font-semibold max-w-[120px] truncate">
                                    {profile?.name || user.email?.split("@")[0]}
                                </span>
                                <button
                                    onClick={() => logout()}
                                    className="text-[10px] uppercase font-bold tracking-widest text-red-500/70 hover:text-red-400 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2 rounded-sm outline-none shrink-0"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : null}

                        {/* Book Now — outlined white */}
                        <Link
                            href="/booking"
                            className="hidden md:inline-flex items-center justify-center border border-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none ml-2 shrink-0"
                        >
                            Book Now
                        </Link>

                        {/* Mobile hamburger */}
                        <button
                            id="menu-toggle"
                            className="md:hidden flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 rounded-md outline-none active:scale-95 transition-transform"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                            aria-controls="mobile-menu"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {menuOpen ? (
                                    <motion.span
                                        key="x"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <X size={24} strokeWidth={1.5} />
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="m"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Menu size={24} strokeWidth={1.5} />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        id="mobile-menu"
                        role="dialog"
                        aria-label="Mobile Navigation Menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-x-0 top-[80px] z-40 md:hidden bg-[#0B0B0B] border-b border-white/5 shadow-2xl"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            <nav className="flex flex-col gap-3">
                                {links.map((link, i) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setMenuOpen(false)}
                                            aria-current={pathname === link.href ? "page" : undefined}
                                            className={cn(
                                                "flex items-center min-h-[44px] py-2 px-3 text-sm font-bold tracking-[0.15em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 rounded-sm outline-none active:bg-white/5",
                                                pathname === link.href
                                                    ? "text-white bg-white/10"
                                                    : "text-[#A1A1A1] hover:text-white"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>
                            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                {user && (
                                    <div className="flex items-center justify-between px-2 text-xs">
                                        <span className="text-[#A1A1A1] font-semibold uppercase tracking-wider">
                                            {profile?.name || user.email}
                                        </span>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMenuOpen(false);
                                            }}
                                            className="font-bold text-red-500 uppercase tracking-widest cursor-pointer focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2 rounded-sm outline-none"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                                <Link
                                    href="/booking"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center justify-center border border-white px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none"
                                >
                                    Book a Session
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
