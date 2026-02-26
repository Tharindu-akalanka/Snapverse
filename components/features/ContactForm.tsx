"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const inputCls =
    "w-full border-b border-white/20 bg-transparent py-4 text-sm text-white placeholder:text-[#A1A1A1] outline-none transition-all hover:border-white/50 focus:border-white";

export function ContactForm() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setTimeout(() => setStatus("success"), 1500);
    };

    if (status === "success") {
        return (
            <div className="flex flex-col items-center justify-center gap-6 bg-[#1A1A1A] p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={1} />
                <h3 className="font-sans text-2xl font-bold uppercase tracking-widest text-white">
                    MESSAGE SENT
                </h3>
                <p className="text-sm tracking-wide text-[#A1A1A1]">
                    Thank you for reaching out. We'll get back to you shortly.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2 relative">
                    <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                        Name
                    </label>
                    <input id="name" placeholder="YOUR FULL NAME" required className={inputCls} />
                </div>
                <div className="space-y-2 relative">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                        Email
                    </label>
                    <input id="email" type="email" placeholder="YOUR@EMAIL.COM" required className={inputCls} />
                </div>
            </div>

            <div className="space-y-2 relative">
                <label htmlFor="service" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                    Service
                </label>
                <select
                    id="service"
                    required
                    className={inputCls + " cursor-pointer uppercase appearance-none"}
                    style={{ colorScheme: "dark" }}
                    defaultValue=""
                >
                    <option value="" disabled className="text-[#A1A1A1]">SELECT A SERVICE</option>
                    <option value="wedding">Wedding Photography</option>
                    <option value="engagement">Engagement Photography</option>
                    <option value="pre-shoot">Pre-shoot Sessions</option>
                    <option value="event">Event Coverage</option>
                    <option value="commercial">Commercial & Branding</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="space-y-2 relative">
                <label htmlFor="date" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                    Event Date
                </label>
                <input id="date" type="date" className={inputCls + " uppercase"} style={{ colorScheme: "dark" }} />
            </div>

            <div className="space-y-2 relative">
                <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                    Message
                </label>
                <textarea
                    id="message"
                    placeholder="TELL US ABOUT YOUR EVENT OR PROJECT..."
                    className={inputCls + " min-h-[120px] resize-none"}
                    required
                />
            </div>

            <button
                type="submit"
                className="w-full flex items-center justify-center border border-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-white hover:text-black mt-12 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={status === "submitting"}
            >
                {status === "submitting" ? "SENDING..." : "SEND ENQUIRY"}
            </button>
        </form>
    );
}
