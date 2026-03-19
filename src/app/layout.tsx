import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Plane Place Aviation | Hawker, Citation & Challenger MRO — Cleburne, TX",
    template: "%s | Plane Place Aviation",
  },
  description:
    "FAA Part 145 repair station specializing exclusively in Hawker, Citation, and Challenger aircraft. Precise. Professional. Attentive. Founder-led service in Cleburne, Texas.",
  keywords: [
    "hawker maintenance texas",
    "citation maintenance DFW",
    "challenger MRO texas",
    "pre-purchase inspection",
    "FAA Part 145 repair station texas",
    "AOG service texas",
    "aircraft maintenance cleburne texas",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero",
    siteName: "Plane Place Aviation",
    title: "Plane Place Aviation | Hawker, Citation & Challenger MRO",
    description:
      "The specialist MRO for Hawker, Citation & Challenger — founder-led, fast turnaround, transparent pricing.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
