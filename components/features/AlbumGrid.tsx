"use client";

import { Album } from "@/data/albums";
import { AlbumCard } from "./AlbumCard";
import { motion } from "framer-motion";

interface AlbumGridProps {
    albums: Album[];
}

export function AlbumGrid({ albums }: AlbumGridProps) {
    return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {albums.map((album, index) => (
                <motion.div
                    key={album.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3), ease: "easeOut" }}
                    className="break-inside-avoid"
                >
                    <AlbumCard album={album} />
                </motion.div>
            ))}
        </div>
    );
}
