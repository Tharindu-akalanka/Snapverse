import { Hero } from "@/components/features/Hero";
import { AboutSection } from "@/components/features/AboutSection";
import { ServicesSection } from "@/components/features/ServicesSection";
import { TestimonialList } from "@/components/features/TestimonialList";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#0B0B0B]">
        <Hero />
        <AboutSection />

        {/* Services */}
        <Section className="bg-[#0B0B0B] py-32">
          <Container>
            <div className="mb-16 text-center">
              <h2 className="font-sans text-4xl font-bold uppercase tracking-tight text-white md:text-5xl">
                Our Services
              </h2>
            </div>
            <div>
              <ServicesSection />
            </div>
          </Container>
        </Section>

        {/* Testimonials */}
        <Section className="bg-[#0B0B0B] py-32 border-t border-white/5">
          <Container>
            <div className="mb-16 text-center">
              <h2 className="font-sans text-4xl font-bold uppercase tracking-tight text-white md:text-5xl">
                Client Love
              </h2>
            </div>
            <div>
              <TestimonialList />
            </div>
          </Container>
        </Section>

        {/* CTA Banner */}
        <Section className="bg-[#0B0B0B] py-40 border-t border-white/5">
          <Container>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="mb-12 font-sans text-4xl font-bold uppercase tracking-tight text-white md:text-6xl lg:text-7xl leading-tight">
                Let's Capture <br />Your Moment.
              </h2>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-white px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
              >
                Book A Session
              </Link>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
