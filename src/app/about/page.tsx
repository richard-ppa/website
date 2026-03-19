import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — Founder-Led Aircraft MRO in Cleburne, TX",
  description:
    "Plane Place Aviation was founded by Tristan Noe and Travis Roberson — operators who built the MRO they wished existed. Precise. Professional. Attentive. FAA Part 145, Cleburne, Texas.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-44 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Wing-MX---Travis-Angel.jpg"
            alt="PPA technicians working on aircraft wing with business jet in background"
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
              About PPA
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Built by operators,{" "}
              <span className="text-ppa-gray">for operators.</span>
            </h1>
            <p className="text-lg text-ppa-gray-light leading-relaxed">
              Plane Place Aviation is an FAA Part 145 repair station in
              Cleburne, Texas that exclusively serves Hawker, Citation, and
              Challenger operators. We deliver deep airframe expertise, reliable
              turnaround times, and transparent pricing — all backed by founders
              who came from the operator side.
            </p>
          </div>
        </div>
      </section>

      {/* Facility photo */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden relative">
            <Image
              src="/images/Aircraft-MX.jpg"
              alt="PPA hangar with multiple business jets undergoing maintenance in Cleburne, Texas"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-ppa-navy-light border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-ppa-gray-light leading-relaxed">
                <p>
                  Tristan Noe and Travis Roberson spent years on the customer
                  side of the MRO relationship — managing charter operations,
                  overseeing maintenance programs, and dealing with the
                  frustrations that come with unclear pricing, missed turnaround
                  dates, and impersonal service.
                </p>
                <p>
                  They decided to build the MRO they wished had existed
                  when they were operators. The premise was simple: narrow the
                  focus to three airframe families, hire experienced technicians,
                  communicate transparently, and be accountable.
                </p>
                <p>
                  The approach hasn&apos;t changed — specialization, transparency,
                  and accountability remain the foundation of everything we do.
                  Precise. Professional. Attentive.
                </p>
              </div>
            </div>

            {/* Founders photo */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <Image
                src="/images/Winglet-Install---01.jpg"
                alt="PPA team collaborating on winglet structural work"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Leadership
          </h2>
          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {COMPANY.founders.map((founder) => (
              <div
                key={founder.email}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="aspect-square bg-ppa-slate/30 flex items-center justify-center">
                  <div className="text-center text-ppa-steel">
                    <p className="text-4xl font-bold text-ppa-accent/20">{founder.name.split(" ").map(n => n[0]).join("")}</p>
                    <p className="text-sm mt-2">Photo coming soon</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white">
                    {founder.name}
                  </h3>
                  <p className="text-ppa-accent text-sm mb-3">
                    {founder.title}
                  </p>
                  <a
                    href={`mailto:${founder.email}`}
                    className="text-sm text-ppa-gray hover:text-ppa-accent-bright transition-colors"
                  >
                    {founder.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tagline banner */}
      <section className="py-16 bg-ppa-navy-light border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-3xl sm:text-4xl font-bold tracking-wide text-gradient">
            Precise. Professional. Attentive.
          </p>
          <p className="mt-3 text-ppa-gray">
            Three airframe families. Zero compromises.
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Certifications</h2>
          <p className="text-ppa-gray-light mb-12 max-w-xl mx-auto">
            PPA holds FAA Part 145 and Mexico AFAC repair station
            certifications.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {["FAA Part 145 Repair Station", "Mexico AFAC Certification"].map(
              (cert) => (
                <div
                  key={cert}
                  className="glass-card rounded-xl px-8 py-6 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-ppa-accent/10 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-ppa-accent font-bold text-xs">
                      CERT
                    </span>
                  </div>
                  <p className="text-sm text-ppa-gray-light font-medium">
                    {cert}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-ppa-navy-light border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Cleburne, Texas — KCPT
              </h2>
              <div className="space-y-4 text-ppa-gray-light leading-relaxed">
                <p>
                  Located 30 minutes south of DFW at Cleburne Regional Airport
                  (KCPT), our facility offers the space and access we need
                  without big-city overhead — savings we pass on to our
                  customers.
                </p>
                <p>
                  Fly directly into KCPT — we operate out of three hangars right on the
                  field.
                </p>
              </div>
              <div className="mt-8 space-y-2 text-sm">
                <p className="text-ppa-gray-light">
                  {COMPANY.address.street}
                </p>
                <p className="text-ppa-gray-light">
                  {COMPANY.address.city}, {COMPANY.address.state}{" "}
                  {COMPANY.address.zip}
                </p>
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="text-ppa-accent hover:text-ppa-accent-bright transition-colors font-semibold inline-block mt-2"
                >
                  {COMPANY.phone}
                </a>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-ppa-accent hover:text-ppa-accent-bright transition-colors"
              >
                Get directions
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="aspect-square rounded-2xl overflow-hidden relative">
              <Image
                src="/images/Winglet-Install-03.jpg"
                alt="Silhouette of PPA technician working on wing with hangar door and runway in background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ppa-navy/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
