import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <section className="py-32 lg:py-48">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass mb-6">
          404 — Page Not Found
        </p>
        <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-ppa-white leading-[0.9] mb-6">
          Nothing Here.
        </h1>
        <p className="text-lg text-ppa-gray font-light max-w-md mx-auto mb-12">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-black bg-ppa-brass hover:bg-ppa-brass-light transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-brass border border-ppa-brass/40 hover:bg-ppa-brass/10 transition-all"
          >
            Contact Us
          </Link>
        </div>
        <div className="mt-16 grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
          <Link href="/services" className="group p-5 border border-ppa-border hover:border-ppa-brass/30 transition-colors">
            <p className="text-ppa-brass text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">Services</p>
            <p className="text-sm text-ppa-muted group-hover:text-ppa-light transition-colors">Maintenance, inspections, AOG response</p>
          </Link>
          <Link href="/aircraft/hawker" className="group p-5 border border-ppa-border hover:border-ppa-brass/30 transition-colors">
            <p className="text-ppa-brass text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">Aircraft</p>
            <p className="text-sm text-ppa-muted group-hover:text-ppa-light transition-colors">Hawker, Citation, Challenger</p>
          </Link>
          <Link href="/quote" className="group p-5 border border-ppa-border hover:border-ppa-brass/30 transition-colors">
            <p className="text-ppa-brass text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">Quote</p>
            <p className="text-sm text-ppa-muted group-hover:text-ppa-light transition-colors">Request transparent pricing</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
