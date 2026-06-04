"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { COMPANY, AIRFRAMES } from "@/lib/constants";

/**
 * HomeHero — cycling type-family hero.
 *
 * Cross-fades through Hawker → Citation → Challenger every 5s with a subtle
 * Ken-Burns scale. The headline reads "Precise. Professional. Attentive on
 * [FAMILY]." where [FAMILY] is the cycling family name in cyan with a
 * blur+slide swap on each change. A giant semi-transparent ghost word
 * (the family name in uppercase italic) sits on the right edge as
 * decorative background type. A stats strip swaps the active family's
 * models + signature inspection cadence. A selector strip at the very
 * bottom lets visitors preview a family on hover and click through to that
 * family's capabilities page; an "Auto" reset re-arms the carousel.
 *
 * Respects prefers-reduced-motion: no auto-cycle, no Ken-Burns scale, no
 * blur/slide swaps.
 */

type FamilyKey = "hawker" | "citation" | "challenger";

const FAMILIES: ReadonlyArray<{
  key: FamilyKey;
  name: string;
  photo: string;
  alt: string;
  position: string;
  models: string;
  cadence: string;
  cadenceLabel: string;
}> = [
  {
    key: "hawker",
    name: "Hawker",
    photo: "/images/Gallery/Hangar-Hawkers.jpg",
    alt: "Hawker aircraft in the Plane Place Aviation hangar",
    position: "center 55%",
    models: AIRFRAMES.hawker.models.join(" · "),
    cadence: "B–G Phase · 4-Year · 8-Year",
    cadenceLabel: "Inspection Cadence",
  },
  {
    key: "citation",
    name: "Citation",
    photo: "/images/Citation-Hangar.jpg",
    alt: "Citation in the Plane Place Aviation hangar",
    position: "center 50%",
    models: AIRFRAMES.citation.models.join(" · "),
    cadence: "Phase 1–5 · Annual",
    cadenceLabel: "Inspection Cadence",
  },
  {
    key: "challenger",
    name: "Challenger",
    photo: "/images/challenger-in-shop.jpg",
    alt: "Challenger aircraft in the Plane Place Aviation shop",
    position: "center 50%",
    models: AIRFRAMES.challenger.models.join(" · "),
    cadence: "96-Month · 192-Month · Gear",
    cadenceLabel: "Major Events",
  },
];

const CYCLE_MS = 5000;
const EASE = [0.16, 1, 0.3, 1] as const;

export default function HomeHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [active, setActive] = useState(0);
  const [locked, setLocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect reduced-motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-cycle unless locked or reduced motion
  useEffect(() => {
    if (locked || reducedMotion) return;
    const interval = setInterval(() => {
      setActive((a) => (a + 1) % FAMILIES.length);
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, [locked, reducedMotion]);

  const activeFamily = FAMILIES[active];

  const previewFamily = (i: number) => {
    setActive(i);
    setLocked(true);
  };

  // Family-name swap animation states for the headline word. Reduced motion
  // collapses to a plain opacity fade.
  const headlineEnter = reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -24, filter: "blur(8px)" };
  const headlineActive = reducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };
  const headlineExit = reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -24, filter: "blur(8px)" };

  return (
    <section
      ref={heroRef}
      className="relative h-screen overflow-hidden flex flex-col"
      aria-label={`Specialist MRO hero — currently highlighting ${activeFamily.name}`}
    >
      {/* Cross-fading background photos with subtle Ken-Burns */}
      <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
        {FAMILIES.map((f, i) => (
          <motion.div
            key={f.key}
            initial={false}
            animate={{
              opacity: i === active ? 1 : 0,
              scale: !reducedMotion && i === active ? 1.06 : 1,
            }}
            transition={{
              opacity: { duration: 1.1, ease: EASE },
              scale: { duration: CYCLE_MS / 1000, ease: "linear" },
            }}
            className="absolute inset-0"
            aria-hidden={i !== active}
          >
            <Image
              src={f.photo}
              alt={f.alt}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: f.position }}
              priority={i === 0}
              quality={90}
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ppa-black/50 via-ppa-black/15 to-transparent" />
      </motion.div>

      {/* Ghost family-name layer — sits above the photo gradients but below
          the main content column. Slides + fades on each family swap. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeFamily.key}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -60 }}
          transition={{ duration: 0.8, ease: EASE }}
          aria-hidden
          className="font-display absolute pointer-events-none italic z-[1]"
          style={{
            right: "-2rem",
            top: "15%",
            fontSize: "clamp(8rem, 18vw, 16rem)",
            lineHeight: 0.85,
            letterSpacing: "-0.05em",
            fontWeight: 900,
            color: "rgba(247, 246, 243, 0.08)",
            whiteSpace: "nowrap",
          }}
        >
          {activeFamily.name.toUpperCase()}
        </motion.div>
      </AnimatePresence>

      {/* Main content — sits in the lower-middle of the viewport so the
          upper portion of the background photo is fully visible. */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="relative flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-[30vh] lg:pt-[28vh] z-10"
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

        {/* Headline — "Precise. Professional." static, "Attentive on
            [FAMILY]." with the cycling family name in cyan. */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="font-display text-[clamp(2.4rem,6.4vw,6rem)] leading-[0.95] tracking-[-0.015em]"
        >
          <span className="block text-ppa-white">Precise. Professional.</span>
          {/* "Attentive on" stays inline with the cycling family name on
              the same line. The cycling word renders as plain inline text
              so its baseline aligns with the preceding "Attentive on " —
              an inline-block wrapper would shift its baseline to the box
              bottom and offset it visually. */}
          <span className="block">
            <span className="text-ppa-light/40">Attentive on </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeFamily.key}
                initial={headlineEnter}
                animate={headlineActive}
                exit={headlineExit}
                transition={{ duration: 0.6, ease: EASE }}
                className="text-ppa-brass-bright"
              >
                {activeFamily.name}s.
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-6 text-lg sm:text-xl text-ppa-light/90 max-w-xl font-light leading-relaxed"
        >
          Founder-led. Fast turnaround. Transparent pricing. Three airframe
          families — nothing else.
        </motion.p>

        {/* Stats strip — swaps with active family */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-10 max-w-[680px] border-t border-ppa-brass-bright/25 pt-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-10 gap-y-4 items-start"
        >
          <StatBlock
            label={`${activeFamily.name} Family`}
            value={activeFamily.models}
            cycleKey={activeFamily.key + "-models"}
          />
          <StatBlock
            label={activeFamily.cadenceLabel}
            value={activeFamily.cadence}
            cycleKey={activeFamily.key + "-cadence"}
          />
        </motion.div>

      </motion.div>

      {/* Family selector — pinned to the bottom of the section so the main
          content above can occupy the upper-middle band of the viewport. */}
      <motion.div
        style={{ opacity: heroOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-8 lg:pb-12 z-10"
      >
        <div className="flex flex-wrap gap-x-2 gap-y-4 items-end">
          {FAMILIES.map((f, i) => {
            const isActive = i === active;
            return (
              <Link
                key={f.key}
                href={`/capabilities/${f.key}`}
                onMouseEnter={() => previewFamily(i)}
                onFocus={() => previewFamily(i)}
                className={`group relative pt-4 pr-8 sm:pr-14 text-left transition-colors duration-300 outline-none ${
                  isActive
                    ? "text-ppa-white"
                    : "text-ppa-light/45 hover:text-ppa-light/85 focus-visible:text-ppa-light/85"
                }`}
                aria-current={isActive ? "true" : undefined}
                aria-label={`View ${f.name} capabilities`}
              >
                <span
                  className={`absolute top-0 left-0 right-4 h-px transition-colors duration-500 ${
                    isActive
                      ? "bg-ppa-brass-bright"
                      : "bg-ppa-light/15 group-hover:bg-ppa-light/30"
                  }`}
                />
                <span className="block text-[10px] font-mono tracking-[0.2em] text-ppa-light/50 mb-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="block text-[12px] font-semibold uppercase tracking-[0.2em]">
                  {f.name}
                </span>
              </Link>
            );
          })}

          {locked && !reducedMotion && (
            <button
              type="button"
              onClick={() => setLocked(false)}
              className="ml-1 self-end text-[10px] font-mono tracking-[0.2em] uppercase text-ppa-light/55 hover:text-ppa-brass-bright transition-colors px-3 py-1.5 border border-ppa-light/20 hover:border-ppa-brass-bright/50"
              aria-label="Resume automatic cycling"
            >
              Auto ↻
            </button>
          )}

          {/* CTAs sit at the right end of the bottom strip, next to the
              family selectors and Auto button. ml-auto pushes them to the
              far right; self-end keeps them baseline-aligned with the
              selector items. */}
          <div className="ml-auto self-end flex flex-col sm:flex-row gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-all"
            >
              Request a Quote
            </Link>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-ppa-brass-bright border border-ppa-brass-bright/40 hover:bg-ppa-brass-bright/10 transition-all"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ppa-gold animate-pulse" />
              AOG? Call Now
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function StatBlock({
  label,
  value,
  cycleKey,
}: {
  label: string;
  value: string;
  cycleKey: string;
}) {
  return (
    <div className="min-w-0">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={cycleKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ppa-brass-bright mb-1.5">
            {label}
          </div>
          <div className="text-[14px] sm:text-[15px] font-mono text-ppa-light/85 tabular-nums whitespace-nowrap">
            {value}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
