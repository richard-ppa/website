import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TrackConversion } from "@/components/TrackConversion";

export const metadata: Metadata = {
  title: "Thank You — Message Received",
  description:
    "Thanks for reaching out. We'll respond within one business day. For AOG emergencies, call us directly.",
  alternates: {
    canonical: "https://ppa.aero/contact/thank-you",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ContactThankYouPage() {
  return (
    <>
      <TrackConversion event="generate_lead" type="contact" />
      <section className="relative h-[55vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/about-us.jpg"
            alt="Plane Place Aviation team and facility"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/55 to-ppa-black/20" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <Breadcrumb
            crumbs={[
              { label: "Contact", href: "/contact" },
              { label: "Thank You", href: "/contact/thank-you" },
            ]}
            variant="dark"
          />

          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Received
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9]">
            Thank you.
          </h1>
          <p className="mt-4 text-lg text-ppa-light/80 max-w-xl font-light">
            Your message is in. We&apos;ll get back to you within one business day.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="space-y-8 text-lg leading-[1.75] font-light text-ppa-dark">
            <p>
              A member of the Plane Place Aviation team will read your
              message and reach out by email or phone — typically within
              one business day.
            </p>
            <p>
              For anything urgent — particularly an AOG situation — please
              call us directly at{" "}
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="text-ppa-brass-dark underline decoration-ppa-brass/40 underline-offset-4 hover:decoration-ppa-brass-dark transition-colors"
              >
                {COMPANY.phone}
              </a>
              . Our line is staffed 24/7 for AOG response across Texas and
              Oklahoma.
            </p>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-4">
            <Link
              href="/capabilities"
              className="inline-flex items-center justify-center px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-all"
            >
              Explore Capabilities
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-dark border border-ppa-border hover:bg-ppa-light transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
