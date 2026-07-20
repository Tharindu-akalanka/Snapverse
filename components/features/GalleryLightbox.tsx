"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Image as ImageType } from "@/data/albums";

interface GalleryLightboxProps {
    images: ImageType[];
}

export function GalleryLightbox({ images }: GalleryLightboxProps) {
    const [index, setIndex] = useState<number | null>(null);

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

    // Prevent background page scrolling when the lightbox is open
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

    // Handle keyboard events (Escape, ArrowRight, ArrowLeft)
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
                                    <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">View Enlarge</span>
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
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image lightbox viewer"
                    >
                        <button
                            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-white hover:border-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none transition-all z-[60] md:top-8 md:right-8"
                            onClick={() => setIndex(null)}
                            aria-label="Close lightbox"
                        >
                            <X size={20} />
                        </button>

                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0B]/80 text-white hover:text-white hover:border-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none transition-all z-[60] md:left-8"
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div
                            className="relative flex flex-col items-center justify-center w-full h-[80vh] max-w-5xl mx-auto pointer-events-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="relative flex flex-col items-center justify-center w-full h-full pointer-events-auto"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={currentImage.src}
                                        alt={currentImage.alt}
                                        className="max-w-full max-h-[72vh] object-contain rounded border border-white/5 shadow-2xl"
                                    />
                                    {currentImage.alt && (
                                        <div className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#A1A1A1] max-w-lg bg-[#0B0B0B]/80 px-4 py-2 border border-white/5 backdrop-blur-md rounded-sm">
                                            {currentImage.alt}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0B]/80 text-white hover:text-white hover:border-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none transition-all z-[60] md:right-8"
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                            aria-label="Next image"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
