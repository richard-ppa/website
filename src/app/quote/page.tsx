import type { Metadata } from "next";
import Image from "next/image";
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
      <section className="relative h-[45vh] min-h-[350px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/PPA-13.jpg"
            alt="PPA hangar operations"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/50 to-ppa-black/20" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Get Started
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9]">
            Request a Quote
          </h1>
          <p className="mt-4 text-lg text-ppa-light/70 max-w-xl font-light">
            Tell us about your aircraft and what you need. We&apos;ll respond
            with a detailed, transparent quote — no surprises.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <form className="space-y-8">
            {/* Contact info */}
            <div>
              <h2 className="font-display text-2xl text-ppa-white mb-6">
                Your Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="form-label">Name *</label>
                  <input type="text" id="name" name="name" required className="form-input" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="company" className="form-label">Company</label>
                  <input type="text" id="company" name="company" className="form-input" placeholder="Company name" />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input type="email" id="email" name="email" required className="form-input" placeholder="you@company.com" />
                </div>
                <div>
                  <label htmlFor="phone" className="form-label">Phone *</label>
                  <input type="tel" id="phone" name="phone" required className="form-input" placeholder="(555) 123-4567" />
                </div>
              </div>
            </div>

            <div className="section-divider" />

            {/* Aircraft info */}
            <div>
              <h2 className="font-display text-2xl text-ppa-white mb-6">
                Aircraft Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="airframe" className="form-label">Aircraft Type *</label>
                  <select id="airframe" name="airframe" required className="form-input">
                    <option value="">Select airframe...</option>
                    {ALL_MODELS.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                    <option value="other">Other / Not sure</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="nnumber" className="form-label">N-Number</label>
                  <input type="text" id="nnumber" name="nnumber" className="form-input" placeholder="N12345" />
                </div>
              </div>
            </div>

            {/* Service needed */}
            <div>
              <label htmlFor="service" className="form-label">Service Needed *</label>
              <select id="service" name="service" required className="form-input">
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
              <label htmlFor="timeline" className="form-label">Timeline</label>
              <select id="timeline" name="timeline" className="form-input">
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
              <label htmlFor="details" className="form-label">Additional Details</label>
              <textarea
                id="details"
                name="details"
                rows={5}
                className="form-input resize-none"
                placeholder="Tell us more — current location, specific work items, known squawks, etc."
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-black bg-ppa-brass hover:bg-ppa-brass-light transition-colors"
            >
              Submit Quote Request
            </button>

            <p className="text-xs text-ppa-muted text-center">
              We typically respond within one business day. For AOG
              emergencies, call us directly.
            </p>
          </form>

          {/* AOG callout */}
          <div className="mt-12 text-center border-t border-ppa-border pt-10">
            <p className="text-ppa-muted mb-3 text-sm">Aircraft on the ground?</p>
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="inline-flex items-center gap-3 font-display text-3xl text-ppa-brass hover:text-ppa-brass-light transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-ppa-gold animate-pulse" />
              Call {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
