"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";

interface ProfileStepProps {
  onNext: () => void;
}

export function ProfileStep({ onNext }: ProfileStepProps) {
  const { user, profile, saveProfile } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Pre-populate fields if profile is already loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setDescription(profile.description || "");
    } else if (user) {
      setName(user.displayName || "");
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      await saveProfile({
        name,
        email: user.email || "",
        phone,
        address,
        description,
      });
      onNext();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save profile details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-sans text-2xl font-bold uppercase tracking-widest text-white mb-2">
          Client Information
        </h2>
        <p className="text-xs text-[#A1A1A1] tracking-wide">
          Please confirm your contact details to proceed with the booking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            role="alert"
            className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider rounded uppercase"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2"
            >
              Full Name{" "}
              <span aria-hidden="true" className="text-red-400">
                *
              </span>
            </label>
            <Input
              id="profile-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-required="true"
              className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 py-6"
            />
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2"
            >
              Phone Number{" "}
              <span aria-hidden="true" className="text-red-400">
                *
              </span>
            </label>
            <Input
              id="profile-phone"
              type="tel"
              placeholder="+94 77 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              aria-required="true"
              className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 py-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2"
          >
            Email Address
          </label>
          <Input
            id="profile-email"
            type="email"
            value={user?.email || ""}
            disabled
            aria-readonly="true"
            aria-describedby="profile-email-hint"
            className="border-white/5 bg-white/5 text-[#A1A1A1] cursor-not-allowed py-6"
          />
          <span id="profile-email-hint" className="sr-only">
            Email address is read-only and cannot be changed.
          </span>
        </div>

        <div>
          <label
            htmlFor="profile-address"
            className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2"
          >
            Home / Billing Address{" "}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>
          <Input
            id="profile-address"
            type="text"
            placeholder="123, Main Street, Colombo, Sri Lanka"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            aria-required="true"
            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 py-6"
          />
        </div>

        <div>
          <label
            htmlFor="profile-description"
            className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2"
          >
            About Yourself / Extra Details{" "}
            <span className="text-[#A1A1A1]/50 normal-case font-normal tracking-normal text-[9px]">
              (Optional)
            </span>
          </label>
          <Textarea
            id="profile-description"
            placeholder="Tell us a little bit about yourself or any details we should know."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 min-h-[120px] p-4"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300 disabled:opacity-50"
        >
          {saving ? "Saving Details..." : "Confirm & Continue"}
        </Button>
      </form>
    </div>
  );
}
