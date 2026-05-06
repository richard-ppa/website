import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/admin/PageHeader";

const GSC_URL = "https://search.google.com/search-console?resource_id=sc-domain:ppa.aero";
const GSC_GENERIC_URL = "https://search.google.com/search-console";

const GSC_FEATURES = [
  {
    title: "Search performance",
    desc: "Clicks, impressions, CTR, and average position over time. Filter by query, page, country, device, and search appearance.",
  },
  {
    title: "Keyword + page tracking",
    desc: "See exactly which queries drive traffic and which pages they land on. Critical for the migration monitoring window.",
  },
  {
    title: "Coverage + indexing",
    desc: "Catch indexing issues before they hurt traffic — soft 404s, redirect errors, blocked pages, validation failures.",
  },
  {
    title: "Core Web Vitals",
    desc: "Real-user performance signals (LCP, INP, CLS) on mobile and desktop. Google uses these for ranking.",
  },
  {
    title: "Sitemaps + URL Inspection",
    desc: "Submit sitemaps, request indexing on specific URLs, see when Google last crawled a page.",
  },
  {
    title: "Manual actions + security",
    desc: "Spam penalties, hacked content alerts, mobile usability issues — all surfaced here first.",
  },
];

export default function AdminSeoPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Search Console"
        title="Organic search performance"
        description="SEO data lives in Google Search Console — open it directly for full keyword tracking, indexing health, and Core Web Vitals."
      />

      {/* Primary CTA card */}
      <div className="bg-ppa-white border border-ppa-border p-8 lg:p-10 mb-10">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass mb-2">
              ppa.aero · Verified property
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-ppa-black mb-3">
              Open Google Search Console
            </h2>
            <p className="text-sm text-ppa-gray font-light leading-relaxed max-w-2xl">
              Search Console is the source of truth for all organic search data
              on ppa.aero. We deliberately link out instead of mirroring the
              data here — GSC&apos;s native interface is dramatically more
              capable, always up to date, and one click away.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
            <Link
              href={GSC_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors whitespace-nowrap"
            >
              Open Search Console
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href={GSC_GENERIC_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-dark border border-ppa-border hover:bg-ppa-light transition-colors whitespace-nowrap"
            >
              All properties
            </Link>
          </div>
        </div>
      </div>

      {/* What you'll find in GSC */}
      <h3 className="font-display text-xl text-ppa-black mb-4">What's in Search Console</h3>
      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        {GSC_FEATURES.map((f) => (
          <div key={f.title} className="bg-ppa-white border border-ppa-border p-5">
            <div className="font-display text-base text-ppa-black mb-1.5">{f.title}</div>
            <p className="text-sm text-ppa-gray font-light leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick reference / migration notes */}
      <div className="bg-ppa-light border border-ppa-border p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass mb-2">
          Reference
        </div>
        <ul className="text-sm text-ppa-dark space-y-1.5 font-light">
          <li>
            <span className="text-ppa-muted">Property type:</span>{" "}
            <code className="text-xs bg-ppa-white px-1.5 py-0.5 border border-ppa-border">
              sc-domain:ppa.aero
            </code>
          </li>
          <li>
            <span className="text-ppa-muted">Verified Owner:</span> richard@ppa.aero
          </li>
          <li>
            <span className="text-ppa-muted">Old property (still active during migration):</span>{" "}
            <Link
              href="https://search.google.com/search-console?resource_id=sc-domain:planeplaceaviation.com"
              target="_blank"
              rel="noopener"
              className="text-ppa-brass-dark underline decoration-ppa-brass/40 underline-offset-4 hover:decoration-ppa-brass-dark transition-colors"
            >
              planeplaceaviation.com
            </Link>{" "}
            <span className="text-ppa-muted">— monitor for traffic decline as ppa.aero indexes</span>
          </li>
        </ul>
      </div>
    </PageContainer>
  );
}
