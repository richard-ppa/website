import type { Metadata } from "next";
import Image from "next/image";
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact — AOG Hotline, Quote Requests & Location",
  description:
    "Contact Plane Place Aviation in Cleburne, Texas. AOG hotline: (817) 768-8884. Request a quote, schedule maintenance, or fly into KCPT — we operate out of three hangars on the field.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-44 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Winglet-Install-05.jpg"
            alt="PPA technician working on aircraft winglet with hangar door and runway visible"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-ppa-navy/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-ppa-navy/90 via-ppa-navy/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-4">
              Contact Us
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Let&apos;s talk about{" "}
              <span className="text-ppa-gray">your aircraft.</span>
            </h1>
            <p className="text-lg text-ppa-gray-light leading-relaxed">
              Whether you need a scheduled inspection, a pre-purchase evaluation,
              or AOG support right now — reach out directly. The founders answer
              the phone.
            </p>
          </div>
        </div>
      </section>

      {/* Contact grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            {/* AOG Hotline */}
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="glass-card rounded-2xl p-8 group hover:-translate-y-1 transition-all duration-300 hover:border-ppa-gold/30"
            >
              <div className="h-12 w-12 rounded-xl bg-ppa-gold/10 flex items-center justify-center mb-5">
                <PhoneIcon className="h-6 w-6 text-ppa-gold" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">
                AOG Hotline
              </h2>
              <p className="text-2xl font-bold text-ppa-gold group-hover:text-ppa-gold-light transition-colors">
                {COMPANY.phone}
              </p>
              <p className="text-sm text-ppa-gray mt-2">
                Aircraft down? Call us now. TX & OK mobile coverage.
              </p>
            </a>

            {/* Email */}
            <div className="glass-card rounded-2xl p-8">
              <div className="h-12 w-12 rounded-xl bg-ppa-accent/10 flex items-center justify-center mb-5">
                <EnvelopeIcon className="h-6 w-6 text-ppa-accent" />
              </div>
              <h2 className="text-lg font-bold text-white mb-3">Email</h2>
              {COMPANY.founders.map((founder) => (
                <div key={founder.email} className="mb-2">
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

            {/* Location */}
            <div className="glass-card rounded-2xl p-8">
              <div className="h-12 w-12 rounded-xl bg-ppa-accent/10 flex items-center justify-center mb-5">
                <MapPinIcon className="h-6 w-6 text-ppa-accent" />
              </div>
              <h2 className="text-lg font-bold text-white mb-3">Visit Us</h2>
              <p className="text-sm text-ppa-gray-light">
                {COMPANY.address.street}
              </p>
              <p className="text-sm text-ppa-gray-light">
                {COMPANY.address.city}, {COMPANY.address.state}{" "}
                {COMPANY.address.zip}
              </p>
              <p className="text-sm text-ppa-accent mt-2">
                {COMPANY.address.airport}
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Send us a message
              </h2>
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-ppa-gray-light mb-2"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-ppa-slate/50 border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-ppa-gray-light mb-2"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="w-full px-4 py-3 rounded-xl bg-ppa-slate/50 border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-ppa-gray-light mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-ppa-slate/50 border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-ppa-gray-light mb-2"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 rounded-xl bg-ppa-slate/50 border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-ppa-gray-light mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-ppa-slate/50 border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors resize-none"
                    placeholder="Tell us about your aircraft and what you need..."
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 text-sm font-semibold text-white bg-ppa-accent hover:bg-ppa-accent-bright rounded-xl transition-colors shadow-lg shadow-ppa-accent/20"
                >
                  Send Message
                </button>
              </form>
            </div>

            <div className="aspect-square lg:aspect-auto rounded-2xl overflow-hidden relative min-h-[400px]">
              <Image
                src="/images/Winglet-Install---James.jpg"
                alt="PPA technician James performing detailed winglet work in the Cleburne hangar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ppa-navy/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
