import Image from "next/image";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0B0B0B]">
            <div className="relative flex items-center justify-center">
                {/* Outer gold spinning ring */}
                <div
                    className="h-20 w-20 rounded-full border border-[#C9A84C]/15 border-t-[#C9A84C]/70 animate-spin"
                    style={{ animationDuration: "1.4s" }}
                />
                {/* Inner white counter-spinning ring */}
                <div
                    className="absolute h-14 w-14 rounded-full border border-white/5 border-b-white/30 animate-spin"
                    style={{ animationDuration: "1s", animationDirection: "reverse" }}
                />
                {/* Logo */}
                <span className="absolute flex items-center justify-center">
                    <Image
                        src="/logo.png"
                        alt="Snapverse"
                        width={34}
                        height={34}
                        className="object-contain"
                        priority
                    />
                </span>
            </div>

            {/* Brand label */}
            <span className="mt-6 text-[11px] font-bold tracking-[0.4em] text-white/60 uppercase">
                SNAPVERSE
            </span>
            <span className="mt-1.5 text-[9px] tracking-[0.25em] text-[#C9A84C]/50 uppercase">
                Moments in Focus
            </span>
        </div>
    );
}
