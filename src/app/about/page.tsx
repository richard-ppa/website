import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — Founder-Led Aircraft MRO in Cleburne, TX",
  description:
    "Plane Place Aviation was founded by Tristan Noe and Travis Roberson — operators who built the MRO they wished existed. Precise. Professional. Attentive. FAA Part 145, Cleburne, Texas.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero — Full-bleed team photo */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/tech-working-on-wing.jpg"
            alt="PPA technician working on aircraft wing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/40 to-ppa-black/10" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              About PPA
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9]">
            Built by Operators,
            <br />
            <span className="text-ppa-muted">For Operators.</span>
          </h1>
        </div>
      </section>

      {/* Intro text */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xl lg:text-2xl text-ppa-light font-light leading-relaxed">
              Plane Place Aviation is an FAA Part 145 repair station in
              Cleburne, Texas that exclusively serves Hawker, Citation, and
              Challenger operators. We deliver deep airframe expertise,
              reliable turnaround times, and transparent pricing — all backed
              by founders who came from the operator side.
            </p>
          </div>
        </div>
      </section>

      {/* Facility — Full-bleed */}
      <section>
        <div className="aspect-[21/9] relative overflow-hidden">
          <Image
            src="/images/Aircraft-MX.jpg"
            alt="PPA hangar with multiple business jets undergoing maintenance in Cleburne, Texas"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Our Story — Split layout */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Our Story
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-ppa-white leading-none mb-8">
                The MRO We Wished Existed
              </h2>
              <div className="space-y-5 text-ppa-gray font-light leading-relaxed">
                <p>
                  Tristan Noe and Travis Roberson spent years on the customer
                  side of the MRO relationship — managing charter operations,
                  overseeing maintenance programs, and dealing with the
                  frustrations that come with unclear pricing, missed
                  turnaround dates, and impersonal service.
                </p>
                <p>
                  They decided to build the MRO they wished had existed when
                  they were operators. The premise was simple: narrow the focus
                  to three airframe families, hire experienced technicians,
                  communicate transparently, and be accountable.
                </p>
                <p>
                  The approach hasn&apos;t changed — specialization,
                  transparency, and accountability remain the foundation of
                  everything we do.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] relative overflow-hidden">
                <Image
                  src="/images/Winglet-Install---01.jpg"
                  alt="PPA team collaborating on winglet structural work"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline — Full width */}
      <section className="py-16 lg:py-24 border-y border-ppa-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <p className="font-display text-5xl sm:text-6xl lg:text-7xl text-brass-gradient leading-none">
            Precise. Professional. Attentive.
          </p>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Leadership
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-ppa-white leading-none mb-16">
            The Owners Answer the Phone.
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
            {COMPANY.founders.map((founder) => (
              <div key={founder.email} className="border border-ppa-border p-8">
                <div className="w-16 h-16 bg-ppa-surface flex items-center justify-center mb-5">
                  <span className="font-display text-2xl text-ppa-brass">
                    {founder.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-display text-2xl text-ppa-white">
                  {founder.name}
                </h3>
                <p className="text-sm text-ppa-brass mb-3">{founder.title}</p>
                <a
                  href={`mailto:${founder.email}`}
                  className="text-sm text-ppa-muted hover:text-ppa-brass transition-colors"
                >
                  {founder.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section>
        <div className="grid grid-cols-3 gap-1">
          {[
            { src: "/images/PPA-01.jpg", alt: "PPA operations" },
            { src: "/images/PPA-Employees.jpg", alt: "PPA team" },
            { src: "/images/PPA-04.jpg", alt: "PPA facility" },
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
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Certifications
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-ppa-white leading-none mb-8">
                Certified. Trusted. Proven.
              </h2>
              <div className="space-y-4">
                {[
                  { name: "FAA Part 145 Repair Station", desc: "Full authorization for airframe maintenance, repair, and alteration." },
                  { name: "Mexico AFAC Certification", desc: "Authorized to perform maintenance on Mexican-registered aircraft." },
                ].map((cert) => (
                  <div key={cert.name} className="flex gap-4 p-5 border border-ppa-border">
                    <span className="text-ppa-brass font-display text-xl mt-0.5">+</span>
                    <div>
                      <h3 className="text-ppa-white font-semibold mb-1">{cert.name}</h3>
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
              <h2 className="font-display text-4xl text-ppa-white leading-none mb-6">
                Cleburne, Texas — KCPT
              </h2>
              <p className="text-ppa-gray font-light leading-relaxed mb-6">
                30 minutes south of DFW at Cleburne Regional Airport.
                Lower operating costs that translate to better value
                for our customers.
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
