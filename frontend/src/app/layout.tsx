import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PATCHPILOT — Find the flaw. Fix the code. Prove the patch.",
  description:
    "AI-powered security scanner that finds vulnerabilities in Python code, generates patches with Gemma 4, and produces verified security reports.",
  keywords: ["security", "code scanner", "vulnerability", "AI", "Python", "Gemma 4"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 flex flex-col min-h-screen antialiased font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
