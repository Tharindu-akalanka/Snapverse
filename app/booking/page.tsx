"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/lib/contexts/AuthContext";
import { AuthStep } from "@/components/features/booking/AuthStep";
import { ProfileStep } from "@/components/features/booking/ProfileStep";
import { BookingFormStep } from "@/components/features/booking/BookingFormStep";
import { SummaryStep } from "@/components/features/booking/SummaryStep";
import { motion, AnimatePresence } from "framer-motion";

export interface BookingData {
  category: string;
  date: string;
  packageId: string;
  requirements: string;
}

export default function BookingPage() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    category: "Wedding",
    date: "",
    packageId: "",
    requirements: "",
  });

  // Automatically advance or regress step based on auth state
  useEffect(() => {
    if (!loading) {
      if (!user) {
        setStep(1);
      } else if (step === 1) {
        // If logged in and on Auth step, advance to Profile step
        setStep(2);
      }
    }
  }, [user, loading, step]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const stepsList = [
    { number: 1, label: "Sign In" },
    { number: 2, label: "Profile" },
    { number: 3, label: "Details" },
    { number: 4, label: "Summary" },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#0B0B0B] text-white min-h-screen">
        <Section className="pb-24 pt-32 lg:pt-40">
          <Container>
            <div className="max-w-4xl mx-auto">
              {/* Stepper Header */}
              <div
                className="mb-10 sm:mb-12"
                role="progressbar"
                aria-valuenow={step}
                aria-valuemin={1}
                aria-valuemax={4}
                aria-valuetext={`Step ${step} of 4: ${stepsList[step - 1].label}`}
              >
                {/* Mobile current step label banner */}
                <div className="text-center mb-6 sm:hidden">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A1A1A1]">
                    STEP {step} OF 4
                  </span>
                  <h2 className="text-lg font-bold uppercase tracking-wider text-white mt-1">
                    {stepsList[step - 1].label}
                  </h2>
                </div>

                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-white -translate-y-1/2 z-0 transition-all duration-500"
                    style={{
                      width: `${((step - 1) / (stepsList.length - 1)) * 100}%`,
                    }}
                  />

                  {stepsList.map((s) => {
                    const isActive = step >= s.number;
                    const isCurrent = step === s.number;

                    return (
                      <div
                        key={s.number}
                        className="flex flex-col items-center z-10"
                      >
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-sans font-bold text-sm border-2 transition-all duration-500 ${
                            isCurrent
                              ? "bg-white text-black border-white scale-110 shadow-lg shadow-white/10"
                              : isActive
                              ? "bg-[#0B0B0B] text-white border-white"
                              : "bg-[#0B0B0B] text-[#A1A1A1] border-white/10"
                          }`}
                        >
                          {s.number}
                        </div>
                        <span
                          className={`mt-3 text-[10px] uppercase font-bold tracking-widest transition-colors duration-500 hidden sm:inline ${
                            isCurrent
                              ? "text-white"
                              : isActive
                              ? "text-white/60"
                              : "text-[#A1A1A1]/40"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Rendering with Animations */}
              <div className="bg-[#1A1A1A]/50 border border-white/5 p-8 md:p-12 backdrop-blur-sm relative overflow-hidden min-h-[400px]">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <span className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white animate-spin" />
                      <span className="text-xs uppercase tracking-widest text-[#A1A1A1]">
                        Checking Auth Status...
                      </span>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      {step === 1 && <AuthStep />}
                      {step === 2 && (
                        <ProfileStep onNext={nextStep} />
                      )}
                      {step === 3 && (
                        <BookingFormStep
                          bookingData={bookingData}
                          setBookingData={setBookingData}
                          onNext={nextStep}
                          onPrev={prevStep}
                        />
                      )}
                      {step === 4 && (
                        <SummaryStep
                          bookingData={bookingData}
                          onPrev={prevStep}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
