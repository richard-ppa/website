import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AIRFRAMES, COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Capabilities — Hawker, Citation & Challenger Maintenance",
  description:
    "Specialist FAA Part 145 maintenance, inspection, and repair for Hawker (800, 800XP, 900XP, 1000), Citation (550, 560, 560XL/XLS, 650, 680), and Challenger (300, 350, 604, 605, 650). Cleburne, Texas.",
  alternates: {
    canonical: "https://ppa.aero/capabilities",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero/capabilities",
    siteName: "Plane Place Aviation",
    title: "Capabilities — Hawker, Citation & Challenger Maintenance",
    description:
      "Specialist FAA Part 145 maintenance for Hawker, Citation, and Challenger aircraft. Founder-led, fast turnaround, transparent pricing. Cleburne, Texas.",
    images: [
      {
        url: "https://ppa.aero/images/tail-image.jpg",
        alt: "Business jet tail section at Plane Place Aviation hangar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Capabilities — Hawker, Citation & Challenger Maintenance",
    description:
      "FAA Part 145 maintenance for Hawker, Citation, and Challenger aircraft. Cleburne, TX.",
    images: ["https://ppa.aero/images/tail-image.jpg"],
  },
};

const AIRFRAME_HERO_IMAGES: Record<string, { src: string; alt: string; position?: string }> = {
  hawker: {
    src: "/images/Hawker-850-wide.jpg",
    alt: "Hawker on the ramp at Plane Place Aviation",
    position: "center 50%",
  },
  citation: {
    src: "/images/Citation-Hangar.jpg",
    alt: "Citation aircraft in the Plane Place Aviation hangar",
    position: "center 35%",
  },
  challenger: {
    src: "/images/Challenger-MX.jpg",
    alt: "Challenger aircraft undergoing maintenance at Plane Place Aviation",
    position: "center 35%",
  },
};

const AIRFRAME_LONG_DESCRIPTIONS: Record<string, string> = {
  hawker:
    "Plane Place Aviation has extensive experience with all Hawker airframes — from the classic 800 through the 900XP and 1000. Our shop is set up around this airframe family, with type-specific tooling, dedicated procedures, and access to extensive Hawker parts inventory through a parts-out partner on the field. When parts availability has become an industry-wide pain point, that access keeps your maintenance event moving instead of stalling on a back-ordered component. We perform 8-year major inspections, B/C/D/E/F/G phase inspections, 4-year inspections, landing gear overhauls, structural repairs, and avionics upgrades.",
  citation:
    "Full-service Citation maintenance from the 550 series through the 680 Sovereign — including the Citation 560XL/XLS and Citation 650. Phase 1 through Phase 5 inspections, annual inspections, structural repairs, landing gear service, and avionics troubleshooting are all handled in-house at our Cleburne, Texas facility. Our Citation team has the type-specific tooling, parts access, and OEM documentation to turn your aircraft on schedule, with the audit-ready documentation that protects your aircraft's resale value.",
  challenger:
    "Specialist Challenger maintenance with factory-trained Challenger 300/350 technicians on staff to support 96- and 192-month inspection events. Plane Place Aviation has completed several major Challenger 300/350 inspections and landing gear removals — we have the tooling, knowledge, and attention to detail this maintenance requires, including known structural findings in the main entry area that often surface during the 192-month event. We also support Challenger 604, 605, and 650 maintenance, with 24/7 AOG response across Texas and Oklahoma.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://ppa.aero" },
    { "@type": "ListItem", position: 2, name: "Capabilities", item: "https://ppa.aero/capabilities" },
  ],
};

export default function CapabilitiesPage() {
  const airframes = Object.values(AIRFRAMES);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero — Full bleed image */}
      <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/tail-image.jpg"
            alt="Business jet tail at Plane Place Aviation hangar in Cleburne, Texas"
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
              Capabilities
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9] mb-6">
            First-Class Maintenance.
            <br />
            <span className="text-ppa-muted">Three Airframe Families.</span>
          </h1>
          <p className="text-lg text-ppa-light/70 max-w-2xl font-light mb-8">
            Plane Place Aviation is an FAA Part 145 repair station that
            specializes exclusively in Hawker, Citation, and Challenger
            aircraft. Every tool, every procedure, every type-specific
            training hour is dedicated to the airframes our customers fly.
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

      {/* Airframe sections — cinematic full-bleed, alternating text side */}
      {airframes.map((airframe, i) => {
        const number = `0${i + 1}`;
        const heroImg = AIRFRAME_HERO_IMAGES[airframe.slug];
        const longDesc = AIRFRAME_LONG_DESCRIPTIONS[airframe.slug];
        const textRight = i % 2 === 1;

        return (
          <section
            key={airframe.slug}
            id={airframe.slug}
            className="relative h-[85vh] min-h-[640px] overflow-hidden border-t border-ppa-white/20"
          >
            <Image
              src={heroImg.src}
              alt={heroImg.alt}
              fill
              className="object-cover"
              style={heroImg.position ? { objectPosition: heroImg.position } : undefined}
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
                <div className={`max-w-2xl ${textRight ? "ml-auto" : ""}`}>
                  <div className="relative inline-block mb-3">
                    <div
                      aria-hidden
                      className="absolute inset-0 blur-xl opacity-60 pointer-events-none"
                      style={{
                        background:
                          "conic-gradient(from 210deg at 50% 50%, #00eaff 0deg, #00aeef 90deg, #3b82f6 180deg, #1e3a8a 270deg, #00eaff 360deg)",
                      }}
                    />
                    <span className="relative font-display text-7xl lg:text-[9rem] text-[#00aeef]/40 leading-none block">
                      {number}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-px w-8 bg-ppa-brass-bright" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
                      {airframe.manufacturer}
                    </span>
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-[0.95] mb-3">
                    {airframe.name}
                  </h2>
                  <p className="font-display text-lg lg:text-xl text-ppa-brass-bright mb-6">
                    {airframe.models.join(" / ")}
                  </p>
                  <p className="text-lg text-ppa-light/85 font-light leading-relaxed mb-8 max-w-xl">
                    {longDesc}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-10 max-w-xl">
                    {airframe.services.slice(0, 5).map((service) => (
                      <span
                        key={service}
                        className="text-xs text-ppa-white border border-ppa-white/30 px-3 py-1.5 backdrop-blur-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/capabilities/${airframe.slug}`}
                    className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass-bright hover:text-ppa-white transition-colors"
                  >
                    Explore {airframe.name} Capabilities
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

      {/* CTA */}
      <section className="bg-ppa-black py-20 lg:py-24 border-t border-ppa-white/20">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-[0.95] mb-6">
            Ready to schedule your aircraft?
          </h2>
          <p className="text-ppa-light/80 text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Request a quote, schedule a phase inspection, or call us
            directly for AOG support across Texas and Oklahoma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-all"
            >
              Request a Quote
            </Link>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white border border-ppa-white/40 hover:bg-ppa-white/10 transition-all"
            >
              Call {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
