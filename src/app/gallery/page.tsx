import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Gallery — Inside the Plane Place Aviation Hangar",
  description:
    "Photos from the Plane Place Aviation hangar in Cleburne, Texas — Hawker, Citation, and Challenger maintenance, winglet installations, avionics work, and the team behind it.",
  alternates: {
    canonical: "https://ppa.aero/gallery",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero/gallery",
    siteName: "Plane Place Aviation",
    title: "Gallery — Inside the Plane Place Aviation Hangar",
    description:
      "Photos from the Plane Place Aviation hangar — Hawker, Citation, and Challenger maintenance in Cleburne, Texas.",
    images: [
      {
        url: "https://ppa.aero/images/Gallery/Hangar-Hawkers.jpg",
        alt: "Hawker aircraft in the Plane Place Aviation hangar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery — Inside the Plane Place Aviation Hangar",
    description:
      "Photos from the Plane Place Aviation hangar — Hawker, Citation, and Challenger maintenance in Cleburne, Texas.",
    images: ["https://ppa.aero/images/Gallery/Hangar-Hawkers.jpg"],
  },
};

type Photo = { src: string; alt: string };

const PHOTOS: Photo[] = [
  { src: "/images/Gallery/Hangar-Hawkers.jpg", alt: "Hawker aircraft in the Plane Place Aviation hangar in Cleburne, Texas" },
  { src: "/images/Gallery/Challenger-MX.jpg", alt: "Bombardier Challenger maintenance at Plane Place Aviation" },
  { src: "/images/Gallery/Citation-Hangar.jpg", alt: "Cessna Citation aircraft in the Plane Place Aviation hangar" },
  { src: "/images/Gallery/Wing-MX---Travis-Angel.jpg", alt: "Travis and Angel performing wing maintenance" },
  { src: "/images/Gallery/Winglet-Install-02.jpg", alt: "Winglet installation in progress at Plane Place Aviation" },
  { src: "/images/Gallery/PPA-HGR-98.jpg", alt: "Plane Place Aviation Hangar 98 at Cleburne Regional Airport" },
  { src: "/images/Gallery/Tech-at-Station.jpg", alt: "Plane Place Aviation technician at workstation reviewing maintenance records" },
  { src: "/images/Gallery/avionics.jpg", alt: "Avionics maintenance at Plane Place Aviation" },
  { src: "/images/Gallery/Engine-MX.jpg", alt: "Business jet engine maintenance at Plane Place Aviation" },
  { src: "/images/Gallery/landing-gear-work.jpg", alt: "Landing gear maintenance at Plane Place Aviation" },
  { src: "/images/Gallery/hawker-mx.jpg", alt: "Hawker maintenance at Plane Place Aviation" },
  { src: "/images/Gallery/Winglet-Install---James.jpg", alt: "Technician James performing winglet installation" },
  { src: "/images/Gallery/Citation-Engine-Work-on-ladder.jpg", alt: "Technician on a ladder performing Citation engine work" },
  { src: "/images/Gallery/Wing-MX-2.jpg", alt: "Aircraft wing maintenance at Plane Place Aviation" },
  { src: "/images/Gallery/Aircraft-in-Hangar---BW.jpg", alt: "Aircraft in the Plane Place Aviation hangar — black and white" },
  { src: "/images/Gallery/Citation-mx-3.jpg", alt: "Cessna Citation maintenance at Plane Place Aviation" },
  { src: "/images/Gallery/Dalton-on-workstation.jpg", alt: "Challenger Lead Dalton Friesenhahn at workstation" },
  { src: "/images/Gallery/avionics2.jpg", alt: "Avionics troubleshooting and repair work" },
  { src: "/images/Gallery/Tail-Work-3.jpg", alt: "Technician performing aircraft tail section maintenance" },
  { src: "/images/Gallery/Wing-Work-4.jpg", alt: "Wing structural work at Plane Place Aviation" },
  { src: "/images/Gallery/tech-on-lift.jpg", alt: "Technician on lift performing aircraft maintenance" },
  { src: "/images/Gallery/PPA-Employees.jpg", alt: "Plane Place Aviation team in front of an aircraft" },
  { src: "/images/Gallery/Winglet-MX---James02.jpg", alt: "James performing winglet maintenance" },
  { src: "/images/Gallery/Winglet-Install-03.jpg", alt: "Winglet installation in progress" },
  { src: "/images/Gallery/aog.jpg", alt: "AOG response — Aircraft on Ground service in Texas and Oklahoma" },
  { src: "/images/Gallery/Aircraft-MX.jpg", alt: "Business jet undergoing maintenance at Plane Place Aviation" },
  { src: "/images/Gallery/Winglet-Install-06.jpg", alt: "Winglet installation at Plane Place Aviation" },
  { src: "/images/Gallery/pp-inspection.jpg", alt: "Pre-purchase inspection at Plane Place Aviation" },
  { src: "/images/Gallery/Interior-Work.jpg", alt: "Aircraft interior maintenance work" },
  { src: "/images/Gallery/tech-working-on-wing.jpg", alt: "Technician working on aircraft wing" },
  { src: "/images/Gallery/hangar-work.jpg", alt: "Maintenance work in the Plane Place Aviation hangar" },
  { src: "/images/Gallery/tail-image.jpg", alt: "Business jet tail section at Plane Place Aviation hangar" },
  { src: "/images/Gallery/tail-work.jpg", alt: "Aircraft tail section maintenance" },
  { src: "/images/Gallery/PPA-Sign.jpg", alt: "Plane Place Aviation sign at the hangar entrance in Cleburne, Texas" },
  { src: "/images/Gallery/P1024923.jpg", alt: "Plane Place Aviation hangar operations" },
  { src: "/images/Gallery/P1035888.jpg", alt: "Plane Place Aviation maintenance operations" },
];

const imageGalleryJsonLd = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  name: "Plane Place Aviation Gallery",
  description:
    "Photo gallery from the Plane Place Aviation hangar — Hawker, Citation, and Challenger maintenance, winglet installations, avionics work, and team operations.",
  url: "https://ppa.aero/gallery",
  publisher: { "@id": "https://ppa.aero/#organization" },
  image: PHOTOS.map((p) => ({
    "@type": "ImageObject",
    contentUrl: `https://ppa.aero${p.src}`,
    description: p.alt,
  })),
};

export default function GalleryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGalleryJsonLd) }}
      />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[440px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Gallery/Hangar-Hawkers.jpg"
            alt="Hawker aircraft in the Plane Place Aviation hangar in Cleburne, Texas"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/50 to-ppa-black/10" />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <Breadcrumb crumbs={[{ label: "Gallery", href: "/gallery" }]} variant="dark" />

          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass-bright" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
              Gallery
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9] mb-6 max-w-3xl">
            Inside the Hangar.
          </h1>
          <p className="text-lg text-ppa-light/80 max-w-2xl font-light">
            Photos from the Plane Place Aviation hangar in Cleburne, Texas —
            Hawker, Citation, and Challenger maintenance, winglet
            installations, avionics work, and the team behind it.
          </p>
        </div>
      </section>

      {/* Gallery — CSS-columns mosaic, photos flow at natural aspect ratio */}
      <section className="bg-ppa-light py-16 lg:py-20 border-t border-ppa-border">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 lg:gap-3 [column-fill:_balance]">
            {PHOTOS.map((photo, i) => (
              <figure
                key={photo.src}
                className="mb-2 lg:mb-3 break-inside-avoid overflow-hidden bg-ppa-black/5 img-zoom"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading={i < 6 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-auto block"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
