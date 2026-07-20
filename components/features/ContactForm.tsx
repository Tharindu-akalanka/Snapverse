"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const inputCls =
    "w-full border-b border-white/20 bg-transparent py-3.5 px-2 text-sm text-white placeholder:text-[#A1A1A1] outline-none transition-all hover:border-white/50 focus:border-white focus-visible:ring-2 focus-visible:ring-white rounded-t-sm min-h-[48px]";

// FormSubmit.co endpoint — replace the email address with the real recipient
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/snapverse.studio@gmail.com";

export function ContactForm() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMsg("");

        const form = e.currentTarget;
        const formData = new FormData(form);

        // FormSubmit.co configuration fields
        formData.append("_subject", "New Enquiry from SnapVerse Website");
        formData.append("_captcha", "false");
        formData.append("_template", "table");

        try {
            const res = await fetch(FORMSUBMIT_ENDPOINT, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData,
            });

            if (res.ok) {
                setStatus("success");
                form.reset();
            } else {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "Server error. Please try again.");
            }
        } catch (err: any) {
            console.error("Contact form error:", err);
            setErrorMsg(err.message || "Failed to send your message. Please try again or contact us directly via WhatsApp.");
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="flex flex-col items-center justify-center gap-6 bg-[#1A1A1A] p-12 text-center" aria-live="polite">
                <CheckCircle2 className="h-12 w-12 text-white animate-bounce" strokeWidth={1} />
                <h3 className="font-sans text-2xl font-bold uppercase tracking-widest text-white">
                    Message Sent!
                </h3>
                <p className="text-sm tracking-wide text-[#A1A1A1] max-w-sm">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                    onClick={() => setStatus("idle")}
                    className="mt-6 border border-white px-8 py-3.5 min-h-[48px] text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none cursor-pointer active:scale-95"
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 mt-8" noValidate>
            {status === "error" && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider rounded uppercase"
                >
                    {errorMsg}
                </div>
            )}

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2 relative">
                    <label htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                        Name <span aria-hidden="true" className="text-red-400">*</span>
                    </label>
                    <input
                        id="contact-name"
                        name="name"
                        placeholder="Your Full Name"
                        required
                        aria-required="true"
                        className={inputCls}
                    />
                </div>
                <div className="space-y-2 relative">
                    <label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                        Email <span aria-hidden="true" className="text-red-400">*</span>
                    </label>
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        aria-required="true"
                        className={inputCls}
                    />
                </div>
            </div>

            <div className="space-y-2 relative">
                <label htmlFor="contact-service" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                    Service <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <select
                        id="contact-service"
                        name="service"
                        required
                        aria-required="true"
                        className={inputCls + " cursor-pointer uppercase appearance-none pr-10"}
                        style={{ colorScheme: "dark" }}
                        defaultValue=""
                    >
                        <option value="" disabled className="text-[#A1A1A1]">Select a Service</option>
                        <option value="Wedding Photography">Wedding Photography</option>
                        <option value="Engagement Photography">Engagement Photography</option>
                        <option value="Pre-shoot Sessions">Pre-shoot Sessions</option>
                        <option value="Event Coverage">Event Coverage</option>
                        <option value="Commercial & Branding">Commercial &amp; Branding</option>
                        <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#A1A1A1]">
                        <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="space-y-2 relative">
                <label htmlFor="contact-date" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                    Event Date
                </label>
                <input
                    id="contact-date"
                    name="event_date"
                    type="date"
                    className={inputCls + " uppercase"}
                    style={{ colorScheme: "dark" }}
                />
            </div>

            <div className="space-y-2 relative">
                <label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                    Message <span aria-hidden="true" className="text-red-400">*</span>
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell us about your event or project..."
                    className={inputCls + " min-h-[120px] resize-none"}
                    required
                    aria-required="true"
                />
            </div>

            <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 border border-white px-8 py-4 min-h-[48px] text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black mt-12 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 outline-none active:scale-[0.99]"
                disabled={status === "submitting"}
            >
                {status === "submitting" ? (
                    <>
                        <svg aria-hidden="true" className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                    </>
                ) : (
                    "Send Enquiry"
                )}
            </button>
        </form>
    );
}
