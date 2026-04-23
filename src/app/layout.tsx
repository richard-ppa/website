import type { Metadata } from "next";
import { Archivo, Geist, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  axes: ["wdth"],
});

const geist = Geist({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const inter = Inter({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ppa.aero"),
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
  alternates: {
    canonical: "https://ppa.aero",
  },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://ppa.aero/#organization",
  name: "Plane Place Aviation",
  description:
    "FAA Part 145 repair station specializing exclusively in Hawker, Citation, and Challenger aircraft maintenance, inspections, and AOG response.",
  url: "https://ppa.aero",
  telephone: "+1-817-768-8884",
  email: "info@ppa.aero",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1650 Airport Dr, Hangar 98",
    addressLocality: "Cleburne",
    addressRegion: "TX",
    postalCode: "76033",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 32.3537,
    longitude: -97.4339,
  },
  logo: "https://ppa.aero/images/ppa-logo.png",
  image: "https://ppa.aero/images/PPA-Employees.jpg",
  sameAs: [
    "https://www.linkedin.com/company/plane-place-aviation",
    "https://www.facebook.com/planeplaceaviation",
    "https://www.instagram.com/planeplaceaviation",
  ],
  foundingDate: "2022",
  founders: [
    { "@type": "Person", name: "Tristan Noe" },
    { "@type": "Person", name: "Travis Roberson" },
  ],
  numberOfEmployees: { "@type": "QuantitativeValue", minValue: 40 },
  areaServed: [
    { "@type": "State", name: "Texas" },
    { "@type": "State", name: "Oklahoma" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Aircraft Maintenance Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Scheduled Maintenance & Phase Inspections" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Pre-Purchase Inspections" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AOG Emergency Response" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Structural Repairs" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Avionics Troubleshooting & Repair" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Maintenance Management & Consulting" } },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${geist.variable} ${inter.variable}`}>
      <head>
        {/* Google Analytics — replace G-XXXXXXXXXX with your GA4 measurement ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
