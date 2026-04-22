import type { Metadata } from "next";
import Image from "next/image";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact — AOG Hotline, Quote Requests & Location",
  description:
    "Contact Plane Place Aviation in Cleburne, Texas. AOG hotline: (817) 768-8884. Request a quote, schedule maintenance, or fly into KCPT — we operate out of three hangars on the field.",
  alternates: {
    canonical: "https://ppa.aero/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] flex items-end overflow-hidden">
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

            {/* Email */}
            <div className="bg-ppa-white p-8 lg:p-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass">
                Email
              </span>
              <div className="mt-4 space-y-4">
                {COMPANY.founders.map((founder) => (
                  <div key={founder.email}>
                    <p className="text-sm text-ppa-dark">
                      {founder.name}, {founder.title}
                    </p>
                    <a
                      href={`mailto:${founder.email}`}
                      className="text-sm text-ppa-gray hover:text-ppa-brass transition-colors"
                    >
                      {founder.email}
                    </a>
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
                <p className="text-ppa-brass mt-2">{COMPANY.address.airport}</p>
              </div>
            </div>
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
              <form className="space-y-5">
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

                <button
                  type="submit"
                  className="px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            <div className="relative overflow-hidden min-h-[400px]">
              <Image
                src="/images/Winglet-Install---James.jpg"
                alt="PPA technician James performing detailed winglet work"
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
