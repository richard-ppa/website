"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { COMPANY } from "@/lib/constants";

export default function HomeHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={heroRef} className="relative h-screen flex items-end overflow-hidden">
      <motion.div style={{ y: heroY }} className="absolute inset-0">
        <Image
          src="/images/tail-image.jpg"
          alt="Business jet tail section at Plane Place Aviation hangar"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/70 to-transparent" />
      </motion.div>

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
          <span className="h-px w-8 bg-ppa-brass-bright" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
            MRO Specialist · FAA Part 145
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.95] tracking-[-0.015em] text-ppa-white"
        >
          Hawker, Citation <span className="whitespace-nowrap">&amp; Challenger.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-6 text-lg sm:text-xl text-ppa-light/90 max-w-xl font-light leading-relaxed"
        >
          Founder-led. Fast turnaround. Transparent pricing.
          Three airframe families — nothing else.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-all"
          >
            Request a Quote
          </Link>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-brass-bright border border-ppa-brass-bright/40 hover:bg-ppa-brass-bright/10 transition-all"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ppa-gold animate-pulse" />
            AOG? Call Now
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
