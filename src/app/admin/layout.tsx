import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard — Plane Place Aviation",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/traffic", label: "Traffic" },
  { href: "/admin/operations", label: "Operations" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ppa-light">
      {/* Admin top bar — separate from public site nav */}
      <header className="bg-ppa-black text-ppa-white border-b border-ppa-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link
                href="/admin"
                className="font-display text-lg tracking-tight text-ppa-white"
              >
                PPA Admin
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 text-[12px] font-medium tracking-wide text-ppa-light/70 hover:text-ppa-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-[11px] uppercase tracking-[0.15em] text-ppa-light/60 hover:text-ppa-brass-bright transition-colors"
              >
                ← Public site
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main>{children}</main>

      <footer className="border-t border-ppa-border mt-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 text-[11px] uppercase tracking-[0.15em] text-ppa-muted">
          Protected by Cloudflare Access · Internal use only
        </div>
      </footer>
    </div>
  );
}
