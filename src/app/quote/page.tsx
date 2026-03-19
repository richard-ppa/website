import type { Metadata } from "next";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { COMPANY, AIRFRAMES } from "@/lib/constants";

const ALL_MODELS = Object.values(AIRFRAMES).flatMap((airframe) =>
  airframe.models.map((model) => `${airframe.name} ${model}`)
);

export const metadata: Metadata = {
  title: "Request a Quote — Hawker, Citation & Challenger Maintenance",
  description:
    "Get a maintenance quote from Plane Place Aviation. Transparent pricing for Hawker, Citation, and Challenger inspections, repairs, and pre-purchase evaluations.",
};

export default function QuotePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-44 pb-12 relative">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-ppa-accent text-sm font-semibold uppercase tracking-wider mb-4">
            Get Started
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Request a Quote
          </h1>
          <p className="text-lg text-ppa-gray-light max-w-2xl mx-auto">
            Tell us about your aircraft and what you need. We&apos;ll respond
            with a detailed, transparent quote — no surprises.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-8 sm:p-12">
            <form className="space-y-6">
              {/* Contact info */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4">
                  Your Information
                </h2>
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
                      className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
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
                      className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                      placeholder="Company name"
                    />
                  </div>
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
                      className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-ppa-gray-light mb-2"
                    >
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="section-divider" />

              {/* Aircraft info */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4">
                  Aircraft Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="airframe"
                      className="block text-sm font-medium text-ppa-gray-light mb-2"
                    >
                      Aircraft Type *
                    </label>
                    <select
                      id="airframe"
                      name="airframe"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                    >
                      <option value="">Select airframe...</option>
                      {ALL_MODELS.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                      <option value="other">Other / Not sure</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="nnumber"
                      className="block text-sm font-medium text-ppa-gray-light mb-2"
                    >
                      N-Number
                    </label>
                    <input
                      type="text"
                      id="nnumber"
                      name="nnumber"
                      className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                      placeholder="N12345"
                    />
                  </div>
                </div>
              </div>

              {/* Service needed */}
              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-ppa-gray-light mb-2"
                >
                  Service Needed *
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                >
                  <option value="">Select service...</option>
                  <option value="scheduled">Scheduled Maintenance / Phase Inspection</option>
                  <option value="ppi">Pre-Purchase Inspection</option>
                  <option value="aog">AOG / Emergency Service</option>
                  <option value="structural">Structural Repair</option>
                  <option value="avionics">Avionics</option>
                  <option value="management">Maintenance Management</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label
                  htmlFor="timeline"
                  className="block text-sm font-medium text-ppa-gray-light mb-2"
                >
                  Timeline
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors"
                >
                  <option value="">When do you need service?</option>
                  <option value="asap">ASAP / AOG</option>
                  <option value="30days">Within 30 days</option>
                  <option value="60days">Within 60 days</option>
                  <option value="90days">Within 90 days</option>
                  <option value="planning">Just planning ahead</option>
                </select>
              </div>

              {/* Details */}
              <div>
                <label
                  htmlFor="details"
                  className="block text-sm font-medium text-ppa-gray-light mb-2"
                >
                  Additional Details
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-ppa-navy border border-white/10 text-white placeholder:text-ppa-steel focus:outline-none focus:border-ppa-accent/50 focus:ring-1 focus:ring-ppa-accent/50 transition-colors resize-none"
                  placeholder="Tell us more — current location, specific work items, known squawks, etc."
                />
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 text-base font-semibold text-white bg-ppa-accent hover:bg-ppa-accent-bright rounded-xl transition-colors shadow-lg shadow-ppa-accent/20"
              >
                Submit Quote Request
              </button>

              <p className="text-xs text-ppa-gray text-center">
                We typically respond within one business day. For AOG
                emergencies, call us directly.
              </p>
            </form>
          </div>

          {/* AOG callout */}
          <div className="mt-8 text-center">
            <p className="text-ppa-gray mb-2">Aircraft on the ground?</p>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="inline-flex items-center gap-2 text-lg font-bold text-ppa-gold hover:text-ppa-gold-light transition-colors"
            >
              <PhoneIcon className="h-5 w-5" />
              Call {COMPANY.phone} now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
