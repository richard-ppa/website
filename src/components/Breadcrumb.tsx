import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href: string };

interface BreadcrumbProps {
  /** Crumbs after Home (Home is auto-prepended). Last crumb is the current page. */
  crumbs: Crumb[];
  /** "dark" = light text on dark hero background; "light" = dark text on light bg */
  variant?: "dark" | "light";
  /** Override className on the wrapper (margin, etc.) */
  className?: string;
}

const BASE = "https://ppa.aero";

export function Breadcrumb({ crumbs, variant = "dark", className = "mb-6" }: BreadcrumbProps) {
  const allCrumbs: Crumb[] = [{ label: "Home", href: "/" }, ...crumbs];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allCrumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${BASE}${c.href}`,
    })),
  };

  const isDark = variant === "dark";
  const baseText = isDark ? "text-ppa-light/60" : "text-ppa-muted";
  const sepText = isDark ? "text-ppa-light/30" : "text-ppa-muted/40";
  const linkHover = isDark ? "hover:text-ppa-brass-bright" : "hover:text-ppa-brass";
  const currentText = isDark ? "text-ppa-light/85" : "text-ppa-dark";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className={`flex flex-wrap items-center gap-2 text-[11px] tracking-[0.15em] uppercase ${baseText}`}>
          {allCrumbs.map((crumb, i) => {
            const isLast = i === allCrumbs.length - 1;
            return (
              <Fragment key={crumb.href + i}>
                {i > 0 && (
                  <li aria-hidden="true" className={sepText}>
                    /
                  </li>
                )}
                <li>
                  {isLast ? (
                    <span className={currentText} aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className={`${linkHover} transition-colors`}>
                      {crumb.label}
                    </Link>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
