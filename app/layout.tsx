import type { Metadata } from "next";
import "./globals.css";
import { AuthContextProvider } from "@/lib/contexts/AuthContext";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DriveAutoSyncListener } from "@/components/features/DriveAutoSyncListener";

export const metadata: Metadata = {
  title: "SnapVerse | Capturing Moments",
  description: "Premium photography services for weddings, events, and portraits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col font-sans pb-16 md:pb-0">
        <AuthContextProvider>
          <DriveAutoSyncListener />
          {children}
          <MobileBottomNav />
        </AuthContextProvider>
      </body>
    </html>
  );
}


