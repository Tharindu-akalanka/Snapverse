import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0B0B0B] py-20 text-[#A1A1A1]">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid gap-12 md:grid-cols-2">
                    {/* Brand */}
                    <div className="flex flex-col">
                        <Link
                            href="/"
                            className="font-sans text-2xl font-bold uppercase tracking-[0.2em] text-white"
                        >
                            SNAPVERSE
                        </Link>
                        <p className="mt-4 text-sm tracking-wide text-[#A1A1A1]">
                            Moments in Focus
                        </p>
                    </div>

                    {/* Contact & Socials */}
                    <div className="flex flex-col md:items-end">
                        <h3 className="mb-6 font-sans text-sm font-bold uppercase tracking-widest text-white">
                            Contact
                        </h3>
                        <div className="flex flex-col gap-3 text-sm md:text-right">
                            <a
                                href="https://www.instagram.com/snapverse.studio?igsh=Z2VvOHR2MWp4em1v"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Instagram
                            </a>
                            <a
                                href="https://www.facebook.com/share/1Ga8mK4JA4/"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Facebook
                            </a>
                            <a
                                href="https://www.tiktok.com/@snapverse_?_r=1&_t=ZS-94FKe4ZcSPM"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-white transition-colors uppercase tracking-widest"
                            >
                                TikTok
                            </a>
                            <span className="uppercase tracking-widest">WhatsApp - 0788873316</span>
                            <span className="uppercase tracking-widest">Phone - 0760873315</span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 text-xs tracking-widest uppercase">
                    <span>&copy; {new Date().getFullYear()} SNAPVERSE. ALL RIGHTS RESERVED.</span>
                </div>
            </div>
        </footer>
    );
}
