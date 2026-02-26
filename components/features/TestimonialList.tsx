"use client";

import { motion } from "framer-motion";

const testimonials = [
    {
        quote: "Our wedding photos are beyond what we ever imagined. Every emotion, every laugh, every tear was captured so beautifully. We'll treasure these forever.",
        author: "Rangana & Nayani",
        role: "Wedding Couple",
    },
    {
        quote: "SnapVerse brought our brand to life with incredible commercial photography. The images elevated our entire campaign and the team was an absolute pleasure to work with.",
        author: "Monacar International",
        role: "Commercial Client",
    },
    {
        quote: "Our pre-shoot sessions were so relaxed and fun. The photos came out absolutely magical — you can feel the love in every single frame.",
        author: "Nipuna & Subhashi",
        role: "Pre-shoot Couple",
    },
];

export function TestimonialList() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="flex flex-col p-8 bg-[#1A1A1A]"
                >
                    <p className="mb-8 flex-1 text-base leading-relaxed text-white font-light">
                        "{testimonial.quote}"
                    </p>
                    <div className="border-t border-white/10 pt-6">
                        <div className="font-sans text-sm font-bold uppercase tracking-widest text-white mb-1">
                            {testimonial.author}
                        </div>
                        <div className="text-xs text-[#A1A1A1] uppercase tracking-wider">
                            {testimonial.role}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
