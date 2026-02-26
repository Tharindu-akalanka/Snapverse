"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Camera, Heart, PartyPopper, GraduationCap, CalendarDays, Cake, Briefcase } from "lucide-react";

const services = [
    {
        title: "Weddings",
        icon: Heart,
        image: "/Images/Soucre images/Wedding/Rangana & Nayani/cover.webp",
        link: "/portfolio?category=Wedding",
    },
    {
        title: "Engagements",
        icon: Camera,
        image: "/Images/Soucre images/Engagement/Rangana & Nayani/cover.webp",
        link: "/portfolio?category=Engagement",
    },
    {
        title: "Pre-shoots",
        icon: CalendarDays,
        image: "/Images/Soucre images/Preeshoot/Nipuna & Subhashi session 2/cover.webp",
        link: "/portfolio?category=Pre-shoot",
    },
    {
        title: "Graduations",
        icon: GraduationCap,
        image: "/Images/Soucre images/Graduation/f3 Dimali/cover.webp",
        link: "/portfolio?category=Graduation",
    },
    {
        title: "Events",
        icon: PartyPopper,
        image: "/Images/Soucre images/Event/f5 Sagies Campu AMS AGM/cover.jpg",
        link: "/portfolio?category=Events",
    },
    {
        title: "Birthday",
        icon: Cake,
        image: "/Images/Soucre images/Birthday/f1 Akarshana/cover.webp",
        link: "/portfolio?category=Birthday",
    },
    {
        title: "Commercial",
        icon: Briefcase,
        image: "/Images/Soucre images/Commercial/Monacar International/cover.webp",
        link: "/portfolio?category=Commercial",
    }
];

export function ServicesSection() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 lg:px-0">
            {services.map((service, index) => {
                const Icon = service.icon;
                return (
                    <Link href={service.link} key={service.title} className="block group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative aspect-[4/5] overflow-hidden bg-[#0a0a0a] border border-white/5"
                        >
                            {/* Background Image */}
                            <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-60"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />

                            {/* Dark interaction overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 transition-opacity duration-500">

                                {/* Icon & Title Group */}
                                <div className="flex flex-col items-center justify-center text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="mb-4 p-4 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-500">
                                        <Icon size={24} className="text-white group-hover:text-black" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-sans text-xl lg:text-2xl font-bold uppercase tracking-[0.2em] text-white">
                                        {service.title}
                                    </h3>

                                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-[10px] font-bold uppercase tracking-[0.3em] text-[#A1A1A1]">
                                        Explore Work
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                );
            })}
        </div>
    );
}
