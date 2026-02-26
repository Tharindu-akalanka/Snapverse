"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Album } from "@/data/albums";
import { cn } from "@/lib/utils";

interface AlbumCardProps {
    album: Album;
    className?: string;
}

export function AlbumCard({ album, className }: AlbumCardProps) {
    return (
        <Link href={`/portfolio/${album.slug}`} className={cn("group block", className)}>
            <motion.div
                className="relative overflow-hidden bg-[#1A1A1A] mb-4"
            >
                <div className="relative aspect-[3/4] w-full">
                    <Image
                        src={album.coverImage}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Dark gradient reveal on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-sans text-sm font-bold uppercase tracking-[0.2em] border border-white px-6 py-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Project
                        </span>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-4 left-4 border border-white/20 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                        {album.category}
                    </div>
                </div>
            </motion.div>

            <div className="flex flex-col gap-1">
                <h3 className="line-clamp-1 text-lg font-sans font-bold uppercase tracking-tight text-white group-hover:text-[#A1A1A1] transition-colors duration-200">
                    {album.title}
                </h3>
                <p className="text-xs uppercase tracking-widest text-[#A1A1A1]">
                    {album.location}
                </p>
            </div>
        </Link>
    );
}
