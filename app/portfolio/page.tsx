"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { AlbumGrid } from "@/components/features/AlbumGrid";
import { albums as staticAlbums, Album } from "@/data/albums";
import { getDbAlbums, getMergedAlbums } from "@/lib/db-albums";
import { cn } from "@/lib/utils";

const categories = ["All", "Wedding", "Engagement", "Pre-shoot", "Events", "Commercial", "Birthday", "Graduation"];

function PortfolioContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category") || "All";
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [allAlbums, setAllAlbums] = useState<Album[]>(staticAlbums);

    useEffect(() => {
        const loadAlbums = async () => {
            try {
                const dbAlbums = await getDbAlbums();
                if (dbAlbums && dbAlbums.length > 0) {
                    const merged = getMergedAlbums(staticAlbums, dbAlbums);
                    setAllAlbums(merged);
                }
            } catch (err) {
                console.error("Failed to load custom albums:", err);
            }
        };
        loadAlbums();
    }, []);

    const filteredAlbums =
        activeCategory === "All"
            ? allAlbums
            : allAlbums.filter((album) => album.category === activeCategory);


    return (
        <>
            <Section className="pb-24 pt-40 bg-[#0B0B0B] min-h-screen">
                <Container>
                    <div className="mb-16 text-center">
                        <h1 className="font-sans text-5xl md:text-7xl font-bold uppercase tracking-tight text-white">
                            Our Works
                        </h1>
                        <p className="mt-6 mx-auto max-w-xl text-sm md:text-base text-[#A1A1A1] tracking-wide">
                            Explore our collection of stories captured through the lens.
                        </p>
                    </div>

                    {/* Category filters — mobile horizontal scrollable pill bar, desktop flex-wrap */}
                    <div className="relative mb-12 md:mb-16">
                        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 px-1 snap-x sm:justify-center sm:flex-wrap">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={cn(
                                        "min-h-[44px] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-300 shrink-0 snap-start rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer",
                                        activeCategory === category
                                            ? "bg-white text-black border-white shadow-lg shadow-white/10 scale-105"
                                            : "bg-[#1A1A1A]/80 border-white/15 text-[#A1A1A1] hover:border-white hover:text-white"
                                    )}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AlbumGrid albums={filteredAlbums} />
                </Container>
            </Section>
        </>
    );
}

export default function PortfolioPage() {
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#0B0B0B]">
                <Suspense fallback={
                    <div className="flex min-h-screen items-center justify-center text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">
                        Loading Portfolio...
                    </div>
                }>
                    <PortfolioContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
