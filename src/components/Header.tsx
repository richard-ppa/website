"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY, NAV_LINKS } from "@/lib/constants";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aircraftOpen, setAircraftOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={`relative transition-all duration-500 ${
          scrolled
            ? "bg-ppa-white/95 backdrop-blur-md border-b border-ppa-border"
            : "bg-transparent"
        }`}
      >
        {/* Gradient scrim for readability over hero images (unscrolled only) */}
        <div
          className={`absolute inset-0 h-[180px] bg-gradient-to-b from-black/75 via-black/45 to-transparent pointer-events-none transition-opacity duration-500 ${
            scrolled ? "opacity-0" : "opacity-100"
          }`}
        />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-[auto_1fr_auto] items-center h-24 lg:h-28 gap-6">
          {/* Logo — single SVG, invert filter applied when unscrolled for visibility on dark hero */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/logo.svg"
              alt="Plane Place Aviation"
              width={609}
              height={224}
              className={`h-[3.6rem] lg:h-[4.8rem] w-auto transition-[filter] duration-500 ${
                scrolled ? "" : "brightness-0 invert"
              }`}
              priority
            />
          </Link>

          {/* Center nav — desktop only */}
          <div className="hidden lg:flex items-center justify-center gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setAircraftOpen(true)}
                  onMouseLeave={() => setAircraftOpen(false)}
                >
                  <button
                    style={{ fontFamily: "var(--font-inter)" }}
                    className={`px-4 py-2 text-[13px] tracking-[1px] transition-colors ${
                      isActive(link.href) ? "font-semibold" : "font-normal"
                    } ${
                      scrolled
                        ? "text-ppa-dark hover:text-ppa-black"
                        : "text-ppa-white/85 hover:text-ppa-white"
                    } ${
                      isActive(link.href)
                        ? "no-underline"
                        : `underline underline-offset-[6px] decoration-[1.5px] ${
                            scrolled ? "decoration-ppa-brass" : "decoration-ppa-brass-bright"
                          }`
                    }`}
                  >
                    {link.label}
                  </button>
                  <AnimatePresence>
                    {aircraftOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-48 py-2 bg-ppa-white border border-ppa-border shadow-lg"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-2.5 text-[13px] text-ppa-dark hover:text-ppa-brass hover:bg-ppa-light transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ fontFamily: "var(--font-inter)" }}
                  className={`px-4 py-2 text-[13px] tracking-[1px] transition-colors ${
                    isActive(link.href) ? "font-semibold" : "font-normal"
                  } ${
                    scrolled
                      ? "text-ppa-dark hover:text-ppa-black"
                      : "text-ppa-white/85 hover:text-ppa-white"
                  } ${
                    isActive(link.href)
                      ? "no-underline"
                      : `underline underline-offset-[6px] decoration-[1.5px] ${
                          scrolled ? "decoration-ppa-brass" : "decoration-ppa-brass-bright"
                        }`
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right cluster — AOG + CTA + mobile hamburger */}
          <div className="flex items-center gap-5 justify-self-end">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className={`hidden md:flex items-center gap-2 text-[12px] font-medium tracking-[0.02em] transition-colors ${
                scrolled
                  ? "text-ppa-brass hover:text-ppa-brass-dark"
                  : "text-ppa-brass-bright hover:text-ppa-white"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                  scrolled ? "bg-ppa-brass" : "bg-ppa-brass-bright"
                }`}
              />
              AOG: {COMPANY.phone}
            </a>
            <Link
              href="/quote"
              className={`hidden sm:inline-flex px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                scrolled
                  ? "text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark"
                  : "text-ppa-white border border-ppa-white/40 hover:bg-ppa-white hover:text-ppa-black"
              }`}
            >
              Get a Quote
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 transition-colors ${
                scrolled ? "text-ppa-black" : "text-ppa-white"
              }`}
              aria-label="Toggle navigation menu"
            >
              <div className="w-6 flex flex-col gap-1.5">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  className="block h-[1.5px] w-full bg-current"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block h-[1.5px] w-full bg-current"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  className="block h-[1.5px] w-full bg-current"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden bg-ppa-white border-t border-ppa-border"
            >
              <div className="px-6 py-8 space-y-1">
                {NAV_LINKS.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <div className="px-0 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted">
                        {link.label}
                      </div>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-ppa-dark hover:text-ppa-brass transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-sm font-normal text-ppa-dark hover:text-ppa-brass transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <div className="pt-6 space-y-3">
                  <Link
                    href="/quote"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full py-3 text-sm font-semibold text-center text-ppa-white bg-ppa-brass uppercase tracking-wider"
                  >
                    Request a Quote
                  </Link>
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="block w-full py-3 text-sm font-semibold text-center text-ppa-brass border border-ppa-brass/40"
                  >
                    AOG: {COMPANY.phone}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
