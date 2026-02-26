"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Image as ImageType } from "@/data/albums";
import { cn } from "@/lib/utils";

interface GalleryLightboxProps {
    images: ImageType[];
}

export function GalleryLightbox({ images }: GalleryLightboxProps) {
    const [index, setIndex] = useState<number | null>(null);

    const currentImage = index !== null ? images[index] : null;

    const nextImage = () => {
        if (index !== null) {
            setIndex((index + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (index !== null) {
            setIndex((index - 1 + images.length) % images.length);
        }
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
                        className="cursor-zoom-in break-inside-avoid inline-block w-full"
                        onClick={() => setIndex(i)}
                    >
                        <div className="relative overflow-hidden bg-[#1A1A1A] group">
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
                    >
                        <button
                            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-white hover:border-white transition-all z-[60] md:top-8 md:right-8"
                            onClick={() => setIndex(null)}
                        >
                            <X size={20} />
                        </button>

                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0B]/80 text-white hover:text-white hover:border-white transition-all z-[60] md:left-8"
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div
                            className="relative flex items-center justify-center w-full h-[85vh] max-w-6xl mx-auto pointer-events-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={currentImage.src}
                                alt={currentImage.alt}
                                className="max-w-full max-h-full object-contain pointer-events-auto"
                            />
                        </div>

                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0B]/80 text-white hover:text-white hover:border-white transition-all z-[60] md:right-8"
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
