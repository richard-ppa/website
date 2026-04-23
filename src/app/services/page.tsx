import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY, SERVICES } from "@/lib/constants";

const SERVICE_IMAGES: Record<string, string> = {
  "scheduled-maintenance": "/images/Engine-MX.jpg",
  "pre-purchase-inspections": "/images/Wing-Work-4.jpg",
  "aog-response": "/images/Aircraft-MX.jpg",
  "structural-repairs": "/images/Winglet-Install-04.jpg",
  avionics: "/images/Winglet-Install-05.jpg",
  "maintenance-management": "/images/Wing-MX---Travis-Angel.jpg",
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
      "Consulting and management from people who specialize in your aircraft's maintenance. We help you plan maintenance events, manage budgets, and make informed decisions about your aircraft.",
    features: [
      "Maintenance tracking and scheduling",
      "Budget forecasting and cost analysis",
      "Vendor management",
      "Records management and audit preparation",
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
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero — Full bleed image */}
      <section className="relative h-[75vh] min-h-[550px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Wing-MX.jpg"
            alt="PPA technician inspecting aircraft underside in hangar"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/60 to-ppa-black/30" />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
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

      {/* Service sections — cinematic full-bleed, alternating text side for rhythm */}
      {SERVICES.map((service, i) => {
        const details = SERVICE_DETAILS[service.slug];
        const number = `0${i + 1}`;
        const image =
          SERVICE_IMAGES[service.slug] || "/images/Aircraft-MX.jpg";
        const altText = `PPA technician performing ${service.name.toLowerCase()} on business jet`;
        const textRight = i % 2 === 1; // flip text panel side every other section

        return (
          <section
            key={service.slug}
            id={service.slug}
            className="relative h-[85vh] min-h-[620px] overflow-hidden"
          >
            <Image
              src={image}
              alt={altText}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div
              className={`absolute inset-0 ${
                textRight
                  ? "bg-gradient-to-l from-ppa-black via-ppa-black/70 to-ppa-black/10"
                  : "bg-gradient-to-r from-ppa-black via-ppa-black/70 to-ppa-black/10"
              }`}
            />
            <div className="absolute inset-0 flex items-end">
              <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 lg:pb-24">
                <div
                  className={`max-w-2xl ${textRight ? "ml-auto" : ""}`}
                >
                  <span className="font-display text-7xl lg:text-[9rem] text-ppa-brass-bright/40 leading-none block mb-3">
                    {number}
                  </span>
                  <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-[0.95] mb-6">
                    {service.name}
                  </h2>
                  <p className="text-lg text-ppa-light/85 font-light leading-relaxed mb-8 max-w-xl">
                    {details?.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-10 max-w-xl">
                    {details?.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs text-ppa-white border border-ppa-white/30 px-3 py-1.5 backdrop-blur-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass-bright hover:text-ppa-white transition-colors"
                  >
                    Get a Quote
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
