"use client";

import React, { useEffect, useState } from "react";
import { BookingData } from "@/app/booking/page";
import { packagesByCategory } from "@/data/packages";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";

interface BookingFormStepProps {
  bookingData: BookingData;
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>;
  onNext: () => void;
  onPrev: () => void;
}

const categories = [
  "Wedding",
  "Engagement",
  "Pre-shoot",
  "Graduation",
  "Events",
  "Birthday",
  "Commercial",
];

export function BookingFormStep({
  bookingData,
  setBookingData,
  onNext,
  onPrev,
}: BookingFormStepProps) {
  const [error, setError] = useState("");
  const currentPackages = packagesByCategory[bookingData.category] || [];

  // Reset or pre-select first package if category changes
  useEffect(() => {
    if (currentPackages.length > 0) {
      const match = currentPackages.find((p) => p.id === bookingData.packageId);
      if (!match) {
        setBookingData((prev) => ({ ...prev, packageId: currentPackages[0].id }));
      }
    } else {
      setBookingData((prev) => ({ ...prev, packageId: "custom" }));
    }
  }, [bookingData.category, currentPackages, setBookingData, bookingData.packageId]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBookingData((prev) => ({
      ...prev,
      category: e.target.value,
      packageId: "", // will be reset by useEffect
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData((prev) => ({ ...prev, date: e.target.value }));
  };

  const handlePackageSelect = (pkgId: string) => {
    setBookingData((prev) => ({ ...prev, packageId: pkgId }));
  };

  const handleRequirementsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setBookingData((prev) => ({ ...prev, requirements: e.target.value }));
  };

  // Get tomorrow's date for validation
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!bookingData.category || !bookingData.date || !bookingData.packageId) {
      setError("Please fill in all details and select a package.");
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-sans text-2xl font-bold uppercase tracking-widest text-white mb-2">
          Booking Details
        </h2>
        <p className="text-xs text-[#A1A1A1] tracking-wide">
          Select your service type, date, and preferred package details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div
            role="alert"
            className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider rounded uppercase mb-6"
          >
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="booking-category"
              className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2"
            >
              Shoot Category{" "}
              <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                id="booking-category"
                value={bookingData.category}
                onChange={handleCategoryChange}
                required
                aria-required="true"
                className="w-full h-10 px-3 py-2 bg-transparent text-white border border-white/10 rounded-md text-sm outline-none focus:ring-2 focus:ring-white transition-all appearance-none cursor-pointer pr-10"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#1A1A1A] text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-[#A1A1A1]">
                <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="booking-date"
              className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2"
            >
              Preferred Date{" "}
              <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <Input
              id="booking-date"
              type="date"
              value={bookingData.date}
              onChange={handleDateChange}
              min={getMinDate()}
              required
              aria-required="true"
              className="border-white/10 bg-transparent text-white focus-visible:ring-white py-6"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-4">
            Select Package
          </label>
          <div role="radiogroup" aria-label="Select Shoot Package" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentPackages.map((pkg) => {
              const isSelected = bookingData.packageId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg.id)}
                  tabIndex={0}
                  role="radio"
                  aria-checked={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      handlePackageSelect(pkg.id);
                    }
                  }}
                  className={`border p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none ${
                    isSelected
                      ? "border-white bg-white/5"
                      : "border-white/5 bg-transparent hover:border-white/20"
                  }`}
                >
                  <div>
                    <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white mb-2">
                      {pkg.name}
                    </h3>
                    <div className="text-[10px] text-[#A1A1A1] uppercase tracking-wider font-semibold mb-4">
                      {pkg.price}
                    </div>
                    <ul className="space-y-2 text-[11px] text-[#A1A1A1] leading-relaxed">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-white shrink-0">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            {/* Custom/Flexible Option */}
            <div
              onClick={() => handlePackageSelect("custom")}
              tabIndex={0}
              role="radio"
              aria-checked={bookingData.packageId === "custom"}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  handlePackageSelect("custom");
                }
              }}
              className={`border p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none ${
                bookingData.packageId === "custom"
                  ? "border-white bg-white/5"
                  : "border-white/5 bg-transparent hover:border-white/20"
              }`}
            >
              <div>
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-white mb-2">
                  Custom Plan
                </h3>
                <div className="text-[10px] text-[#A1A1A1] uppercase tracking-wider font-semibold mb-4">
                  Tailored Details
                </div>
                <p className="text-[11px] text-[#A1A1A1] leading-relaxed">
                  Have unique needs? Select this option and detail your customized requirements in the field below. We&apos;ll adjust based on your goals.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="booking-requirements"
            className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2"
          >
            Description of Requirements
            {bookingData.packageId === "custom" && (
              <span aria-hidden="true" className="text-red-400 ml-1">*</span>
            )}
          </label>
          <Textarea
            id="booking-requirements"
            placeholder="Please share specific shoot styles, locations, hours, themes, or custom package needs here."
            value={bookingData.requirements}
            onChange={handleRequirementsChange}
            required={bookingData.packageId === "custom"}
            aria-required={bookingData.packageId === "custom"}
            className="border-white/10 bg-transparent text-white focus-visible:ring-white min-h-[120px] p-4"
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onPrev}
            className="w-1/3 border border-white bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="w-2/3 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
