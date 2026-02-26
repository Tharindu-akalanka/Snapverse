import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/features/ContactForm";
import { Phone, MessageCircle, Instagram, Facebook, Music } from "lucide-react";

export const metadata = {
    title: "Contact | SnapVerse",
    description: "Get in touch with SnapVerse for premium event & lifestyle photography.",
};

const contactDetails = [
    {
        icon: Phone,
        label: "Phone",
        value: "+94 76 087 3315",
        href: "tel:+94760873315",
    },
    {
        icon: MessageCircle,
        label: "WhatsApp",
        value: "+94 78 887 3316",
        href: "https://wa.me/94788873316",
    },
];

const socials = [
    { href: "https://www.instagram.com/snapverse.studio?igsh=Z2VvOHR2MWp4em1v", label: "Instagram", icon: Instagram },
    { href: "https://www.facebook.com/share/1Ga8mK4JA4/", label: "Facebook", icon: Facebook },
    { href: "https://www.tiktok.com/@snapverse_?_r=1&_t=ZS-94FKe4ZcSPM", label: "TikTok", icon: Music }, // Using Music icon as an alternative for TikTok since it's not base lucide
];

export default function ContactPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#0B0B0B] text-white">
                {/* ── Page header ── */}
                <div className="pt-32 pb-16 text-center px-4">
                    <div className="mb-6 inline-flex items-center border border-white px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                        Book a Session
                    </div>
                    <h1 className="font-sans text-4xl md:text-6xl font-bold uppercase tracking-tight text-white">
                        Get in Touch
                    </h1>
                    <p className="mt-6 mx-auto max-w-sm md:max-w-md text-sm text-[#A1A1A1] leading-relaxed tracking-wide">
                        We'd love to hear about your vision. Fill out the form and
                        we'll get back to you within 24 hours.
                    </p>
                </div>

                {/* ── Content grid ── */}
                <Container>
                    <div className="pb-24 grid gap-12 lg:grid-cols-5 lg:gap-24">

                        {/* Left — contact info card */}
                        <div className="lg:col-span-2 flex flex-col gap-12">
                            {/* Contact details */}
                            <div className="flex flex-col gap-8">
                                {contactDetails.map(({ icon: Icon, label, value, href }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        className="group flex flex-col gap-3"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Icon size={20} className="text-[#A1A1A1] group-hover:text-white transition-colors" strokeWidth={1.5} />
                                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1] group-hover:text-white transition-colors">
                                                {label}
                                            </div>
                                        </div>
                                        <p className="text-lg font-light text-white tracking-widest pl-9">
                                            {value}
                                        </p>
                                    </a>
                                ))}
                            </div>

                            <hr className="border-t border-white/10" />

                            {/* Social links */}
                            <div className="flex flex-col gap-6">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                                    Follow Us
                                </div>
                                <div className="flex gap-4">
                                    {socials.map(({ href, label, icon: Icon }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={label}
                                            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-[#A1A1A1] transition-all duration-300 hover:scale-110 hover:border-white hover:bg-white hover:text-black"
                                        >
                                            <Icon size={20} strokeWidth={1.5} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right — form */}
                        <div className="lg:col-span-3 bg-[#1A1A1A] p-8 md:p-12">
                            <h2 className="mb-2 font-sans text-2xl font-bold uppercase tracking-widest text-white">
                                Send a Message
                            </h2>
                            <p className="text-sm text-[#A1A1A1] tracking-wide mb-8">
                                All fields marked are required.
                            </p>
                            <ContactForm />
                        </div>

                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
