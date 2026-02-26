import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { GalleryLightbox } from "@/components/features/GalleryLightbox";
import { albums } from "@/data/albums";

export async function generateStaticParams() {
    return albums.map((album) => ({
        slug: album.slug,
    }));
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const album = albums.find((a) => a.slug === slug);

    if (!album) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0B0B] text-white">
                <h1 className="text-2xl font-bold uppercase tracking-widest text-[#A1A1A1]">
                    Album not found
                </h1>
                <Link
                    href="/portfolio"
                    className="mt-8 inline-flex items-center justify-center border border-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
                >
                    Back to Our Works
                </Link>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#0B0B0B] text-white">
                {/* Album Header */}
                <Section className="pb-0 pt-32 lg:pt-40">
                    <Container>
                        {/* Back link */}
                        <Link
                            href="/portfolio"
                            className="mb-12 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1] transition-colors hover:text-white"
                        >
                            ← Back to Our Works
                        </Link>

                        <div className="mt-4 mb-16 max-w-4xl">
                            {/* Category badge */}
                            <div className="mb-6 inline-flex items-center border border-white/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                                {album.category}
                            </div>
                            <h1 className="mb-8 font-sans text-5xl font-bold uppercase tracking-tight text-white md:text-7xl lg:text-8xl">
                                {album.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-8 text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-3">
                                    <span>Location:</span>
                                    <span className="text-white">{album.location}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span>Date:</span>
                                    <span className="text-white">{album.year}</span>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Section>

                {/* Gallery */}
                <Section className="pt-0 pb-32">
                    <Container>
                        <p className="mb-16 max-w-2xl text-sm md:text-base leading-relaxed text-[#A1A1A1] tracking-wide">
                            {album.description}
                        </p>
                        <GalleryLightbox images={album.images} />
                    </Container>
                </Section>

                {/* CTA Banner */}
                <Section className="bg-[#1A1A1A] py-32 border-t border-white/5">
                    <Container>
                        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                            <h2 className="mb-6 font-sans text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
                                Like What You See?
                            </h2>
                            <p className="mb-12 text-sm md:text-base text-[#A1A1A1] tracking-wide leading-relaxed">
                                We'd love to capture your special moments. Get in touch to
                                discuss your project with us.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center border border-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
                            >
                                Book This Visual Style
                            </Link>
                        </div>
                    </Container>
                </Section>
            </main>
            <Footer />
        </>
    );
}
