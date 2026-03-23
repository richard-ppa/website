"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CountUp } from "@/components/CountUp";
import { HorizontalGallery } from "@/components/HorizontalGallery";
import { PhotoGrid } from "@/components/PhotoGrid";
import { COMPANY, AIRFRAMES, SERVICES } from "@/lib/constants";

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

const GALLERY_IMAGES = [
  { src: "/images/PPA-01.jpg", alt: "PPA hangar operations" },
  { src: "/images/Winglet-Install-02.jpg", alt: "Winglet installation precision work" },
  { src: "/images/PPA-04.jpg", alt: "Aircraft maintenance at PPA" },
  { src: "/images/Wing-MX.jpg", alt: "Wing inspection from below" },
  { src: "/images/PPA-07.jpg", alt: "PPA facility and team" },
  { src: "/images/Tech-at-Station.jpg", alt: "Technician at workstation" },
  { src: "/images/PPA-10.jpg", alt: "Hangar operations overview" },
  { src: "/images/Winglet-MX---James02.jpg", alt: "Senior tech James at work" },
  { src: "/images/PPA-12.jpg", alt: "PPA aircraft servicing" },
];

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
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* ─── HERO — Full viewport, cinematic ─── */}
      <section ref={heroRef} className="relative h-screen flex items-end overflow-hidden">
        {/* Parallax background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="/images/tail-image.jpg"
            alt="Business jet tail section at Plane Place Aviation hangar"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/40 to-ppa-black/20" />
        </motion.div>

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 lg:pb-24"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              FAA Part 145 Certified
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] tracking-wide text-ppa-white max-w-5xl"
          >
            Specialist MRO for
            <br />
            <span className="text-brass-gradient">Hawker, Citation</span>
            <br />
            <span className="text-brass-gradient">& Challenger</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-6 text-lg sm:text-xl text-ppa-light/80 max-w-xl font-light leading-relaxed"
          >
            Founder-led. Fast turnaround. Transparent pricing.
            We only work on three airframe families — and we do
            it better than anyone.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
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
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 right-10 hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-ppa-muted rotate-90 origin-center translate-y-4">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-ppa-brass/50"
          />
        </motion.div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-ppa-dark border-y border-ppa-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: 40, suffix: "+", label: "Technicians" },
            { value: 3, suffix: "", label: "Airframe Families" },
            { value: 25, suffix: "+", label: "Aircraft Capacity" },
            { value: 2, suffix: "", label: "State AOG Coverage", prefix: "" },
          ].map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="font-display text-4xl sm:text-5xl text-ppa-brass leading-none">
                <CountUp end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AIRFRAMES — Large editorial cards ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ppa-brass" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                Specialist Focus
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-none mb-4">
              Three Airframe Families.
              <br />
              <span className="text-ppa-muted">Zero Compromises.</span>
            </h2>
            <p className="text-ppa-gray max-w-xl mb-16 font-light">
              Every tool, part, and procedure in our facility is optimized for
              Hawker, Citation, and Challenger. Our techs don&apos;t
              context-switch between a King Air and a Gulfstream.
            </p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-3 gap-3">
            {Object.values(AIRFRAMES).map((airframe, i) => {
              const img = AIRFRAME_IMAGES[airframe.slug];
              return (
                <AnimatedSection key={airframe.slug} delay={i * 0.12}>
                  <Link
                    href={`/aircraft/${airframe.slug}`}
                    className="group block relative overflow-hidden aspect-[3/4] lg:aspect-[2/3]"
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
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass mb-2">
                        {airframe.manufacturer}
                      </p>
                      <h3 className="font-display text-4xl lg:text-5xl text-ppa-white leading-none mb-3">
                        {airframe.name}
                      </h3>
                      <p className="text-sm text-ppa-light/70 mb-4">
                        {airframe.models.join(" / ")}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-brass group-hover:text-ppa-brass-light transition-colors">
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

      {/* ─── HORIZONTAL GALLERY STRIP ─── */}
      <section className="py-2 overflow-hidden">
        <HorizontalGallery images={GALLERY_IMAGES} />
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Winglet-Install-03.jpg"
            alt="PPA technician silhouette working on wing at sunset"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ppa-black/85" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
          <AnimatedSection>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ppa-brass" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                What We Do
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-none mb-16">
              Full-Service Maintenance.
              <br />
              <span className="text-ppa-muted">Specialist Execution.</span>
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ppa-border/50">
            {SERVICES.map((service, i) => (
              <AnimatedSection key={service.slug} delay={i * 0.08}>
                <div className="bg-ppa-black/60 backdrop-blur-sm p-8 lg:p-10 h-full group hover:bg-ppa-black/80 transition-colors duration-300">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-2xl text-ppa-white mt-3 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-sm text-ppa-gray leading-relaxed">
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
                className="inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass hover:text-ppa-brass-light transition-colors"
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

      {/* ─── WHY PPA — Split image/text ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimatedSection direction="left">
              <div className="relative">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <Image
                    src="/images/Winglet-Install---01.jpg"
                    alt="PPA technicians collaborating on winglet structural work"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Overlapping accent image */}
                <div className="absolute -bottom-8 -right-8 w-2/5 aspect-square overflow-hidden border-4 border-ppa-black hidden lg:block">
                  <Image
                    src="/images/Tech-at-Station.jpg"
                    alt="PPA technician at precision workstation"
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
                    Why PPA
                  </span>
                </div>
                <h2 className="font-display text-4xl sm:text-5xl text-ppa-white leading-none mb-6">
                  Built by Operators,
                  <br />
                  <span className="text-ppa-muted">For Operators.</span>
                </h2>
                <p className="text-ppa-gray leading-relaxed mb-10 font-light">
                  Founders Tristan Noe and Travis Roberson came from the operator
                  side — charter ops, maintenance management, and aircraft
                  ownership. They built the MRO they wished existed as customers.
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
                        <h3 className="text-ppa-white font-semibold mb-1">
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

      {/* ─── TEAM PHOTO — Full bleed ─── */}
      <section className="relative">
        <AnimatedSection direction="scale">
          <div className="aspect-[21/9] lg:aspect-[3/1] relative overflow-hidden">
            <Image
              src="/images/PPA-Employees.jpg"
              alt="The full Plane Place Aviation team in front of the Cleburne hangar"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ppa-black/60 via-transparent to-ppa-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
              <p className="font-display text-3xl lg:text-5xl text-ppa-white">
                40+ Technicians. One Team.
              </p>
              <p className="text-ppa-light/70 mt-2">Cleburne, Texas — KCPT</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ─── PHOTO GRID ─── */}
      <section className="py-2">
        <PhotoGrid photos={PHOTO_GRID} />
      </section>

      {/* ─── LOCATION ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Location
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-ppa-white leading-none mb-6">
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
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src="/images/Wing-MX---Travis-Angel.jpg"
                  alt="PPA technicians working on aircraft wing at Cleburne hangar"
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
