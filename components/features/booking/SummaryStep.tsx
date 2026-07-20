"use client";

import React, { useState } from "react";
import { BookingData } from "@/app/booking/page";
import { useAuth } from "@/lib/contexts/AuthContext";
import { packagesByCategory } from "@/data/packages";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

interface SummaryStepProps {
  bookingData: BookingData;
  onPrev: () => void;
}

// Helper to race a promise against a timeout
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
};

export function SummaryStep({ bookingData, onPrev }: SummaryStepProps) {
  const { user, profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const currentPackages = packagesByCategory[bookingData.category] || [];
  const selectedPkg = currentPackages.find((p) => p.id === bookingData.packageId);
  const packageName = selectedPkg ? selectedPkg.name : "Custom Plan";

  const handleCopySummary = () => {
    if (!profile) return;
    const message = `Hello SnapVerse! 📸\n\nI'd like to book a photography session. Here are my details:\n\n👤 CLIENT DETAILS:\n- Name: ${profile.name}\n- Email: ${profile.email}\n- Phone: ${profile.phone}\n- Address: ${profile.address}\n\n📅 BOOKING DETAILS:\n- Category: ${bookingData.category}\n- Date: ${bookingData.date}\n- Package: ${packageName}\n- Description/Requirements: ${bookingData.requirements || "None"}\n\nLooking forward to hearing from you!`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmAndSend = async () => {
    if (!user || !profile) return;
    setError("");
    setSubmitting(true);

    try {
      // 1. Save Booking details to Firestore (if database is configured)
      if (db) {
        const bookingDoc = {
          userId: user.uid,
          clientName: profile.name,
          clientEmail: profile.email,
          clientPhone: profile.phone,
          clientAddress: profile.address,
          category: bookingData.category,
          date: bookingData.date,
          packageId: bookingData.packageId,
          packageName: packageName,
          requirements: bookingData.requirements,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        try {
          // Try to save to Firestore, but timeout after 3 seconds so offline doesn't block WhatsApp booking
          await withTimeout(
            addDoc(collection(db, "bookings"), bookingDoc),
            3000,
            undefined
          );
        } catch (dbErr) {
          console.warn("Failed to save booking to Firestore (offline or connection issue). Proceeding to WhatsApp.", dbErr);
        }
      } else {
        console.warn("Firestore database not configured. Skipping Firestore storage.");
      }

      // 2. Format WhatsApp Message
      const message = `Hello SnapVerse! 📸\n\nI'd like to book a photography session. Here are my details:\n\n👤 CLIENT DETAILS:\n- Name: ${profile.name}\n- Email: ${profile.email}\n- Phone: ${profile.phone}\n- Address: ${profile.address}\n\n📅 BOOKING DETAILS:\n- Category: ${bookingData.category}\n- Date: ${bookingData.date}\n- Package: ${packageName}\n- Description/Requirements: ${bookingData.requirements || "None"}\n\nLooking forward to hearing from you!`;

      // 3. Open WhatsApp in new window
      const whatsappNumber = process.env.NEXT_PUBLIC_SNAPVERSE_WHATSAPP_NUMBER || "94771234567";
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, "_blank");
      setSuccess(true);
    } catch (err: any) {
      console.error("Error creating booking:", err);
      setError(err.message || "Failed to submit booking to database.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="w-16 h-16 bg-white/5 border border-white rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-sans text-2xl font-bold uppercase tracking-widest text-white mb-4">
          Booking Submitted!
        </h2>
        <p className="text-xs text-[#A1A1A1] leading-relaxed tracking-wide mb-8">
          Your booking details have been saved, and we&apos;ve opened WhatsApp to send the summary directly to the photographer. If the window did not open, please verify pop-up blockers, copy the summary below, or contact us directly.
        </p>
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleCopySummary}
            type="button"
            className="w-full border border-white bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none cursor-pointer"
          >
            {copied ? "COPIED TO CLIPBOARD!" : "COPY SUMMARY TO CLIPBOARD"}
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            className="w-full bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none cursor-pointer"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-sans text-2xl font-bold uppercase tracking-widest text-white mb-2">
          Booking Summary
        </h2>
        <p className="text-xs text-[#A1A1A1] tracking-wide">
          Please review your registration details and shoot requirements before sending.
        </p>
      </div>

      <div className="space-y-8">
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider rounded uppercase">
            {error}
          </div>
        )}

        {/* Info Grid */}
        <div className="border border-white/5 divide-y divide-white/5 text-xs bg-black/10">
          {/* Client Info */}
          <div className="p-6">
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white mb-4">
              👤 Client Contact
            </h3>
            <div className="space-y-3 leading-relaxed text-[#A1A1A1]">
              <div className="flex justify-between">
                <span className="uppercase font-semibold tracking-wider text-[10px]">Name</span>
                <span className="text-white">{profile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="uppercase font-semibold tracking-wider text-[10px]">Phone</span>
                <span className="text-white">{profile?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="uppercase font-semibold tracking-wider text-[10px]">Email</span>
                <span className="text-white">{profile?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="uppercase font-semibold tracking-wider text-[10px]">Address</span>
                <span className="text-white text-right max-w-xs">{profile?.address}</span>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div className="p-6">
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white mb-4">
              📅 Booking & Shoot Details
            </h3>
            <div className="space-y-3 leading-relaxed text-[#A1A1A1]">
              <div className="flex justify-between">
                <span className="uppercase font-semibold tracking-wider text-[10px]">Shoot Category</span>
                <span className="text-white">{bookingData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="uppercase font-semibold tracking-wider text-[10px]">Preferred Date</span>
                <span className="text-white">{bookingData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="uppercase font-semibold tracking-wider text-[10px]">Selected Plan</span>
                <span className="text-white">{packageName}</span>
              </div>
              {bookingData.requirements && (
                <div className="pt-2">
                  <span className="block uppercase font-semibold tracking-wider text-[10px] mb-2">Requirements</span>
                  <p className="text-white whitespace-pre-line text-left bg-[#0B0B0B]/50 p-4 border border-white/5">
                    {bookingData.requirements}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onPrev}
            disabled={submitting}
            className="w-1/3 border border-white bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none cursor-pointer"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirmAndSend}
            disabled={submitting}
            className="w-2/3 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none cursor-pointer"
          >
            {submitting ? "Submitting Booking..." : "Send Booking to SnapVerse"}
          </Button>
        </div>
      </div>
    </div>
  );
}
