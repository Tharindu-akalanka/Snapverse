"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Album } from "@/data/albums";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AlbumDetails } from "./AlbumDetails";

interface DynamicAlbumLoaderProps {
    slug: string;
}

export function DynamicAlbumLoader({ slug }: DynamicAlbumLoaderProps) {
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchAlbum = async () => {
            if (!db) {
                setError(true);
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, "albums", slug);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAlbum(docSnap.data() as Album);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error fetching dynamic album:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [slug]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0B0B] text-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                            Loading Album Details...
                        </span>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !album) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0B0B] text-white px-4">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-[#A1A1A1] text-center">
                        Album not found
                    </h1>
                    <p className="mt-2 text-xs text-neutral-500 tracking-wide text-center">
                        The dynamic shoot album you are looking for does not exist or has been deleted.
                    </p>
                    <Link
                        href="/portfolio"
                        className="mt-8 inline-flex items-center justify-center border border-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
                    >
                        Back to Our Works
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <AlbumDetails album={album} />
            <Footer />
        </>
    );
}
