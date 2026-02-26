export default function Loading() {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#141414]">
            {/* Pulsing gold ring */}
            <div className="relative flex items-center justify-center">
                <div className="h-14 w-14 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
                <span className="absolute text-[10px] font-semibold tracking-widest text-[#C9A84C]/70 uppercase">
                    SV
                </span>
            </div>
        </div>
    );
}
