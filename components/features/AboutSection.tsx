import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function AboutSection() {
    return (
        <section className="bg-[#0B0B0B] py-32 text-white overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">

                    {/* Image side */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden group">
                        <Image
                            src="/Images/Home scroll/DSC02517.jpg"
                            alt="SnapVerse Photographer in action"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                    </div>

                    {/* Text side */}
                    <div className="flex flex-col justify-center">
                        <h2 className="mb-8 font-sans text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white leading-tight">
                            Capturing Stories <br />
                            <span className="text-[#A1A1A1]">That Matter</span>
                        </h2>

                        <div className="space-y-6 text-[#A1A1A1] font-light text-lg max-w-lg mb-12">
                            <p>
                                SnapVerse is a premium photography studio dedicated to preserving life's most meaningful moments. We believe in high contrast, cinematic storytelling, and minimalistic focus on what matters most—you.
                            </p>
                            <p>
                                We approach every session with an editorial eye, ensuring your memories are captured with a bold, beautiful standard that stands the test of time.
                            </p>
                        </div>

                        <div>
                            <Link
                                href="/about"
                                className="inline-flex items-center justify-center border border-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
                            >
                                Learn More About Us
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
