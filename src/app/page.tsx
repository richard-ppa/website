"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CountUp } from "@/components/CountUp";
import { COMPANY, AIRFRAMES, SERVICES } from "@/lib/constants";

const SERVICE_ICONS: Record<string, React.ElementType> = {
  wrench: WrenchScrewdriverIcon,
  clipboard: ClipboardDocumentCheckIcon,
  bolt: BoltIcon,
  shield: ShieldCheckIcon,
  cpu: CpuChipIcon,
  chart: ChartBarIcon,
};

// Map airframe slugs to their showcase images
const AIRFRAME_IMAGES: Record<string, { src: string; alt: string }> = {
  hawker: {
    src: "/images/Engine-MX.jpg",
    alt: "PPA technician performing engine maintenance on a Hawker business jet",
  },
  citation: {
    src: "/images/Wing-MX-2.jpg",
    alt: "PPA technicians inspecting the underside of a Citation aircraft wing",
  },
  challenger: {
    src: "/images/Winglet-Install-04.jpg",
    alt: "PPA technician riveting structural components on a Challenger winglet",
  },
};

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center pt-44 pb-20 overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/Winglet-Install-03.jpg"
            alt="PPA technician working on aircraft wing silhouetted against hangar door at sunset"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-ppa-navy/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-ppa-navy/90 via-ppa-navy/60 to-transparent" />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ppa-navy to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-medium text-ppa-accent-bright bg-ppa-accent/10 border border-ppa-accent/20 rounded-full backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ppa-success animate-pulse" />
              FAA Part 145 Certified Repair Station
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight"
            >
              <span className="text-white">The specialist MRO for</span>
              <br />
              <span className="text-gradient">
                Hawker, Citation &amp; Challenger
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-ppa-gray-light max-w-2xl leading-relaxed"
            >
              Founder-led, fast turnaround, transparent pricing. We only work on
              three airframe families — and we do it better than anyone.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-ppa-accent hover:bg-ppa-accent-bright rounded-xl transition-all shadow-lg shadow-ppa-accent/25 hover:shadow-ppa-accent/40 hover:-translate-y-0.5"
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
            </motion.div>

            {/* Tagline + location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16"
            >
              <p className="text-xl sm:text-2xl font-semibold italic tracking-wide text-ppa-accent-bright">
                Precise. Professional. Attentive.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="section-divider" />

      {/* ─── AIRFRAMES ─── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-3">
                Specialist Focus
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Three airframe families.
                <br />
                <span className="text-ppa-gray">Zero compromises.</span>
              </h2>
              <p className="mt-4 text-ppa-gray-light max-w-2xl mx-auto">
                Every tool, part, and procedure in our facility is optimized for
                Hawker, Citation, and Challenger. Our techs don&apos;t context-switch
                between a King Air and a Gulfstream.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-6">
            {Object.values(AIRFRAMES).map((airframe, i) => {
              const img = AIRFRAME_IMAGES[airframe.slug];
              return (
                <AnimatedSection key={airframe.slug} delay={i * 0.15}>
                  <Link
                    href={`/aircraft/${airframe.slug}`}
                    className="group block glass-card rounded-2xl overflow-hidden h-full transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Aircraft image */}
                    <div className="h-56 relative overflow-hidden">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ppa-navy-light/90 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <span className="text-3xl font-bold text-white drop-shadow-lg">
                          {airframe.name}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 pt-4">
                      <p className="text-sm text-ppa-accent mb-3">
                        {airframe.models.join(" / ")}
                      </p>
                      <p className="text-ppa-gray-light text-sm leading-relaxed mb-4">
                        {airframe.description}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ppa-accent group-hover:text-ppa-accent-bright transition-colors">
                        View capabilities
                        <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/Aircraft-MX.jpg"
            alt="PPA hangar with multiple aircraft undergoing maintenance"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ppa-navy/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-3">
                What We Do
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Full-service maintenance.
                <br />
                <span className="text-ppa-gray">Specialist execution.</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => {
              const Icon = SERVICE_ICONS[service.icon];
              return (
                <AnimatedSection key={service.slug} delay={i * 0.1}>
                  <div className="glass-card rounded-2xl p-8 h-full group hover:-translate-y-1 transition-all duration-300">
                    <div className="h-12 w-12 rounded-xl bg-ppa-accent/10 flex items-center justify-center mb-5 group-hover:bg-ppa-accent/20 transition-colors">
                      <Icon className="h-6 w-6 text-ppa-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-ppa-gray-light leading-relaxed">
                      {service.short}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          <AnimatedSection delay={0.3}>
            <div className="text-center mt-12">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-ppa-accent border border-ppa-accent/30 hover:bg-ppa-accent/10 rounded-xl transition-colors"
              >
                View all services
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── WHY PPA ─── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-3">
                Why PPA
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Built by operators,
                <br />
                <span className="text-ppa-gray">for operators.</span>
              </h2>
              <p className="mt-4 text-ppa-gray-light max-w-2xl mx-auto">
                Founders Tristan Noe and Travis Roberson came from the operator
                side — charter ops, maintenance management, and aircraft
                ownership. They built the MRO they wished existed as customers.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Narrow Specialization",
                description:
                  "Three airframe families. Every tool, part, and procedure optimized for Hawker, Citation, and Challenger.",
              },
              {
                title: "Transparent Pricing",
                description:
                  "Detailed quotes upfront, clear scope documentation, proactive communication on any changes.",
              },
              {
                title: "Documentation Quality",
                description:
                  "Audit-ready, thorough maintenance records on every work order. Your records protect your aircraft's value.",
              },
              {
                title: "AOG Response",
                description:
                  "Mobile maintenance team covering Texas and Oklahoma. When your aircraft is down, we come to you.",
              },
              {
                title: "Strategic Location",
                description:
                  "30 minutes from DFW with significantly lower operating costs. Lower overhead means better value for you.",
              },
              {
                title: "Founder Accountability",
                description:
                  "Tristan and Travis are on the floor across our three hangars, not in a corporate office. The owners answer the phone.",
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <div className="relative pl-6 border-l-2 border-ppa-accent/30 hover:border-ppa-accent transition-colors">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ppa-gray-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM / FOUNDERS ─── */}
      <section className="py-24 sm:py-32 bg-ppa-navy-light border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div>
                <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-3">
                  Leadership
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  The owners answer the phone.
                </h2>
                <p className="text-ppa-gray-light leading-relaxed mb-4">
                  Plane Place Aviation was founded by Tristan Noe and
                  Travis Roberson — two operators who spent years on the customer
                  side of the MRO relationship. They experienced the
                  frustrations of unclear pricing, missed turnaround dates, and
                  impersonal service firsthand.
                </p>
                <p className="text-ppa-gray-light leading-relaxed mb-8">
                  They built PPA to be different: a specialist shop with
                  operator-level understanding, transparent communication, and
                  the accountability that comes from founders who are on the
                  floor every day.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {COMPANY.founders.map((founder) => (
                    <div key={founder.email} className="glass-card rounded-xl p-5 flex-1">
                      <p className="font-bold text-white">{founder.name}</p>
                      <p className="text-sm text-ppa-gray mb-2">
                        {founder.title}
                      </p>
                      <a
                        href={`mailto:${founder.email}`}
                        className="text-sm text-ppa-accent hover:text-ppa-accent-bright transition-colors"
                      >
                        {founder.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                <Image
                  src="/images/Winglet-Install---01.jpg"
                  alt="PPA technicians collaborating on winglet structural work in the Cleburne hangar"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ppa-navy/40 to-transparent" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── PHOTO GALLERY STRIP ─── */}
      <section className="py-2 bg-ppa-navy">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { src: "/images/Winglet-Install-05.jpg", alt: "PPA tech working on winglet installation with hangar view" },
            { src: "/images/Winglet-MX---James02.jpg", alt: "Senior PPA technician performing precision riveting work" },
            { src: "/images/Wing-MX.jpg", alt: "PPA technician inspecting aircraft underside in hangar" },
            { src: "/images/Winglet-Install-02.jpg", alt: "PPA technician drilling winglet components on workbench" },
          ].map((photo) => (
            <div key={photo.src} className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── LOCATION ─── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-3">
              Location
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cleburne, Texas — KCPT
            </h2>
            <p className="text-ppa-gray-light max-w-2xl mx-auto mb-8">
              30 minutes south of DFW, with lower operating costs that translate
              to better value for our customers. Fly directly into Cleburne
              Regional Airport — we operate out of three hangars on the field.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="aspect-[21/9] rounded-2xl overflow-hidden relative max-w-5xl mx-auto">
              <Image
                src="/images/Wing-MX---Travis-Angel.jpg"
                alt="PPA technicians working on aircraft wing with business jet in background at Cleburne hangar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ppa-navy/60 to-transparent" />
              <div className="absolute bottom-6 left-8 text-left">
                <p className="text-white font-bold text-lg">
                  {COMPANY.address.street}
                </p>
                <p className="text-ppa-gray-light text-sm">
                  {COMPANY.address.city}, {COMPANY.address.state}{" "}
                  {COMPANY.address.zip} — {COMPANY.address.airport}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
