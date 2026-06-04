import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TrackConversion } from "@/components/TrackConversion";

export const metadata: Metadata = {
  title: "Thank You — Application Received",
  description:
    "Thanks for your application to Plane Place Aviation. We'll review your resume and come back to you in a couple of business days.",
  alternates: {
    canonical: "https://ppa.aero/careers/thank-you",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CareersThankYouPage() {
  return (
    <>
      <TrackConversion event="generate_lead" type="career" />
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hangar-Hawker-v2.jpg"
            alt="Plane Place Aviation hangar in Cleburne, TX"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/55 to-ppa-black/20" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16">
          <Breadcrumb
            crumbs={[
              { label: "Careers", href: "/careers" },
              { label: "Thank You", href: "/careers/thank-you" },
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
            Your application is in. We&apos;ll review your resume and come
            back to you in a couple of business days.
          </p>
        </div>
      </section>

      {/* What happens next */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="space-y-8 text-lg leading-[1.75] font-light text-ppa-dark">
            <p>
              A member of the Plane Place Aviation team will review your
              resume and reach out via email or phone. Most candidates move
              from first email to offer in two to three weeks: a phone
              conversation, an in-person visit to the hangar, and a follow-up
              call to align on start date and scope.
            </p>
            <p>
              If you have something to add — a portfolio, references, or a
              note about timing — reply to the confirmation email when it
              arrives, or call us at{" "}
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="text-ppa-brass-dark underline decoration-ppa-brass/40 underline-offset-4 hover:decoration-ppa-brass-dark transition-colors"
              >
                {COMPANY.phone}
              </a>
              .
            </p>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-4">
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-all"
            >
              Meet the Team
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
