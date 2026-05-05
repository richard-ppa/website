import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AIRFRAMES, COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Aircraft We Service — Hawker, Citation & Challenger Maintenance",
  description:
    "Specialist FAA Part 145 maintenance, inspection, and repair for Hawker (800, 800XP, 900XP, 1000), Citation (550, 560, 560XL/XLS, 650, 680), and Challenger (300, 350, 604, 605, 650). Cleburne, Texas.",
  alternates: {
    canonical: "https://ppa.aero/aircraft",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero/aircraft",
    siteName: "Plane Place Aviation",
    title: "Aircraft We Service — Hawker, Citation & Challenger Maintenance",
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
    title: "Aircraft We Service — Hawker, Citation & Challenger Maintenance",
    description:
      "FAA Part 145 maintenance for Hawker, Citation, and Challenger aircraft. Cleburne, TX.",
    images: ["https://ppa.aero/images/tail-image.jpg"],
  },
};

const AIRFRAME_IMAGES: Record<string, { src: string; alt: string; position?: string }> = {
  hawker: {
    src: "/images/hawker-mx.jpg",
    alt: "Hawker aircraft undergoing maintenance at Plane Place Aviation",
    position: "center 30%",
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

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://ppa.aero" },
    { "@type": "ListItem", position: 2, name: "Aircraft", item: "https://ppa.aero/aircraft" },
  ],
};

export default function AircraftIndexPage() {
  const airframes = Object.values(AIRFRAMES);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[600px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/tail-image.jpg"
            alt="Business jet tail at Plane Place Aviation hangar in Cleburne, Texas"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/40 to-ppa-black/10" />
        </div>

        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 lg:pb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Aircraft We Service
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9] max-w-4xl">
            First-class maintenance on Hawker, Citation &amp; Challenger.
          </h1>
          <p className="mt-8 text-lg lg:text-xl text-ppa-light/85 font-light leading-relaxed max-w-3xl">
            Plane Place Aviation is an FAA Part 145 repair station that
            specializes exclusively in three business jet families. Our
            technicians don't context-switch between a King Air and a
            Gulfstream — every tool, every procedure, and every type-specific
            training hour is dedicated to the airframes our customers
            actually fly.
          </p>
        </div>
      </section>

      {/* Specialization intro — body prose for SEO depth */}
      <section className="bg-ppa-white py-20 lg:py-24 border-t border-ppa-border">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Specialist MRO
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-[0.95] mb-10 max-w-3xl">
            Three airframe families. Done better than anyone.
          </h2>
          <div className="space-y-6 max-w-3xl text-lg leading-[1.75] font-light text-ppa-dark">
            <p>
              We are a one-stop shop for any and all maintenance, inspection,
              repair, and avionics needs across Hawker, Citation, and
              Challenger aircraft. Our certified Part 145 repair station in
              Cleburne, Texas is staffed with technicians who have spent
              their careers on these specific airframes — including factory-trained
              Challenger 300/350 technicians on staff to support 96- and
              192-month inspection events.
            </p>
            <p>
              Hawker parts availability has become an industry-wide pain
              point. Plane Place Aviation has access to extensive Hawker
              parts inventory and a parts-out partner on the field, so your
              maintenance event keeps moving instead of waiting weeks on a
              back-ordered component. We support the full Hawker 800 series,
              the Citation 550 through 680 Sovereign (including the Citation
              650), and the Challenger 300, 350, 604, 605, and 650.
            </p>
            <p>
              Whether you operate a single aircraft or manage a charter
              fleet, our team delivers the audit-ready documentation that
              protects your aircraft's resale value, the turnaround
              reliability that keeps your operation flying, and the
              transparent pricing that prevents invoice surprises. AOG
              response is available 24/7 across Texas and Oklahoma — when
              your aircraft is down, we come to you.
            </p>
          </div>
        </div>
      </section>

      {/* Airframe families — three large cards with body content */}
      <section className="bg-ppa-light py-20 lg:py-28 border-t border-ppa-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between gap-8 mb-12 lg:mb-16 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Airframe Families
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-black leading-[0.95]">
                Pick your airframe.
              </h2>
            </div>
            <p className="text-sm max-w-sm text-ppa-muted">
              Each family has its own dedicated team, tooling, and parts
              network. Click through for the full capability set.
            </p>
          </div>

          <div className="grid gap-12">
            {airframes.map((airframe) => {
              const img = AIRFRAME_IMAGES[airframe.slug];
              return (
                <article key={airframe.slug} className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                  <Link
                    href={`/aircraft/${airframe.slug}`}
                    className="relative aspect-[4/3] lg:aspect-auto overflow-hidden img-zoom group"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      style={img.position ? { objectPosition: img.position } : undefined}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ppa-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
                        {airframe.manufacturer}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-col justify-center">
                    <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-black leading-[0.9] mb-4">
                      {airframe.name}
                    </h3>
                    <p className="font-display text-xl text-ppa-brass mb-6">
                      {airframe.models.join(" / ")}
                    </p>
                    <p className="text-ppa-dark text-lg leading-[1.75] font-light mb-6">
                      {airframe.description}
                    </p>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 mb-8 max-w-xl">
                      {airframe.services.slice(0, 6).map((service) => (
                        <li
                          key={service}
                          className="text-sm text-ppa-muted flex items-start gap-2"
                        >
                          <span className="text-ppa-brass mt-1">+</span>
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/aircraft/${airframe.slug}`}
                      className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass hover:text-ppa-brass-light transition-colors self-start"
                    >
                      Explore {airframe.name} Capabilities
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ppa-black py-20 lg:py-24">
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
