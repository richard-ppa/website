import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AnimatedSection } from "@/components/AnimatedSection";
import HomeHero from "@/components/HomeHero";
import { COMPANY, AIRFRAMES, SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hawker, Citation & Challenger Maintenance — FAA Part 145 in Cleburne, TX",
  description:
    "Specialist MRO for Hawker, Citation, and Challenger aircraft. Founder-led, fast turnaround, transparent pricing. AOG response across Texas and Oklahoma. FAA Part 145 repair station in Cleburne, TX.",
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
      "The specialist MRO for Hawker, Citation & Challenger — founder-led, fast turnaround, transparent pricing. Cleburne, TX.",
    images: [
      {
        url: "https://ppa.aero/images/tail-image.jpg",
        alt: "Business jet tail section at Plane Place Aviation hangar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plane Place Aviation | Hawker, Citation & Challenger MRO",
    description:
      "Specialist MRO for Hawker, Citation & Challenger. FAA Part 145, Cleburne, TX.",
    images: ["https://ppa.aero/images/tail-image.jpg"],
  },
};

const AIRFRAME_IMAGES: Record<string, { src: string; alt: string }> = {
  hawker: {
    src: "/images/hawker.jpg",
    alt: "Hawker aircraft at Plane Place Aviation",
  },
  citation: {
    src: "/images/Citation-Hangar.jpg",
    alt: "Citation aircraft in the Plane Place Aviation hangar",
  },
  challenger: {
    src: "/images/challenger.jpg",
    alt: "Challenger aircraft at Plane Place Aviation",
  },
};

const PHOTO_GRID = [
  { src: "/images/Winglet-Install-05.jpg", alt: "Winglet installation with hangar view" },
  { src: "/images/Winglet-MX---James02.jpg", alt: "Precision riveting work" },
  { src: "/images/Wing-MX.jpg", alt: "Aircraft underside inspection" },
  { src: "/images/Winglet-Install-02.jpg", alt: "Winglet components on workbench" },
  { src: "/images/Tail-Work-2.jpg", alt: "Tail section maintenance" },
  { src: "/images/Engine-MX.jpg", alt: "Engine maintenance" },
  { src: "/images/Interior-Work.jpg", alt: "Interior cabin work" },
  { src: "/images/Wing-Work-4.jpg", alt: "Wing structural repair" },
];

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ppa-brass" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                Specialist Focus
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-black leading-none mb-4">
              Three Airframe Families.
              <br />
              <span className="text-ppa-muted">Zero Compromises.</span>
            </h2>
            <p className="text-ppa-gray max-w-xl mb-16 font-light">
              Every tool, part, and procedure in our facility is optimized for
              Hawker, Citation, and Challenger.
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-3">
            {Object.values(AIRFRAMES).map((airframe, i) => {
              const img = AIRFRAME_IMAGES[airframe.slug];
              return (
                <AnimatedSection key={airframe.slug} delay={i * 0.12}>
                  <Link
                    href={`/capabilities/${airframe.slug}`}
                    className="group block relative overflow-hidden aspect-[1500/1627]"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-ppa-black/10 group-hover:bg-transparent transition-colors duration-500" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass-bright mb-2">
                        {airframe.manufacturer}
                      </p>
                      <h3 className="font-display text-4xl lg:text-5xl text-ppa-white leading-none mb-3">
                        {airframe.name}
                      </h3>
                      <p className="text-sm text-ppa-light/70 mb-4">
                        {airframe.models.join(" / ")}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-brass-bright group-hover:text-ppa-white transition-colors">
                        View Capabilities
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Winglet-Install-03.jpg"
            alt="Plane Place Aviation technician silhouette working on wing at sunset"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ppa-black/85" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ppa-brass-bright" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
                What We Do
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-none mb-16">
              Full-Service Maintenance.
              <br />
              <span className="text-ppa-light/60">Specialist Execution.</span>
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ppa-border/50">
            {SERVICES.map((service, i) => (
              <AnimatedSection key={service.slug} delay={i * 0.08}>
                <div className="bg-ppa-black/60 backdrop-blur-sm p-8 lg:p-10 h-full group hover:bg-ppa-black/80 transition-colors duration-300">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass-bright">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-2xl text-ppa-white mt-3 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-sm text-ppa-light/85 leading-relaxed">
                    {service.short}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3}>
            <div className="mt-12">
              <Link
                href="/services"
                className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass-bright hover:text-ppa-white transition-colors"
              >
                View All Services
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimatedSection direction="left">
              <div className="relative">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <Image
                    src="/images/Winglet-Install---01.jpg"
                    alt="Plane Place Aviation technicians collaborating on winglet structural work"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -right-8 w-2/5 aspect-square overflow-hidden border-4 border-ppa-black hidden lg:block">
                  <Image
                    src="/images/Tech-at-Station.jpg"
                    alt="Plane Place Aviation technician at precision workstation"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-ppa-brass" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                    Why Plane Place Aviation
                  </span>
                </div>
                <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-6">
                  Built and Operated
                  <br />
                  <span className="text-ppa-muted">by the Founders.</span>
                </h2>
                <p className="text-ppa-gray leading-relaxed mb-10 font-light">
                  Tristan Noe and Travis Roberson started Plane Place Aviation
                  in 2022 — and still run it today. Not from an executive office,
                  but from the shop floor: setting the schedule, signing off on
                  work orders, and putting hands on the airplanes alongside the
                  technicians. When you call Plane Place Aviation, the people responsible for the
                  quality of your maintenance answer the phone.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      title: "Narrow Specialization",
                      description: "Three airframe families. Every tool, part, and procedure optimized.",
                    },
                    {
                      title: "Transparent Pricing",
                      description: "Detailed quotes upfront. Proactive communication on any changes.",
                    },
                    {
                      title: "Documentation Quality",
                      description: "Audit-ready records on every work order. Protecting your aircraft's value.",
                    },
                    {
                      title: "AOG Response",
                      description: "Mobile team covering Texas and Oklahoma. When you're down, we come to you.",
                    },
                    {
                      title: "Founder Accountability",
                      description: "Tristan and Travis are on the floor, not in a corporate office.",
                    },
                  ].map((item, i) => (
                    <div key={item.title} className="flex gap-4">
                      <span className="text-ppa-brass font-display text-lg mt-0.5">
                        0{i + 1}
                      </span>
                      <div>
                        <h3 className="text-ppa-black font-semibold mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-ppa-muted leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="relative">
        <AnimatedSection direction="scale">
          <div className="aspect-[21/9] lg:aspect-[3/1] relative overflow-hidden bg-ppa-black">
            <div className="absolute inset-0 flex marquee-track gap-2">
              {[...PHOTO_GRID, ...PHOTO_GRID].map((photo, i) => (
                <div
                  key={`${photo.src}-${i}`}
                  className="relative h-full aspect-[4/3] flex-shrink-0"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 60vw, 40vw"
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ppa-black/70 via-ppa-black/25 to-ppa-black/40" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
              <p className="font-display text-3xl lg:text-5xl text-ppa-white">
                40+ Technicians. One Team.
              </p>
              <p className="text-ppa-light/80 mt-2">Cleburne, Texas — KCPT</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <section className="overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="py-24 lg:py-32 px-6 lg:pl-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] lg:pr-0">
            <AnimatedSection>
              <div className="lg:max-w-[620px]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-ppa-brass" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                    Location
                  </span>
                </div>
                <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-6">
                  Cleburne, Texas
                  <br />
                  <span className="text-ppa-muted">KCPT</span>
                </h2>
                <p className="text-ppa-gray font-light leading-relaxed mb-8">
                  30 minutes south of DFW, with lower operating costs that
                  translate to better value for our customers. Fly directly into
                  Cleburne Regional Airport — we operate out of three hangars on the field.
                </p>
                <div className="space-y-2 text-sm text-ppa-gray mb-8">
                  <p>{COMPANY.address.street}</p>
                  <p>
                    {COMPANY.address.city}, {COMPANY.address.state}{" "}
                    {COMPANY.address.zip}
                  </p>
                  <p className="text-ppa-brass">{COMPANY.address.airport}</p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass hover:text-ppa-brass-light transition-colors"
                >
                  Get in Touch
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
          </div>

          <div className="px-6 lg:px-0 lg:h-full">
            <AnimatedSection delay={0.15} className="lg:h-full">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
                <Image
                  src="/images/PPA-Sign.jpg"
                  alt="Plane Place Aviation sign and hangar at Cleburne Regional Airport"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ppa-black/30 to-transparent" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
