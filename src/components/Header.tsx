"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY, NAV_LINKS } from "@/lib/constants";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aircraftOpen, setAircraftOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            ? "bg-ppa-black/95 backdrop-blur-md border-b border-ppa-border/50"
            : "bg-transparent"
        }`}
      >
        {/* Gradient scrim for readability over hero images */}
        <div
          className={`absolute inset-0 h-[150px] bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-500 ${
            scrolled ? "opacity-0" : "opacity-100"
          }`}
        />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-28 lg:h-36">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/logo-white.png"
              alt="Plane Place Aviation"
              width={300}
              height={85}
              className="h-[78px] lg:h-[117px] w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setAircraftOpen(true)}
                  onMouseLeave={() => setAircraftOpen(false)}
                >
                  <button className="px-4 py-2 text-[13px] font-medium uppercase tracking-[0.15em] text-ppa-gray hover:text-ppa-white transition-colors">
                    {link.label}
                  </button>
                  <AnimatePresence>
                    {aircraftOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-0 w-48 py-2 bg-ppa-dark border border-ppa-border"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-2.5 text-[13px] text-ppa-gray hover:text-ppa-brass hover:bg-ppa-surface transition-colors"
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
                  className="px-4 py-2 text-[13px] font-medium uppercase tracking-[0.15em] text-ppa-gray hover:text-ppa-white transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="hidden md:flex items-center gap-2 text-[13px] font-medium text-ppa-brass hover:text-ppa-brass-light transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ppa-brass animate-pulse" />
              AOG: {COMPANY.phone}
            </a>
            <Link
              href="/quote"
              className="hidden sm:inline-flex px-6 py-2.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-black bg-ppa-brass hover:bg-ppa-brass-light transition-colors"
            >
              Get a Quote
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-ppa-white"
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
              className="lg:hidden overflow-hidden bg-ppa-black border-t border-ppa-border"
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
                          className="block px-4 py-2.5 text-sm text-ppa-gray hover:text-ppa-brass transition-colors"
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
                      className="block py-3 text-sm font-medium text-ppa-light hover:text-ppa-brass transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <div className="pt-6 space-y-3">
                  <Link
                    href="/quote"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full py-3 text-sm font-semibold text-center text-ppa-black bg-ppa-brass uppercase tracking-wider"
                  >
                    Request a Quote
                  </Link>
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="block w-full py-3 text-sm font-semibold text-center text-ppa-brass border border-ppa-brass/30"
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
