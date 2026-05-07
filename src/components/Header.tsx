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

  // Lock body scroll while the mobile takeover is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Hide public-site nav inside the admin dashboard — admin has its own header
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className={`relative transition-all duration-500 ${
          scrolled || mobileOpen
            ? "bg-ppa-white/95 backdrop-blur-md border-b border-ppa-border"
            : "bg-transparent"
        }`}
      >
        {/* Gradient scrim for readability over hero images (unscrolled only).
            Hidden when the mobile menu is open — otherwise it stacks above the
            menu (since absolute > static in stacking) and darkens the top links. */}
        <div
          className={`absolute inset-0 h-[180px] bg-gradient-to-b from-black/75 via-black/45 to-transparent pointer-events-none transition-opacity duration-500 ${
            scrolled || mobileOpen ? "opacity-0" : "opacity-100"
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
              className={`h-[4.5rem] lg:h-[4.8rem] w-auto transition-[filter] duration-500 ${
                scrolled || mobileOpen ? "" : "brightness-0 invert"
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
                  <Link
                    href={link.href}
                    style={{ fontFamily: "var(--font-inter)" }}
                    className={`inline-block px-4 py-2 text-[13px] tracking-[1px] transition-colors ${
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
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className={`lg:hidden relative z-[60] p-3 -m-1 cursor-pointer transition-colors touch-manipulation ${
                scrolled || mobileOpen ? "text-ppa-black" : "text-ppa-white"
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="w-6 h-6 pointer-events-none"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path d="M6 6L18 18M6 18L18 6" />
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav — full-screen editorial takeover */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="lg:hidden fixed inset-x-0 top-24 h-[calc(100dvh-6rem)] z-[55] bg-ppa-white overflow-y-auto"
            >
              <motion.div
                className="min-h-full flex flex-col px-8 pt-12 pb-10"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
                  },
                  closed: {
                    transition: { staggerChildren: 0.03, staggerDirection: -1 },
                  },
                }}
              >
                {/* Eyebrow */}
                <motion.div
                  variants={{
                    open: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    closed: { opacity: 0, y: 12 },
                  }}
                  className="flex items-center gap-3 mb-8"
                >
                  <span className="h-px w-8 bg-ppa-brass" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                    Navigation
                  </span>
                </motion.div>

                {/* Nav links */}
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <motion.li
                        key={link.label}
                        variants={{
                          open: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] },
                          },
                          closed: { opacity: 0, y: 24 },
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`group relative flex items-center justify-between py-3 font-display text-4xl leading-none transition-colors ${
                            active ? "text-ppa-brass" : "text-ppa-black hover:text-ppa-brass"
                          }`}
                        >
                          <span className="flex items-center gap-4">
                            {active && (
                              <span aria-hidden className="h-[2px] w-6 bg-ppa-brass" />
                            )}
                            <span>{link.label}</span>
                          </span>
                          <svg
                            aria-hidden
                            className={`w-5 h-5 transition-all ${
                              active
                                ? "text-ppa-brass translate-x-0 opacity-100"
                                : "text-ppa-muted -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>

                {/* Footer block — pushed to bottom by mt-auto */}
                <motion.div
                  variants={{
                    open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
                    closed: { opacity: 0, y: 16 },
                  }}
                  className="mt-auto pt-12"
                >
                  {/* CTAs */}
                  <div className="space-y-3">
                    <Link
                      href="/quote"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-center text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors"
                    >
                      Request a Quote
                    </Link>
                    <a
                      href={`tel:${COMPANY.phoneRaw}`}
                      className="flex items-center justify-center gap-2.5 w-full py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-brass border border-ppa-brass/40 hover:bg-ppa-brass/5 transition-colors"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-ppa-brass animate-pulse" />
                      AOG: {COMPANY.phone}
                    </a>
                  </div>

                  {/* Address */}
                  <div className="mt-8 text-sm text-ppa-gray space-y-1 leading-relaxed">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted mb-2">
                      Visit Us
                    </p>
                    <p>{COMPANY.address.street}</p>
                    <p>
                      {COMPANY.address.city}, {COMPANY.address.state} {COMPANY.address.zip}
                    </p>
                    <p className="text-ppa-brass pt-1">{COMPANY.address.airport}</p>
                  </div>

                  {/* Social */}
                  <div className="mt-8 flex items-center gap-5">
                    <a
                      href={COMPANY.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ppa-gray hover:text-ppa-brass transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href={COMPANY.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ppa-gray hover:text-ppa-brass transition-colors"
                      aria-label="Facebook"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href={COMPANY.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ppa-gray hover:text-ppa-brass transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
