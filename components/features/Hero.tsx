"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const SLIDE_DURATION = 5000; // ms

// All images from Home scroll folder — special chars URL-encoded
const HOME_SCROLL_IMAGES = [
    "/Images/Home%20scroll/1%20(2).webp",
    "/Images/Home%20scroll/1.webp",
    "/Images/Home%20scroll/11%20(2).webp",
    "/Images/Home%20scroll/475648540_645979347991474_5350606519633991104_n.webp",
    "/Images/Home%20scroll/481152334_662752489656180_7156316482861265439_n.webp",
    "/Images/Home%20scroll/482083104_677509001513862_2089495571908001255_n.webp",
    "/Images/Home%20scroll/482086833_677522061512556_4129434418737044553_n.webp",
    "/Images/Home%20scroll/5.webp",
    "/Images/Home%20scroll/8.webp",
    "/Images/Home%20scroll/DSC02517.jpg",
    "/Images/Home%20scroll/DSC09790.webp",
    "/Images/Home%20scroll/Untitled-1.webp",
];

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function Hero() {
    const [current, setCurrent] = useState(0);
    // Start with fixed order; shuffle client-side after mount to avoid hydration mismatch
    const [heroImages, setHeroImages] = useState(HOME_SCROLL_IMAGES);

    useEffect(() => {
        setHeroImages(shuffle([...HOME_SCROLL_IMAGES]));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroImages.length);
        }, SLIDE_DURATION);
        return () => clearInterval(interval);
    }, [heroImages]);

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0B0B]">
            {/* Background Slideshow */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="sync">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('${heroImages[current]}')` }}
                    />
                </AnimatePresence>
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/40 via-[#0B0B0B]/60 to-[#0B0B0B]" />
            </div>

            {/* Content */}
            <div className="container relative z-10 mx-auto px-6 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="max-w-4xl mx-auto flex flex-col items-center justify-center pt-20"
                >
                    <h1 className="mb-6 font-sans text-5xl uppercase tracking-wide text-white md:text-7xl lg:text-8xl leading-tight">
                        <span className="font-bold">MOMENTS</span> <br />
                        <span className="font-normal opacity-90">IN FOCUS</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-sm md:max-w-md text-sm md:text-base font-light text-[#dcdcdc] tracking-wide">
                        Premium event & lifestyle
                        <br />
                        photography
                    </p>

                    <div className="flex flex-col items-center gap-6 w-full max-w-xs md:max-w-none">
                        <Link
                            href="/contact"
                            className="flex w-full md:w-auto md:min-w-[220px] items-center justify-center border border-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
                        >
                            BOOK NOW
                        </Link>
                        <Link
                            href="/portfolio"
                            className="flex items-center justify-center text-xs font-light tracking-[0.1em] text-[#dcdcdc] transition-colors duration-300 hover:text-white group"
                        >
                            View Our Works
                            <span className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2"
            >
                <div className="h-10 w-6 rounded-full border border-white/20 p-1 flex justify-center">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="h-2 w-1.5 rounded-full bg-[#A1A1A1]"
                    />
                </div>
            </motion.div>
        </section>
    );
}
