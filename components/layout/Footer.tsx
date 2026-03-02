"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Our Works" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

const socialLinks = [
    {
        href: "https://www.instagram.com/snapverse.studio?igsh=Z2VvOHR2MWp4em1v",
        label: "Instagram",
        icon: Instagram,
    },
    {
        href: "https://www.facebook.com/share/1Ga8mK4JA4/",
        label: "Facebook",
        icon: Facebook,
    },
    {
        href: "https://www.tiktok.com/@snapverse_?_r=1&_t=ZS-94FKe4ZcSPM",
        label: "TikTok",
        icon: null,
    },
];

const contactDetails = [
    {
        icon: MessageCircle,
        label: "WhatsApp",
        value: "0788 873 316",
        href: "https://wa.me/94788873316",
    },
    {
        icon: Phone,
        label: "Phone",
        value: "0760 873 315",
        href: "tel:+94760873315",
    },
];

const services = [
    "Wedding",
    "Pre-shoot",
    "Birthday",
    "Commercial",
    "Events",
];

function TikTokIcon({ size = 18 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.72a8.17 8.17 0 0 0 4.79 1.54V6.79a4.85 4.85 0 0 1-1.02-.1z" />
        </svg>
    );
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07, duration: 0.5, ease: EASE },
    }),
};

export function Footer() {
    return (
        <footer className="relative overflow-hidden bg-[#0B0B0B] text-[#A1A1A1]">
            {/* Gradient hairline top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Faint radial glow */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-20"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 80%)",
                }}
            />

            <div className="relative mx-auto max-w-7xl px-6 md:px-12 pt-16 pb-8">

                {/* ════════════════════════════════════
                    MOBILE layout  (hidden on lg+)
                ════════════════════════════════════ */}
                <div className="lg:hidden flex flex-col gap-10">

                    {/* Brand — centered */}
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0 }} custom={0}
                        className="flex flex-col items-center text-center gap-4"
                    >
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <Image
                                src="/logo.png" alt="Snapverse Logo"
                                width={28} height={28}
                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="font-sans text-lg font-bold tracking-[0.22em] text-white uppercase">
                                SNAPVERSE
                            </span>
                        </Link>

                        <p className="text-xs leading-relaxed tracking-wide text-[#777] max-w-[260px]">
                            Moments in Focus — timeless imagery, every frame.
                        </p>

                        {/* Social icons row */}
                        <div className="flex items-center gap-3 mt-1">
                            {socialLinks.map(({ href, label, icon: Icon }) => (
                                <a
                                    key={label} href={href}
                                    target="_blank" rel="noreferrer" aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center border border-white/10 text-[#A1A1A1]
                                               transition-all duration-300 hover:border-white/40 hover:text-white hover:bg-white/5"
                                >
                                    {Icon ? <Icon size={15} strokeWidth={1.5} /> : <TikTokIcon size={15} />}
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Services + Contact — 2 columns */}
                    <div className="grid grid-cols-2 gap-6">

                        {/* Services */}
                        <motion.div
                            variants={fadeUp} initial="hidden" whileInView="visible"
                            viewport={{ once: true, amount: 0 }} custom={1}
                            className="flex flex-col gap-4"
                        >
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                                Services
                            </h3>
                            <ul className="flex flex-col gap-2.5">
                                {services.map((s) => (
                                    <li key={s} className="flex items-center gap-2 text-xs tracking-wide">
                                        <span className="h-px w-3 shrink-0 bg-white/25" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Contact */}
                        <motion.div
                            variants={fadeUp} initial="hidden" whileInView="visible"
                            viewport={{ once: true, amount: 0 }} custom={2}
                            className="flex flex-col gap-4"
                        >
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                                Contact
                            </h3>
                            <div className="flex flex-col gap-4">
                                {contactDetails.map(({ icon: Icon, label, value, href }) => (
                                    <a
                                        key={label} href={href}
                                        target="_blank" rel="noreferrer"
                                        className="group flex flex-col gap-0.5 text-xs tracking-wide transition-colors duration-300 hover:text-white"
                                    >
                                        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#555]">
                                            <Icon size={11} strokeWidth={1.5} />
                                            {label}
                                        </span>
                                        <span className="text-sm font-medium text-[#A1A1A1] group-hover:text-white transition-colors">
                                            {value}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* CTA — full width */}
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0 }} custom={3}
                    >
                        <Link
                            href="/contact"
                            className="flex w-full items-center justify-center border border-white px-6 py-3
                                       text-xs font-bold uppercase tracking-[0.2em] text-white
                                       transition-colors duration-300 hover:bg-white hover:text-black"
                        >
                            Book a Session
                        </Link>
                    </motion.div>
                </div>

                {/* ════════════════════════════════════
                    DESKTOP layout  (hidden below lg)
                ════════════════════════════════════ */}
                <div className="hidden lg:grid gap-12 grid-cols-4">

                    {/* Brand */}
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0 }} custom={0}
                        className="flex flex-col gap-5"
                    >
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <Image
                                src="/logo.png" alt="Snapverse Logo"
                                width={30} height={30}
                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <span className="font-sans text-xl font-bold tracking-[0.22em] text-white uppercase">
                                SNAPVERSE
                            </span>
                        </Link>

                        <p className="text-sm leading-relaxed tracking-wide max-w-xs">
                            We craft timeless imagery — from intimate weddings to bold
                            commercial campaigns. Every frame tells your story.
                        </p>

                        <div className="h-px w-10 bg-white/20" />

                        <div className="flex items-center gap-4">
                            {socialLinks.map(({ href, label, icon: Icon }) => (
                                <a
                                    key={label} href={href}
                                    target="_blank" rel="noreferrer" aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center border border-white/10 text-[#A1A1A1]
                                               transition-all duration-300 hover:border-white/40 hover:text-white hover:bg-white/5"
                                >
                                    {Icon ? <Icon size={16} strokeWidth={1.5} /> : <TikTokIcon size={16} />}
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Navigate */}
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0 }} custom={1}
                        className="flex flex-col gap-6"
                    >
                        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white">Navigate</h3>
                        <nav className="flex flex-col gap-3">
                            {navLinks.map(({ href, label }) => (
                                <Link
                                    key={href} href={href}
                                    className="group flex items-center gap-2 text-sm tracking-wide transition-colors duration-300 hover:text-white"
                                >
                                    <span className="h-px w-4 bg-white/20 transition-all duration-300 group-hover:w-6 group-hover:bg-white/60" />
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Services */}
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0 }} custom={2}
                        className="flex flex-col gap-6"
                    >
                        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white">Services</h3>
                        <ul className="flex flex-col gap-3 text-sm tracking-wide">
                            {["Wedding Photography", "Pre-shoot", "Birthday Shoots", "Commercial", "Events"].map((s) => (
                                <li key={s} className="flex items-center gap-2">
                                    <span className="h-px w-4 bg-white/20" />{s}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0 }} custom={3}
                        className="flex flex-col gap-6"
                    >
                        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white">Get In Touch</h3>
                        <div className="flex flex-col gap-4">
                            {contactDetails.map(({ icon: Icon, label, value, href }) => (
                                <a
                                    key={label} href={href}
                                    target="_blank" rel="noreferrer"
                                    className="group flex items-center gap-3 text-sm tracking-wide transition-colors duration-300 hover:text-white"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/10
                                                     text-[#A1A1A1] transition-all duration-300 group-hover:border-white/30 group-hover:text-white">
                                        <Icon size={14} strokeWidth={1.5} />
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-widest text-[#555]">{label}</span>
                                        <span>{value}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                        <Link
                            href="/contact"
                            className="mt-2 inline-flex items-center justify-center border border-white px-6 py-2.5
                                       text-xs font-bold uppercase tracking-[0.15em] text-white
                                       transition-colors duration-300 hover:bg-white hover:text-black"
                        >
                            Book a Session
                        </Link>
                    </motion.div>
                </div>

                {/* ── Bottom bar (shared) ── */}
                <div className="relative mt-12">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex flex-col items-center justify-between gap-3 pt-7 text-[10px] tracking-widest uppercase sm:flex-row">
                        <span className="text-[#444]">
                            &copy; {new Date().getFullYear()} Snapverse. All rights reserved.
                        </span>
                        <span className="text-[#444]">
                            Crafted with passion · Sri Lanka
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
