import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY, SERVICES } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";

const SERVICE_IMAGES: Record<string, { src: string; mobilePosition?: string; desktopPosition?: string }> = {
  "scheduled-maintenance": { src: "/images/Engine-MX.jpg", mobilePosition: "center" },
  "pre-purchase-inspections": { src: "/images/pp-inspection.jpg", mobilePosition: "center" },
  "aog-response": { src: "/images/aog.jpg", mobilePosition: "center" },
  "structural-repairs": { src: "/images/structural-repairs.jpg", mobilePosition: "center" },
  avionics: { src: "/images/avionics.jpg", mobilePosition: "center" },
  "maintenance-management": { src: "/images/pre-purchase.png", mobilePosition: "center 30%" },
};

const SERVICE_DETAILS: Record<
  string,
  { description: string; features: string[] }
> = {
  "scheduled-maintenance": {
    description:
      "Scheduled maintenance events for Hawker, Citation, and Challenger aircraft. We specialize in heavy maintenance inspections — planning the work, sourcing the parts, and delivering your aircraft on time with audit-ready documentation.",
    features: [
      "Phase 1-5 inspections",
      "12, 24, 36, 48, 96, and 192-month inspections",
      "B, C, D, E, F, G, 4-year, and 8-year inspections",
      "Compliance with all applicable ADs and SBs",
      "Detailed work scope and timeline upfront",
    ],
  },
  "pre-purchase-inspections": {
    description:
      "Buying a Hawker, Citation, or Challenger? Our thorough, unbiased pre-purchase inspections give you full confidence before closing. We evaluate the aircraft, the records, and give you a clear picture of what you're buying.",
    features: [
      "Complete airframe and powerplant inspection",
      "Logbook and maintenance records review",
      "AD and SB compliance verification",
      "Corrosion assessment",
      "Avionics system evaluation",
      "Detailed report with photos and findings",
      "Estimated cost to correct discrepancies",
    ],
  },
  "aog-response": {
    description:
      "When your aircraft is on the ground, every hour costs money. Our mobile maintenance team covers Texas and Oklahoma with the parts, tooling, and expertise to get you flying again.",
    features: [
      "Mobile team covering TX and OK",
      "Hawker, Citation, and Challenger specialists on call",
      "Rapid parts sourcing from our inventory",
      "Troubleshooting and repair on-site",
      "Coordination with your operations team",
      "24-hour AOG phone line",
    ],
  },
  "structural-repairs": {
    description:
      "FAA-approved structural engineering, repair, and modifications for all three airframe families. From corrosion treatment to major structural repairs and approved modifications, our team has the certifications and experience to return your aircraft to service.",
    features: [
      "Corrosion treatment and prevention",
      "Skin and panel repairs",
      "Frame and stringer repairs",
      "Approved structural modifications",
      "FAA-approved repair data and DER support",
      "Non-destructive testing (NDT)",
      "Documentation for resale value protection",
    ],
  },
  avionics: {
    description:
      "Avionics troubleshooting, repair, and upgrades for Hawker, Citation, and Challenger aircraft. From squawk resolution to ADS-B compliance, we handle the full avionics stack.",
    features: [
      "Avionics troubleshooting and repair",
      "ADS-B Out compliance",
      "RVSM testing and certification",
      "Autopilot and flight director service",
      "Radar and weather system repairs",
      "Cockpit display upgrades",
    ],
  },
  "maintenance-management": {
    description:
      "We provide one-on-one aircraft maintenance management, regulatory compliance with FAA and DOT requirements, aircraft storage at our Cleburne facility, and weekly, bi-weekly, or monthly service checks tailored to how you operate.",
    features: [
      "Maintenance tracking and scheduling",
      "Regulatory compliance (FAA, DOT)",
      "Budget forecasting and cost analysis",
      "Vendor management and oversight",
      "Records management and audit preparation",
      "Aircraft storage at Cleburne",
      "Weekly, bi-weekly, or monthly service checks",
      "Pre-purchase advisory services",
      "Fleet maintenance planning",
    ],
  },
};

export const metadata: Metadata = {
  title: "Aircraft Maintenance Services — Hawker, Citation & Challenger",
  description:
    "Full-service aircraft maintenance for Hawker, Citation, and Challenger. Phase inspections, pre-purchase inspections, AOG response, structural repairs, avionics, and maintenance management.",
  alternates: {
    canonical: "https://ppa.aero/services",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero/services",
    siteName: "Plane Place Aviation",
    title: "Aircraft Maintenance Services — Hawker, Citation & Challenger",
    description:
      "Full-service aircraft maintenance for Hawker, Citation, and Challenger. Phase inspections, pre-purchase inspections, AOG response, structural repairs, avionics, and maintenance management.",
    images: [
      {
        url: "https://ppa.aero/images/Wing-MX.jpg",
        alt: "Plane Place Aviation technician inspecting business jet underside during maintenance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aircraft Maintenance Services — Hawker, Citation & Challenger",
    description:
      "Full-service aircraft maintenance for Hawker, Citation, and Challenger. Phase inspections, pre-purchase inspections, AOG response, structural repairs, avionics, and maintenance management.",
    images: ["https://ppa.aero/images/Wing-MX.jpg"],
  },
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero — Full bleed image */}
      <section className="relative h-[100dvh] min-h-[600px] lg:min-h-[700px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Wing-MX.jpg"
            alt="Plane Place Aviation technician inspecting aircraft underside in hangar"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/60 to-ppa-black/30" />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <Breadcrumb crumbs={[{ label: "Services", href: "/services" }]} variant="dark" />

          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Our Services
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9] mb-6">
            Full-Service Maintenance.
            <br />
            <span className="text-ppa-muted">Specialist Execution.</span>
          </h1>
          <p className="text-lg text-ppa-light/70 max-w-xl font-light mb-8">
            Every service we offer is backed by deep type-specific experience
            across Hawker, Citation, and Challenger aircraft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-black bg-ppa-brass hover:bg-ppa-brass-light transition-all"
            >
              Request a Quote
            </Link>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-brass border border-ppa-brass/40 hover:bg-ppa-brass/10 transition-all"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ppa-gold animate-pulse" />
              AOG? Call Now
            </a>
          </div>
        </div>
      </section>

      {/* Service sections — editorial photo+text, alternating side for rhythm */}
      {SERVICES.map((service, i) => {
        const details = SERVICE_DETAILS[service.slug];
        const imageConfig = SERVICE_IMAGES[service.slug] || { src: "/images/Aircraft-MX.jpg" };
        const image = imageConfig.src;
        const altText = `Plane Place Aviation technician performing ${service.name.toLowerCase()} on business jet`;
        const imageRight = i % 2 === 0; // 01 → image right, 02 → image left, alternating

        const textBlock = (
          <div
            className={
              imageRight
                ? "px-6 py-16 lg:py-20 lg:pl-10 lg:pr-16"
                : "px-6 py-16 lg:py-20 lg:pl-16 lg:pr-10"
            }
          >
            <div
              className={
                imageRight
                  ? "lg:ml-auto lg:max-w-[580px]"
                  : "lg:max-w-[580px]"
              }
            >
              <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-8">
                {service.name}
              </h2>
              <p className="text-ppa-gray font-light leading-relaxed mb-8">
                {details?.description}
              </p>
              <ul className="flex flex-wrap gap-2.5 mb-10">
                {details?.features.map((feature) => (
                  <li
                    key={feature}
                    className="group inline-flex items-center gap-2 rounded-full border border-ppa-border bg-ppa-white pl-2.5 pr-4 py-2 text-xs font-medium text-ppa-dark shadow-[0_3px_8px_rgba(20,30,55,0.12),0_1px_2px_rgba(20,30,55,0.08)] transition-all hover:-translate-y-0.5 hover:border-ppa-brass/60 hover:bg-ppa-light hover:shadow-[0_8px_18px_rgba(20,30,55,0.16),0_2px_4px_rgba(20,30,55,0.10)]"
                  >
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ppa-brass/10 text-ppa-brass transition-colors group-hover:bg-ppa-brass group-hover:text-ppa-white">
                      <svg
                        aria-hidden="true"
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/quote"
                className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass hover:text-ppa-brass-dark transition-colors"
              >
                Get a Quote
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        );

        const imageBlock = (
          <div className="relative h-full min-h-[420px] lg:min-h-[640px]">
            <Image
              src={image}
              alt={altText}
              fill
              className="object-cover"
              style={{ objectPosition: imageConfig.desktopPosition || imageConfig.mobilePosition || "center" }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Bottom scrim for caption legibility */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
            />
            {/* Editorial caption */}
            <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 flex items-center gap-3">
              <span className="h-px w-6 bg-ppa-brass-bright" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/95">
                {service.name} · Cleburne, TX
              </span>
            </div>
          </div>
        );

        return (
          <section
            key={service.slug}
            id={service.slug}
            className="overflow-hidden"
          >
            {/*
              Mobile (single col): image always on top, text below.
              Desktop: alternate via order utilities so visual rhythm flips
              row-to-row without changing mobile order.
              No section padding/gap → rows sit flush edge-to-edge.
            */}
            <div className="grid lg:grid-cols-2">
              <div className={`relative ${imageRight ? "lg:order-2" : ""}`}>{imageBlock}</div>
              <div className={`lg:self-center ${imageRight ? "lg:order-1" : ""}`}>{textBlock}</div>
            </div>
          </section>
        );
      })}
    </>
  );
}
