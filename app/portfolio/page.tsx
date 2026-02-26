"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { AlbumGrid } from "@/components/features/AlbumGrid";
import { albums } from "@/data/albums";
import { cn } from "@/lib/utils";

const categories = ["All", "Wedding", "Engagement", "Pre-shoot", "Events", "Commercial", "Birthday", "Graduation"];

function PortfolioContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category") || "All";
    const [activeCategory, setActiveCategory] = useState(initialCategory);

    const filteredAlbums =
        activeCategory === "All"
            ? albums
            : albums.filter((album) => album.category === activeCategory);

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

                    {/* Category filters */}
                    <div className="mb-16 flex flex-wrap justify-center gap-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={cn(
                                    "px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border transition-colors duration-300",
                                    activeCategory === category
                                        ? "bg-white text-black border-white"
                                        : "bg-transparent border-white/20 text-[#A1A1A1] hover:border-white hover:text-white"
                                )}
                            >
                                {category}
                            </button>
                        ))}
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
