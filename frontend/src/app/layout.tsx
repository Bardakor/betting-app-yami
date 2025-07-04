import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yami Betting - Professional Hub",
  description: "Advanced football betting platform with real-time odds and analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}>
        <AuthProvider>
          <ProtectedLayout>
            {children}
          </ProtectedLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
