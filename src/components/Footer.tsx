import Link from "next/link";
import Image from "next/image";
import { COMPANY, NAV_LINKS, AIRFRAMES, SERVICES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-ppa-navy-light border-t border-white/5">
      {/* CTA Banner */}
      <div className="bg-ppa-accent/5 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to talk maintenance?
          </h2>
          <p className="text-ppa-gray mb-6 max-w-xl mx-auto">
            Whether you need a scheduled inspection, a pre-purchase evaluation,
            or AOG support right now — we&apos;re here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/quote"
              className="px-8 py-3 text-sm font-semibold text-white bg-ppa-accent hover:bg-ppa-accent-bright rounded-lg transition-colors shadow-lg shadow-ppa-accent/20"
            >
              Request a Quote
            </Link>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="px-8 py-3 text-sm font-semibold text-ppa-accent border border-ppa-accent/30 hover:bg-ppa-accent/10 rounded-lg transition-colors"
            >
              Call {COMPANY.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Footer columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/logo-white.png"
                alt="Plane Place Aviation"
                width={200}
                height={57}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-ppa-gray text-sm leading-relaxed mb-4">
              FAA Part 145 repair station specializing exclusively in Hawker,
              Citation, and Challenger aircraft.
            </p>
            <div className="space-y-1.5 text-sm text-ppa-gray">
              <p>{COMPANY.address.street}</p>
              <p>
                {COMPANY.address.city}, {COMPANY.address.state}{" "}
                {COMPANY.address.zip}
              </p>
              <p className="text-ppa-gray-light">{COMPANY.address.airport}</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services#${service.slug}`}
                    className="text-sm text-ppa-gray hover:text-ppa-accent-bright transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aircraft */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Aircraft We Serve
            </h3>
            <ul className="space-y-2.5">
              {Object.values(AIRFRAMES).map((airframe) => (
                <li key={airframe.slug}>
                  <Link
                    href={`/aircraft/${airframe.slug}`}
                    className="text-sm text-ppa-gray hover:text-ppa-accent-bright transition-colors"
                  >
                    {airframe.name}{" "}
                    <span className="text-ppa-steel">
                      ({airframe.models.join(", ")})
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mt-8 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.filter((l) => !l.children).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ppa-gray hover:text-ppa-accent-bright transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-ppa-gray uppercase tracking-wider mb-1">
                  AOG Hotline
                </p>
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="text-lg font-bold text-ppa-gold hover:text-ppa-gold-light transition-colors"
                >
                  {COMPANY.phone}
                </a>
              </div>
              {COMPANY.founders.map((founder) => (
                <div key={founder.email}>
                  <p className="text-sm text-ppa-gray-light">
                    {founder.name}, {founder.title}
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

            {/* Social */}
            <div className="flex gap-4 mt-6">
              <a
                href={COMPANY.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ppa-gray hover:text-white transition-colors"
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
                className="text-ppa-gray hover:text-white transition-colors"
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
                className="text-ppa-gray hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ppa-gray">
          <p>&copy; {new Date().getFullYear()} Plane Place Aviation. All rights reserved.</p>
          <p>FAA Part 145 Repair Station &mdash; Cleburne, Texas</p>
        </div>
      </div>
    </footer>
  );
}
