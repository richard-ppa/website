import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LocationMap } from "@/components/LocationMap";

export const metadata: Metadata = {
  title: "About — Founder-Led Aircraft MRO in Cleburne, TX",
  description:
    "Plane Place Aviation was founded by Tristan Noe and Travis Roberson — operators who built the MRO they wished existed. Precise. Professional. Attentive. FAA Part 145, Cleburne, Texas.",
  alternates: {
    canonical: "https://ppa.aero/about",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero/about",
    siteName: "Plane Place Aviation",
    title: "About — Founder-Led Aircraft MRO in Cleburne, TX",
    description:
      "Plane Place Aviation was founded by Tristan Noe and Travis Roberson — operators who built the MRO they wished existed. Precise. Professional. Attentive. FAA Part 145, Cleburne, Texas.",
    images: [
      {
        url: "https://ppa.aero/images/tech-working-on-wing.jpg",
        alt: "Plane Place Aviation technician working on aircraft wing in the Cleburne hangar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Founder-Led Aircraft MRO in Cleburne, TX",
    description:
      "Plane Place Aviation was founded by Tristan Noe and Travis Roberson — operators who built the MRO they wished existed. Precise. Professional. Attentive. FAA Part 145, Cleburne, Texas.",
    images: ["https://ppa.aero/images/tech-working-on-wing.jpg"],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero — Full-screen team photo with intro */}
      <section className="relative h-[100dvh] min-h-[600px] lg:min-h-[700px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/tech-working-on-wing.jpg"
            alt="Plane Place Aviation technician working on aircraft wing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/50 to-ppa-black/10" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 lg:pb-24">
          <Breadcrumb crumbs={[{ label: "About", href: "/about" }]} variant="dark" />

          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-ppa-brass-bright" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
              About Plane Place Aviation
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-12">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9] shrink-0">
              Big Enough to Handle.
              <br />
              <span className="text-ppa-muted">Small Enough to Care.</span>
            </h1>
            <div className="lg:border-l-2 lg:border-ppa-brass-bright lg:pl-12 flex items-center">
              <p className="text-lg lg:text-xl text-ppa-light/85 font-light leading-relaxed max-w-xl">
                Plane Place Aviation is an FAA Part 145 repair station in
                Cleburne, Texas that exclusively serves Hawker, Citation, and
                Challenger operators. We deliver deep airframe expertise,
                reliable turnaround times, and transparent pricing — all backed
                by founders who still run the company.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story — Photo-led, right-bleed */}
      <section className="py-24 lg:py-32 overflow-hidden">
        <div className="grid lg:grid-cols-2 items-center gap-y-14">
          {/* Text column */}
          <div className="px-6 lg:pl-10 lg:pr-16">
            <div className="lg:ml-auto lg:max-w-[580px]">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Our Story
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-8">
                How We Got Here
              </h2>
              <div className="space-y-5 text-ppa-gray font-light leading-relaxed">
                <p>
                  Plane Place Aviation was founded in 2022 by Tristan Noe and
                  Travis Roberson — two veterans of the aircraft maintenance
                  world. Both spent years on MRO floors, much of that time
                  turning wrenches on aircraft owned by charter operators, and
                  later in aircraft maintenance management. They&apos;d seen
                  what the industry did well, what it kept getting wrong, and
                  where customers walked away frustrated.
                </p>
                <p>
                  So they started Plane Place Aviation with a simple brief: a
                  shop where operators feel confident handing over their
                  aircraft, and a place where the people doing the work want to
                  come in every day. Tristan and Travis are still on the floor
                  — not in a corporate office — answering the questions and
                  signing the work.
                </p>
                <p>
                  That&apos;s what specialization buys you. We only work on
                  Hawker, Citation, and Challenger aircraft. Every tool, every
                  procedure, every technician&apos;s reps point at the same
                  three airframe families. The result isn&apos;t a
                  &ldquo;first-class experience&rdquo; — it&apos;s the right
                  answer, the first time.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-4">
                <span className="h-px w-10 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-black">
                  Tristan Noe &amp; Travis Roberson, Co-Founders
                </span>
              </div>
            </div>
          </div>

          {/* Image column — bleeds to right viewport edge */}
          <div className="relative min-h-[480px] lg:min-h-[760px]">
            <Image
              src="/images/Aircraft-in-Hangar---BW.jpg"
              alt="Business jet in the Plane Place Aviation hangar"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            {/* Scrim for caption legibility */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
            />
            {/* Editorial caption */}
            <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 flex items-center gap-3">
              <span className="h-px w-6 bg-ppa-brass" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/95">
                Hangar 98 · Cleburne, TX · Est. 2022
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Leadership
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-10">
            The Team Behind the Work.
          </h2>

          {/* Founders — featured row */}
          <div className="grid sm:grid-cols-2 gap-8 lg:gap-16 mb-10 lg:mb-14">
            {COMPANY.leadership.slice(0, 2).map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center"
              >
                <div className="w-52 h-52 lg:w-64 lg:h-64 relative overflow-hidden mb-4 bg-ppa-surface rounded-2xl shadow-xl">
                  <Image
                    src={member.photo}
                    alt={`${member.name}, ${member.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 208px, 256px"
                  />
                </div>
                <span className="h-[2px] w-10 bg-ppa-brass mb-3" />
                <h3 className="font-display text-3xl lg:text-4xl text-ppa-black leading-tight">
                  {member.name}
                </h3>
                <p className="text-sm text-ppa-brass mt-1.5 max-w-xs">
                  {member.title}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-ppa-border mb-10 lg:mb-12" />

          {/* Leadership / Leads — uniform row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8">
            {COMPANY.leadership.slice(2).map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center"
              >
                <div className="w-[8.4rem] h-[8.4rem] lg:w-[10.8rem] lg:h-[10.8rem] relative overflow-hidden mb-3 bg-ppa-surface rounded-xl shadow-xl">
                  <Image
                    src={member.photo}
                    alt={`${member.name}, ${member.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 135px, 173px"
                  />
                </div>
                <h3 className="font-display text-lg text-ppa-black leading-tight">
                  {member.name}
                </h3>
                <p className="text-xs text-ppa-brass mt-1 uppercase tracking-[0.1em]">
                  {member.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section>
        <div className="grid grid-cols-3 gap-1">
          {[
            { src: "/images/PPA-22.jpg", alt: "Plane Place Aviation operations" },
            { src: "/images/PPA-Employees.jpg", alt: "Plane Place Aviation team" },
            { src: "/images/PPA-HGR-98.jpg", alt: "Plane Place Aviation facility" },
          ].map((photo) => (
            <div key={photo.src} className="aspect-[16/9] relative overflow-hidden">
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Certifications
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-8">
                Precise. Professional. Attentive.
              </h2>
              <p className="text-ppa-gray font-light leading-relaxed mb-8 max-w-xl">
                Plane Place Aviation is an FAA-certified Part 145 repair
                station with full authorization to perform airframe
                maintenance, inspection, repair, and alteration on Hawker,
                Citation, and Challenger aircraft. Our Part 145 certification
                is the FAA's gold standard for independent MRO facilities —
                it confirms our quality control, training, tooling, and
                recordkeeping meet the same regulatory bar that OEM-authorized
                service centers operate under. We're also AFAC-approved to
                support Mexico-registered operators.
              </p>
              <div className="space-y-4">
                {[
                  { name: "FAA Part 145 Repair Station", desc: "Independent FAA-approved repair station serving Texas, Oklahoma, and beyond. Full airframe maintenance, inspection, and alteration authorization." },
                  { name: "Mexico AFAC Certification", desc: "Authorized to perform maintenance on Mexican-registered aircraft." },
                  { name: "AOG Mobile Response — TX & OK", desc: "Mobile maintenance team on call for Aircraft on Ground emergencies across Texas and Oklahoma. When your aircraft is down, we come to you." },
                ].map((cert) => (
                  <div key={cert.name} className="flex gap-4 p-5 border border-ppa-border">
                    <span className="text-ppa-brass font-display text-xl mt-0.5">+</span>
                    <div>
                      <h3 className="text-ppa-black font-semibold mb-1">{cert.name}</h3>
                      <p className="text-sm text-ppa-muted">{cert.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Location
                </span>
              </div>
              <h2 className="font-display text-4xl text-ppa-black leading-none mb-6">
                Cleburne, Texas — KCPT
              </h2>
              <p className="text-ppa-gray font-light leading-relaxed mb-6">
                40,000 sq ft of hangar space across three hangars at
                Cleburne Regional Airport — 30 minutes south of DFW.
                Lower operating costs than Love Field or Addison
                translate directly to better value for our customers,
                with comfortable lounge and office space for visiting
                crews.
              </p>
              <div className="space-y-1 text-sm text-ppa-muted mb-6">
                <p>{COMPANY.address.street}</p>
                <p>
                  {COMPANY.address.city}, {COMPANY.address.state}{" "}
                  {COMPANY.address.zip}
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass hover:text-ppa-brass-light transition-colors"
              >
                Get Directions
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              {/* Map */}
              <div className="mt-8 border border-ppa-border overflow-hidden">
                <LocationMap
                  lat={32.3535}
                  lng={-97.4344}
                  // Auto-zoom to show Cleburne (marker), Fort Worth, and Dallas
                  fitBoundsTo={[
                    [32.7555, -97.3308], // Fort Worth
                    [32.7767, -96.797],  // Dallas
                  ]}
                  className="h-[360px] w-full"
                  label={`${COMPANY.name} — ${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
