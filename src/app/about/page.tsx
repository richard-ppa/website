import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — Founder-Led Aircraft MRO in Cleburne, TX",
  description:
    "Plane Place Aviation was founded by Tristan Noe and Travis Roberson — operators who built the MRO they wished existed. Precise. Professional. Attentive. FAA Part 145, Cleburne, Texas.",
  alternates: {
    canonical: "https://ppa.aero/about",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero — Full-screen team photo with intro */}
      <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/tech-working-on-wing.jpg"
            alt="PPA technician working on aircraft wing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/50 to-ppa-black/10" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 lg:pb-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-ppa-brass-bright" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
              About PPA
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-12">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9] shrink-0">
              Built by Mechanics.
              <br />
              <span className="text-ppa-muted">Run by Mechanics.</span>
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
          <p className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-brass leading-none">
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
          <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-16">
            The Owners Answer the Phone.
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            {COMPANY.founders.map((founder) => {
              const headshot =
                founder.name === "Tristan Noe"
                  ? "/images/Tristan.jpg"
                  : "/images/Travis.jpg";
              return (
                <div key={founder.email} className="p-10 flex flex-col items-center text-center">
                  <div className="w-[291px] h-[291px] relative rounded-full overflow-hidden mb-6">
                    <Image
                      src={headshot}
                      alt={`${founder.name}, ${founder.title}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-display text-3xl text-ppa-black">
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section>
        <div className="grid grid-cols-3 gap-1">
          {[
            { src: "/images/PPA-22.jpg", alt: "PPA operations" },
            { src: "/images/PPA-Employees.jpg", alt: "PPA team" },
            { src: "/images/PPA-HGR-98.jpg", alt: "PPA facility" },
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
              <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-8">
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
