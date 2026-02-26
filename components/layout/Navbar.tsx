"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Our Works" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export function Navbar() {
    const pathname = usePathname();
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
                        className="flex items-center gap-3 shrink-0 group"
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
                    <nav className="hidden md:flex items-center gap-10">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300",
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
                    <div className="flex items-center gap-6">
                        {/* Book Now — outlined white */}
                        <Link
                            href="/contact"
                            className="hidden md:inline-flex items-center justify-center border border-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
                        >
                            Book Now
                        </Link>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex h-10 w-10 items-center justify-center text-white"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="Toggle menu"
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
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-x-0 top-[80px] z-40 md:hidden bg-[#0B0B0B] border-b border-white/5 shadow-2xl"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            <nav className="flex flex-col gap-6">
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
                                            className={cn(
                                                "text-sm font-bold tracking-[0.15em] uppercase transition-colors",
                                                pathname === link.href
                                                    ? "text-white"
                                                    : "text-[#A1A1A1]"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>
                            <div className="pt-6 border-t border-white/5">
                                <Link
                                    href="/contact"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center justify-center border border-white px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
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
