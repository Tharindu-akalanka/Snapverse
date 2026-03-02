import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

const approaches = [
    {
        step: "01",
        title: "Connection",
        description:
            "We take the time to know you, ensuring your personality shines through every image.",
    },
    {
        step: "02",
        title: "Craft",
        description:
            "Using state-of-the-art equipment and expert lighting techniques to create timeless quality.",
    },
    {
        step: "03",
        title: "Curation",
        description:
            "Careful selection and editing to deliver a cohesive and stunning visual story.",
    },
];

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#0B0B0B] text-white">
                {/* Hero Section */}
                <Section className="pb-16 pt-32 lg:pt-40">
                    <Container>
                        <div className="flex flex-col-reverse lg:grid gap-12 lg:gap-16 lg:grid-cols-2">
                            <div className="flex flex-col justify-center">
                                <div className="mb-6 inline-flex w-fit items-center border border-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                                    Our Story
                                </div>
                                <h1 className="mb-8 font-sans text-5xl font-bold uppercase tracking-tight text-white md:text-6xl lg:text-7xl leading-[0.9]">
                                    Capturing the Essence of Life
                                </h1>
                                <p className="mb-6 text-sm md:text-base leading-relaxed text-[#A1A1A1] tracking-wide max-w-lg">
                                    SnapVerse was born from a passion for storytelling. We
                                    believe that every moment has a unique narrative waiting to
                                    be told. Our approach is minimal, candid, and focused on
                                    genuine emotion.
                                </p>
                                <p className="mb-12 text-sm md:text-base leading-relaxed text-[#A1A1A1] tracking-wide max-w-lg">
                                    Whether it's the quiet intimacy of a wedding day or the bold
                                    energy of a brand campaign, we bring a refined aesthetic to
                                    every project. We don't just take photos; we create visual
                                    legacies.
                                </p>
                                <div>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center border border-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
                                    >
                                        Work With Us
                                    </Link>
                                </div>
                            </div>

                            <div className="relative aspect-[4/5] lg:aspect-[3/4] w-full overflow-hidden bg-[#0B0B0B] group">
                                <Image
                                    src="/Images/photographer.jpeg"
                                    alt="Photographer at work"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                                {/* Overlay to blend it nicely into the dark bg on mobile */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent opacity-80 lg:opacity-0" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />

                                {/* Photographer Label */}
                                <div className="absolute bottom-6 left-6 
                                              bg-[#0B0B0B]/80 backdrop-blur-md border border-white/10 
                                              px-4 py-2 flex items-center gap-2 transform transition-transform duration-500 group-hover:-translate-y-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                                        Main Photographer
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Section>

                {/* Approach Section */}
                <Section className="bg-[#1A1A1A] py-32">
                    <Container>
                        <div className="mb-16 text-center max-w-3xl mx-auto">
                            <h2 className="font-sans text-4xl md:text-6xl font-bold uppercase tracking-tight text-white">
                                Our Approach
                            </h2>
                            <p className="mt-6 text-base md:text-lg text-[#A1A1A1] tracking-wide">
                                We blend documentary storytelling with an editorial aesthetic for images that will stand the test of time.
                            </p>
                        </div>
                        <div className="mt-16 grid gap-8 md:grid-cols-3">
                            {approaches.map((item) => (
                                <div
                                    key={item.step}
                                    className="flex flex-col p-10 bg-[#0B0B0B] border border-white/5 transition-colors hover:border-white/20"
                                >
                                    <div className="mb-8 flex h-16 w-16 items-center justify-center border border-white/20 text-xl font-sans font-bold text-white">
                                        {item.step}
                                    </div>
                                    <h3 className="mb-4 font-sans text-xl font-bold uppercase tracking-widest text-white">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-[#A1A1A1] tracking-wide">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Container>
                </Section>

                {/* Stats Banner */}
                <Section className="bg-[#0B0B0B] py-32 border-t border-white/5 border-b border-white/5">
                    <Container>
                        <div className="grid grid-cols-2 gap-y-16 gap-x-8 md:grid-cols-4 divide-x divide-white/5">
                            {[
                                { value: "50+", label: "Happy Clients" },
                                { value: "3+", label: "Years of Passion" },
                                { value: "1000+", label: "Delivered" },
                                { value: "100%", label: "Satisfaction" },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center px-4">
                                    <div className="font-sans text-5xl md:text-7xl font-bold text-white mb-4">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Container>
                </Section>
            </main>
            <Footer />
        </>
    );
}
