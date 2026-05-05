import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AIRFRAMES } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Aircraft Maintenance Capabilities — Hawker, Citation & Challenger",
  description:
    "FAA Part 145 specialist maintenance for Hawker, Citation & Challenger aircraft — phase inspections, AOG response, structural repairs. Cleburne, Texas.",
  alternates: {
    canonical: "https://ppa.aero/capabilities",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero/capabilities",
    siteName: "Plane Place Aviation",
    title: "Aircraft Maintenance Capabilities — Hawker, Citation & Challenger",
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
    title: "Aircraft Maintenance Capabilities — Hawker, Citation & Challenger",
    description:
      "FAA Part 145 maintenance for Hawker, Citation, and Challenger aircraft. Cleburne, TX.",
    images: ["https://ppa.aero/images/tail-image.jpg"],
  },
};

const AIRFRAME_CARD_IMAGES: Record<string, { src: string; alt: string; position?: string }> = {
  hawker: {
    src: "/images/Hangar-Hawkers.jpg",
    alt: "Hawker aircraft in the Plane Place Aviation hangar",
    position: "center 50%",
  },
  citation: {
    src: "/images/Citation-Hangar-2.jpg",
    alt: "Citation aircraft in the Plane Place Aviation hangar",
    position: "center 35%",
  },
  challenger: {
    src: "/images/Challenger-MX.jpg",
    alt: "Challenger aircraft undergoing maintenance at Plane Place Aviation",
    position: "center 35%",
  },
};

const AIRFRAME_CARD_DESCRIPTIONS: Record<string, string> = {
  hawker:
    "Extensive experience across the entire Hawker 800 series — from the classic 800 through the 900XP and 1000. Type-specific tooling, dedicated procedures, and access to extensive Hawker parts inventory through a parts-out partner on the field. 8-year major inspections, B/C/D/E/F/G phase inspections, landing gear overhauls, and avionics upgrades.",
  citation:
    "Full-service Citation maintenance from the 550 series through the 680 Sovereign — including the Citation 560XL/XLS and Citation 650. Phase 1–5 inspections, annual inspections, structural repairs, landing gear service, avionics troubleshooting, all in-house at our Cleburne, Texas hangar.",
  challenger:
    "Specialist Challenger maintenance with factory-trained Challenger 300/350 technicians on staff for 96- and 192-month inspection events. Plane Place Aviation has completed several major Challenger 300/350 inspections and landing gear removals — and supports Challenger 604, 605, and 650 with 24/7 AOG response across Texas and Oklahoma.",
};

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What aircraft does Plane Place Aviation service?",
    a: "We specialize exclusively in three business jet families: Hawker (800, 800XP, 900XP, 1000), Citation (550, 560, 560XL/XLS, 650, 680), and Challenger (300, 350, 604, 605, 650). Our shop, tooling, and technician training are dedicated to these specific airframes — we don't context-switch between unrelated aircraft families.",
  },
  {
    q: "What is an FAA Part 145 repair station?",
    a: "An FAA Part 145 repair station is an independent maintenance, repair, and overhaul (MRO) facility certified by the Federal Aviation Administration to perform airframe maintenance, inspection, repair, and alteration. Plane Place Aviation holds Part 145 certification, which means our quality control, training, tooling, and recordkeeping meet the same regulatory standard as OEM-authorized service centers.",
  },
  {
    q: "Where is Plane Place Aviation located?",
    a: "We're based at Cleburne Regional Airport (KCPT) in Cleburne, Texas — about 30 minutes south of DFW. Our facility spans 40,000 sq ft of hangar space across three hangars with a comfortable lounge and office area for visiting crews, plus quick ramp access and minimal taxi delays compared to busier metro airports.",
  },
  {
    q: "Do you offer AOG (Aircraft on Ground) response?",
    a: "Yes — we provide 24/7 AOG response across Texas and Oklahoma. Our mobile maintenance team can come to you, whether your aircraft is grounded at a regional airport or at a major hub. For AOG support, call us directly.",
  },
  {
    q: "What inspections do you perform?",
    a: "We perform the full range of scheduled and unscheduled inspections for Hawker (4-year, 8-year, B/C/D/E/F/G phase), Citation (Phase 1 through Phase 5, annual), and Challenger (96-month, 192-month, phase inspections). We also perform landing gear overhauls, structural repairs, avionics troubleshooting and upgrades, and pre-purchase inspections (PPI).",
  },
  {
    q: "Do you handle pre-purchase inspections?",
    a: "Yes. Pre-purchase inspections are one of our core services. We deliver thorough, audit-ready documentation that protects buyers and gives sellers confidence in the aircraft's condition. PPIs are particularly important for protecting resale value on Hawker, Citation, and Challenger aircraft.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Aircraft Maintenance, Inspection, and Repair",
  provider: { "@id": "https://ppa.aero/#organization" },
  areaServed: [
    { "@type": "State", name: "Texas" },
    { "@type": "State", name: "Oklahoma" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Aircraft Families Serviced",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Hawker Maintenance",
        url: "https://ppa.aero/capabilities/hawker",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hawker 800 / 800XP / 900XP / 1000 maintenance, 8-year inspections, and avionics" } },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Citation Maintenance",
        url: "https://ppa.aero/capabilities/citation",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Citation 550 / 560 / 560XL/XLS / 650 / 680 phase inspections and structural repair" } },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Challenger Maintenance",
        url: "https://ppa.aero/capabilities/challenger",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Challenger 300 / 350 / 604 / 605 / 650 maintenance, 96/192-month inspections, AOG response" } },
        ],
      },
    ],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function CapabilitiesPage() {
  const airframes = Object.values(AIRFRAMES);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[600px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/about-us.jpg"
            alt="Plane Place Aviation team and facility in Cleburne, Texas"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/60 to-ppa-black/30" />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 lg:pb-20">
          <Breadcrumb crumbs={[{ label: "Capabilities", href: "/capabilities" }]} variant="dark" />

          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Capabilities
            </span>
          </div>
          <h1 className="font-display text-ppa-white leading-[0.95] mb-6">
            <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
              Aircraft Maintenance Capabilities
            </span>
            <span className="block mt-3 text-xl sm:text-2xl lg:text-3xl text-ppa-brass-bright/90 font-light tracking-tight">
              Hawker · Citation · Challenger
            </span>
          </h1>
          <p className="text-lg text-ppa-light/80 max-w-2xl font-light">
            Plane Place Aviation is an{" "}
            <Link
              href="/about"
              className="underline decoration-ppa-brass-bright/40 underline-offset-4 hover:decoration-ppa-brass-bright transition-colors"
            >
              FAA Part 145 repair station
            </Link>{" "}
            that specializes exclusively in Hawker, Citation, and Challenger
            aircraft. Choose your airframe to explore our full capabilities.
          </p>
        </div>
      </section>

      {/* Combined: SEO body intro + airframe family cards */}
      <section className="bg-ppa-light py-20 lg:py-28 border-t border-ppa-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <header className="mb-14 lg:mb-20 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ppa-brass" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                Specialist MRO
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-black leading-[0.95] mb-8">
              Maintenance Built Around Your Fleet.
            </h2>
            <div className="space-y-5 text-lg leading-[1.75] font-light text-ppa-dark">
              <p>
                Plane Place Aviation is a certified Part 145 repair station in
                Cleburne, Texas that specializes exclusively in Hawker,
                Citation, and Challenger aircraft. We're a one-stop shop for
                maintenance, inspection, repair, and{" "}
                <Link
                  href="/services"
                  className="text-ppa-brass-dark underline decoration-ppa-brass/40 underline-offset-4 hover:decoration-ppa-brass-dark transition-colors"
                >
                  avionics
                </Link>{" "}
                — staffed with technicians who have spent their careers on
                these specific airframes, including factory-trained
                Challenger 300/350 technicians for 96- and 192-month
                inspection events.
              </p>
              <p>
                We support the full Hawker 800 series, the Citation 550
                through 680 Sovereign (including the Citation 650), and the
                Challenger 300, 350, 604, 605, and 650 — with extensive
                Hawker parts inventory, audit-ready documentation that
                protects resale value, and 24/7{" "}
                <Link
                  href="/services"
                  className="text-ppa-brass-dark underline decoration-ppa-brass/40 underline-offset-4 hover:decoration-ppa-brass-dark transition-colors"
                >
                  AOG response
                </Link>{" "}
                across Texas and Oklahoma. Ready to schedule?{" "}
                <Link
                  href="/quote"
                  className="text-ppa-brass-dark underline decoration-ppa-brass/40 underline-offset-4 hover:decoration-ppa-brass-dark transition-colors"
                >
                  Request a quote
                </Link>
                .
              </p>
            </div>
          </header>

          <div className="space-y-6 lg:space-y-8">
            {airframes.map((airframe, i) => {
              const number = `0${i + 1}`;
              const img = AIRFRAME_CARD_IMAGES[airframe.slug];
              const desc = AIRFRAME_CARD_DESCRIPTIONS[airframe.slug];
              return (
                <Link
                  key={airframe.slug}
                  href={`/capabilities/${airframe.slug}`}
                  className="group block bg-ppa-white border border-ppa-border hover:border-ppa-brass/50 transition-all duration-300 overflow-hidden"
                >
                  <article className="grid lg:grid-cols-[1.1fr_1fr] gap-0 items-stretch">
                    <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[420px] overflow-hidden">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        style={img.position ? { objectPosition: img.position } : undefined}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                      <div className="absolute top-6 left-6">
                        <span className="font-display text-5xl text-ppa-white drop-shadow-lg">
                          {number}
                        </span>
                      </div>
                      <div className="absolute bottom-6 left-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-white drop-shadow-lg">
                          {airframe.manufacturer}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-8 lg:p-12">
                      <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-black leading-[0.9] mb-3 group-hover:text-ppa-brass-dark transition-colors">
                        {airframe.name} Maintenance
                      </h3>
                      <p className="font-display text-lg text-ppa-brass mb-6">
                        {airframe.models.join(" / ")}
                      </p>
                      <p className="text-ppa-dark text-base leading-[1.7] font-light mb-6">
                        {desc}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-8">
                        {airframe.services.slice(0, 4).map((service) => (
                          <span
                            key={service}
                            className="text-[11px] text-ppa-muted border border-ppa-border px-2.5 py-1"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass group-hover:text-ppa-brass-dark transition-colors self-start">
                        Explore {airframe.name} Capabilities
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ppa-white py-20 lg:py-28 border-t border-ppa-border">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Frequently Asked
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-[0.95] mb-12 max-w-3xl">
            Common questions from operators.
          </h2>
          <div className="divide-y divide-ppa-border border-y border-ppa-border">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group py-6 lg:py-7"
              >
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
                  <h3 className="font-display text-xl sm:text-2xl text-ppa-black leading-snug group-hover:text-ppa-brass-dark transition-colors">
                    {item.q}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-ppa-brass font-display text-2xl leading-none transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-ppa-dark text-base lg:text-lg leading-[1.75] font-light max-w-3xl">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-12 text-sm text-ppa-muted max-w-2xl">
            Have a question that isn't answered here?{" "}
            <Link
              href="/contact"
              className="text-ppa-brass-dark underline decoration-ppa-brass/40 underline-offset-4 hover:decoration-ppa-brass-dark transition-colors"
            >
              Contact our team
            </Link>{" "}
            or{" "}
            <Link
              href="/quote"
              className="text-ppa-brass-dark underline decoration-ppa-brass/40 underline-offset-4 hover:decoration-ppa-brass-dark transition-colors"
            >
              request a quote
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
