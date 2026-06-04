import type { Metadata } from "next";
import Image from "next/image";
import { COMPANY } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormErrorBanner } from "@/components/FormErrorBanner";
import { Turnstile } from "@/components/Turnstile";
import { FounderMessageButton } from "@/components/FounderMessageButton";
import { LocationMap } from "@/components/LocationMap";

const TURNSTILE_SITE_KEY = "0x4AAAAAADJznk9rZYC4F2WZ";

export const metadata: Metadata = {
  title: "Contact — AOG Hotline, Quote Requests & Location",
  description:
    "Contact Plane Place Aviation in Cleburne, Texas. AOG hotline: (817) 768-8884. Request a quote, schedule maintenance, or fly into KCPT — we operate out of three hangars on the field.",
  alternates: {
    canonical: "https://ppa.aero/contact",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero/contact",
    siteName: "Plane Place Aviation",
    title: "Contact — AOG Hotline, Quote Requests & Location",
    description:
      "Contact Plane Place Aviation in Cleburne, Texas. AOG hotline: (817) 768-8884. Request a quote, schedule maintenance, or fly into KCPT — we operate out of three hangars on the field.",
    images: [
      {
        url: "https://ppa.aero/images/about-us.jpg",
        alt: "Plane Place Aviation team and Cleburne hangar facility",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — AOG Hotline, Quote Requests & Location",
    description:
      "Contact Plane Place Aviation in Cleburne, Texas. AOG hotline: (817) 768-8884. Request a quote, schedule maintenance, or fly into KCPT — we operate out of three hangars on the field.",
    images: ["https://ppa.aero/images/about-us.jpg"],
  },
};

// ContactPage schema — tells Google this is a Contact page, linked to the
// root LocalBusiness so all the contact info there can be associated with
// this page.
const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://ppa.aero/contact#webpage",
  url: "https://ppa.aero/contact",
  name: "Contact — Plane Place Aviation",
  isPartOf: { "@id": "https://ppa.aero/#website" },
  about: { "@id": "https://ppa.aero/#organization" },
  inLanguage: "en-US",
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {/* Hero */}
      <section className="relative h-[100dvh] min-h-[600px] lg:min-h-[700px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/about-us.jpg"
            alt="Plane Place Aviation team and facility"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/40 to-ppa-black/10" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <Breadcrumb crumbs={[{ label: "Contact", href: "/contact" }]} variant="dark" />

          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Contact Us
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9]">
            Let&apos;s Talk About
            <br />
            <span className="text-ppa-muted">Your Aircraft.</span>
          </h1>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16 border-b border-ppa-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-px bg-ppa-border">
            {/* AOG */}
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="bg-ppa-white p-8 lg:p-10 group hover:bg-ppa-light transition-colors"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass">
                AOG Hotline
              </span>
              <p className="font-display text-3xl sm:text-4xl text-ppa-brass group-hover:text-ppa-brass-dark transition-colors mt-3">
                {COMPANY.phone}
              </p>
              <p className="text-sm text-ppa-gray mt-3">
                Aircraft down? Call us now. TX &amp; OK mobile coverage.
              </p>
            </a>

            {/* Founders */}
            <div className="bg-ppa-white p-8 lg:p-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass">
                Reach a Founder
              </span>
              <div className="mt-4 space-y-4">
                {COMPANY.founders.map((founder) => (
                  <div key={founder.slug}>
                    <p className="text-sm text-ppa-dark">
                      {founder.name}, {founder.title}
                    </p>
                    <FounderMessageButton founder={founder} />
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-ppa-white p-8 lg:p-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass">
                Visit Us
              </span>
              <div className="mt-4 text-sm space-y-1">
                <p className="text-ppa-dark">{COMPANY.address.street}</p>
                <p className="text-ppa-dark">
                  {COMPANY.address.city}, {COMPANY.address.state}{" "}
                  {COMPANY.address.zip}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ppa-brass hover:text-ppa-brass-dark transition-colors mt-2 inline-block underline-offset-2 hover:underline"
                >
                  {COMPANY.address.airport}
                </a>
              </div>
            </div>
          </div>

          {/* Map — full width below the 3 contact cards */}
          <div className="mt-10 border border-ppa-border overflow-hidden">
            <LocationMap
              lat={32.3535}
              lng={-97.4344}
              fitBoundsTo={[
                [32.7555, -97.3308], // Fort Worth
                [32.7767, -96.797],  // Dallas
              ]}
              className="h-[420px] w-full"
              label={`${COMPANY.name} — ${COMPANY.address.street}, ${COMPANY.address.city}, ${COMPANY.address.state} ${COMPANY.address.zip}`}
            />
          </div>
        </div>
      </section>

      {/* Contact form + image */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl text-ppa-black leading-none mb-8">
                Send Us a Message
              </h2>
              <FormErrorBanner />
              <form action="/contact" method="POST" className="space-y-5">
                {/* Honeypot — hidden from real users, bots fill it in */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] w-px h-px opacity-0"
                />
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="form-input"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="form-label">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="form-input"
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="form-input"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="form-label">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-input"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="form-label">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    className="form-input resize-none"
                    placeholder="Tell us about your aircraft and what you need..."
                  />
                </div>

                {/* Turnstile widget */}
                <Turnstile siteKey={TURNSTILE_SITE_KEY} />

                <button
                  type="submit"
                  className="px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-ppa-brass"
                >
                  Send Message
                </button>
              </form>
            </div>

            <div className="relative overflow-hidden min-h-[400px]">
              <Image
                src="/images/Winglet-Install---James.jpg"
                alt="Plane Place Aviation technician James performing detailed winglet work"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
