import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PhoneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { COMPANY, SERVICES } from "@/lib/constants";

const SERVICE_IMAGES: Record<string, string> = {
  "scheduled-maintenance": "/images/Engine-MX.jpg",
  "pre-purchase-inspections": "/images/Wing-MX-2.jpg",
  "aog-response": "/images/Aircraft-MX.jpg",
  "structural-repairs": "/images/Winglet-Install-04.jpg",
  avionics: "/images/Winglet-Install-05.jpg",
  "maintenance-management": "/images/Wing-MX---Travis-Angel.jpg",
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  wrench: WrenchScrewdriverIcon,
  clipboard: ClipboardDocumentCheckIcon,
  bolt: BoltIcon,
  shield: ShieldCheckIcon,
  cpu: CpuChipIcon,
  chart: ChartBarIcon,
};

const SERVICE_DETAILS: Record<
  string,
  { description: string; features: string[] }
> = {
  "scheduled-maintenance": {
    description:
      "Phase inspections, annual inspections, and all scheduled maintenance events for Hawker, Citation, and Challenger aircraft. We plan the work, source the parts, and deliver your aircraft on time with audit-ready documentation.",
    features: [
      "Phase 1-4 inspections",
      "Annual and biennial inspections",
      "96-month and 192-month inspections",
      "8-year and 16-year inspections",
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
      "FAA-approved structural engineering and repair for all three airframe families. From corrosion treatment to major structural repairs, our team has the certifications and experience to return your aircraft to service.",
    features: [
      "Corrosion treatment and prevention",
      "Skin and panel repairs",
      "Frame and stringer repairs",
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
      "Consulting and management services from founders who spent years on the operator side. We help you plan maintenance events, manage budgets, and make informed decisions about your aircraft.",
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
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-44 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Wing-MX.jpg"
            alt="PPA technician inspecting aircraft underside in hangar"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-ppa-navy/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-ppa-navy/90 via-ppa-navy/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-4">
              Our Services
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Full-service maintenance.{" "}
              <span className="text-ppa-gray">Specialist execution.</span>
            </h1>
            <p className="text-lg text-ppa-gray-light leading-relaxed mb-8">
              Every service we offer is backed by deep type-specific experience
              across Hawker, Citation, and Challenger aircraft. No generalist
              guesswork — just precise, efficient maintenance from technicians
              who know your airframe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-ppa-accent hover:bg-ppa-accent-bright rounded-xl transition-all shadow-lg shadow-ppa-accent/25"
              >
                Request a Quote
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-ppa-gold border border-ppa-gold/30 hover:bg-ppa-gold/10 rounded-xl transition-all"
              >
                <PhoneIcon className="h-4 w-4" />
                AOG? Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Service sections */}
      {SERVICES.map((service, i) => {
        const Icon = SERVICE_ICONS[service.icon];
        const details = SERVICE_DETAILS[service.slug];
        const isEven = i % 2 === 0;

        return (
          <section
            key={service.slug}
            id={service.slug}
            className={`py-20 ${isEven ? "" : "bg-ppa-navy-light border-y border-white/5"}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className={isEven ? "" : "lg:order-2"}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-ppa-accent/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-ppa-accent" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      {service.name}
                    </h2>
                  </div>
                  <p className="text-ppa-gray-light leading-relaxed mb-8">
                    {details?.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {details?.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-ppa-success flex-shrink-0 mt-0.5" />
                        <span className="text-ppa-gray-light text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ppa-accent hover:text-ppa-accent-bright transition-colors"
                  >
                    Get a quote for {service.name.toLowerCase()}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>

                <div
                  className={`aspect-[4/3] rounded-2xl overflow-hidden relative ${isEven ? "" : "lg:order-1"}`}
                >
                  <Image
                    src={SERVICE_IMAGES[service.slug] || "/images/Aircraft-MX.jpg"}
                    alt={`PPA technician performing ${service.name.toLowerCase()} on business jet`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
