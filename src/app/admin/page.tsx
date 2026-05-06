import Link from "next/link";

const SECTIONS = [
  {
    href: "/admin/leads",
    label: "Leads",
    desc: "Quote and contact form submissions, trends, recent records.",
    metric: "Lead pipeline",
  },
  {
    href: "/admin/seo",
    label: "SEO",
    desc: "Search Console keyword data, top pages, position tracking.",
    metric: "Organic search",
  },
  {
    href: "/admin/traffic",
    label: "Traffic",
    desc: "Visitor counts, top pages, sources, geographic distribution.",
    metric: "Site analytics",
  },
  {
    href: "/admin/operations",
    label: "Operations",
    desc: "Email delivery rate, file storage, recent errors and rejections.",
    metric: "System health",
  },
];

export default function AdminHome() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <div className="mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass mb-3">
          Dashboard
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-ppa-black leading-[0.95]">
          Plane Place Aviation Admin
        </h1>
        <p className="mt-4 text-ppa-gray font-light max-w-2xl">
          Internal management dashboard for monitoring leads, SEO performance,
          site traffic, and operational health.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group bg-ppa-white border border-ppa-border hover:border-ppa-brass/50 transition-colors p-6 lg:p-8"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass mb-3">
              {s.metric}
            </div>
            <h2 className="font-display text-2xl text-ppa-black mb-2 group-hover:text-ppa-brass-dark transition-colors">
              {s.label}
            </h2>
            <p className="text-sm text-ppa-gray font-light leading-relaxed">
              {s.desc}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-brass group-hover:translate-x-1 transition-transform">
              Open
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
