"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Image as ImageType } from "@/data/albums";

interface GalleryLightboxProps {
    images: ImageType[];
}

export function GalleryLightbox({ images }: GalleryLightboxProps) {
    const [index, setIndex] = useState<number | null>(null);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const currentImage = index !== null ? images[index] : null;

    const nextImage = useCallback(() => {
        if (index !== null) {
            setIndex((index + 1) % images.length);
        }
    }, [index, images.length]);

    const prevImage = useCallback(() => {
        if (index !== null) {
            setIndex((index - 1 + images.length) % images.length);
        }
    }, [index, images.length]);

    // Prevent background page scrolling when lightbox open
    useEffect(() => {
        if (index !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [index]);

    // Keyboard support
    useEffect(() => {
        if (index === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIndex(null);
            } else if (e.key === "ArrowRight") {
                nextImage();
            } else if (e.key === "ArrowLeft") {
                prevImage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [index, nextImage, prevImage]);

    // Touch gesture handlers for Mobile Swiping
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - touchStartRef.current.x;
        const deltaY = endY - touchStartRef.current.y;

        // Horizontal swipe threshold: 45px
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > 45) {
                if (deltaX < 0) {
                    nextImage();
                } else {
                    prevImage();
                }
            }
        } else {
            // Vertical swipe down threshold: 75px to close
            if (deltaY > 75) {
                setIndex(null);
            }
        }
        touchStartRef.current = null;
    };

    return (
        <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {images.map((image, i) => (
                    <motion.div
                        key={image.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                        className="break-inside-avoid inline-block w-full"
                    >
                        <button
                            onClick={() => setIndex(i)}
                            className="w-full text-left bg-transparent border-0 p-0 cursor-zoom-in group focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none rounded-sm"
                            aria-label={`View enlarged image: ${image.alt || 'photograph'}`}
                        >
                            <div className="relative overflow-hidden bg-[#1A1A1A]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                                    loading="lazy"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                    <span className="text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Maximize2 size={14} /> View Enlarge
                                    </span>
                                </div>
                            </div>
                        </button>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {index !== null && currentImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/96 backdrop-blur-md p-4 md:p-8"
                        onClick={() => setIndex(null)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image lightbox viewer"
                    >
                        {/* Header info & close button */}
                        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-[60] md:top-8 md:inset-x-8">
                            <span className="text-xs uppercase tracking-[0.2em] text-[#A1A1A1] font-semibold bg-black/40 px-3 py-1.5 rounded border border-white/10 backdrop-blur-sm">
                                {index + 1} / {images.length}
                            </span>
                            <button
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:text-white hover:border-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none transition-all cursor-pointer"
                                onClick={() => setIndex(null)}
                                aria-label="Close lightbox"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Desktop Previous Button */}
                        <button
                            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0B]/80 text-white hover:text-white hover:border-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none transition-all z-[60] cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Main Image View */}
                        <div
                            className="relative flex flex-col items-center justify-center w-full h-[75vh] max-w-5xl mx-auto pointer-events-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="relative flex flex-col items-center justify-center w-full h-full pointer-events-auto"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={currentImage.src}
                                        alt={currentImage.alt}
                                        className="max-w-full max-h-[68vh] object-contain rounded border border-white/5 shadow-2xl select-none"
                                    />
                                    {currentImage.alt && (
                                        <div className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#A1A1A1] max-w-lg bg-[#0B0B0B]/90 px-4 py-2 border border-white/10 backdrop-blur-md rounded-sm">
                                            {currentImage.alt}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Desktop Next Button */}
                        <button
                            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0B]/80 text-white hover:text-white hover:border-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none transition-all z-[60] cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                            aria-label="Next image"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Mobile Bottom Thumb Controls Bar */}
                        <div
                            className="flex md:hidden absolute bottom-6 inset-x-6 z-[60] items-center justify-between bg-[#0B0B0B]/90 border border-white/15 rounded-full px-4 py-2 backdrop-blur-lg shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={prevImage}
                                className="flex items-center justify-center w-11 h-11 text-white active:scale-95 transition-transform cursor-pointer"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1]">
                                Swipe or tap arrows
                            </span>

                            <button
                                onClick={nextImage}
                                className="flex items-center justify-center w-11 h-11 text-white active:scale-95 transition-transform cursor-pointer"
                                aria-label="Next image"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
