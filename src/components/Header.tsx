"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon, PhoneIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { COMPANY, NAV_LINKS } from "@/lib/constants";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aircraftOpen, setAircraftOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main nav */}
      <nav className="bg-ppa-navy/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-32">
          {/* Logo — real PPA logo, prominently sized */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/logo-white.png"
              alt="Plane Place Aviation — Hawker, Citation & Challenger MRO"
              width={280}
              height={80}
              className="h-20 sm:h-[100px] w-auto"
              priority
            />
          </Link>

          {/* Desktop nav — larger text for bigger header */}
          <div className="hidden lg:flex items-center gap-2">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setAircraftOpen(true)}
                  onMouseLeave={() => setAircraftOpen(false)}
                >
                  <button className="flex items-center gap-1 px-5 py-3 text-base text-ppa-gray-light hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    {link.label}
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  <AnimatePresence>
                    {aircraftOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-52 py-2 glass-card rounded-xl shadow-2xl"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-3 text-sm text-ppa-gray-light hover:text-white hover:bg-white/5 transition-colors"
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
                  className="px-5 py-3 text-base text-ppa-gray-light hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* CTA + AOG + Mobile toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-stretch gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-ppa-accent hover:bg-ppa-accent-bright rounded-full transition-colors shadow-lg shadow-ppa-accent/20"
              >
                Request a Quote
              </Link>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold text-ppa-gold bg-ppa-gold/10 border border-ppa-gold/25 rounded-full hover:bg-ppa-gold/20 hover:text-ppa-gold-light transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-ppa-gold animate-pulse" />
                AOG? Call {COMPANY.phone}
              </a>
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-ppa-gray-light hover:text-white rounded-lg hover:bg-white/5"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <Bars3Icon className="h-7 w-7" />
              )}
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
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-white/5"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <div className="px-4 py-3 text-sm font-medium text-ppa-gray">
                        {link.label}
                      </div>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-8 py-2.5 text-sm text-ppa-gray-light hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
                      className="block px-4 py-3 text-sm text-ppa-gray-light hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <Link
                  href="/quote"
                  onClick={() => setMobileOpen(false)}
                  className="block mt-3 px-4 py-3 text-sm font-semibold text-center text-white bg-ppa-accent rounded-lg"
                >
                  Request a Quote
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
