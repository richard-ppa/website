import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { COMPANY, CAREERS } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormErrorBanner } from "@/components/FormErrorBanner";
import { Turnstile } from "@/components/Turnstile";

const TURNSTILE_SITE_KEY = "0x4AAAAAADJznk9rZYC4F2WZ";

export const metadata: Metadata = {
  title: "Careers — Join the PPA Floor in Cleburne, TX",
  description:
    "Hiring continuously for technicians, inspection & QC, avionics, service advisors, parts, and ops at Plane Place Aviation — a specialist Hawker, Citation, and Challenger MRO in Cleburne, Texas.",
  alternates: {
    canonical: "https://ppa.aero/careers",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ppa.aero/careers",
    siteName: "Plane Place Aviation",
    title: "Careers — Join the PPA Floor in Cleburne, TX",
    description:
      "Hiring continuously for technicians, inspection & QC, avionics, service advisors, parts, and ops at Plane Place Aviation — a specialist Hawker, Citation, and Challenger MRO in Cleburne, Texas.",
    images: [
      {
        url: "https://ppa.aero/images/hangar-Hawker-v2.jpg",
        alt: "Plane Place Aviation hangar in Cleburne, TX with a Hawker on the floor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers — Join the PPA Floor in Cleburne, TX",
    description:
      "Hiring continuously for technicians, inspection & QC, avionics, service advisors, parts, and ops at Plane Place Aviation.",
    images: ["https://ppa.aero/images/hangar-Hawker-v2.jpg"],
  },
};

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Do I need an A&P certificate?",
    a: "For most floor roles, yes. Inspection and QC also need IA or company authorization. The non-mechanic roles — service advisors, parts, ops, admin — don't strictly require one, but across the board we prefer candidates who hold an A&P.",
  },
  {
    q: "Do you offer relocation assistance?",
    a: "Case by case. Cleburne housing runs well below what you'd pay around DFW, so most candidates don't end up needing a formal relocation package to make the move work. If you're the right fit we'll talk through specifics.",
  },
  {
    q: "What does a typical schedule look like?",
    a: "Pretty predictable. Monday through Friday, day shift. Weekend or overtime work shows up when we have an AOG call or a heavy event nearing its turn date, but we don't run a rotating shift.",
  },
  {
    q: "Do you sponsor visas or transfers?",
    a: "No. All roles need US work authorization at the time of hire.",
  },
  {
    q: "How long does the hiring process take?",
    a: "About two to three weeks from first email to offer for most people. A phone call, a visit to the hangar, and a follow-up call to nail down start date and scope.",
  },
  {
    q: "What's the culture like?",
    a: "Founder-led, with no corporate layer in between. Tristan and Travis are on the floor every day. We hire for craft and judgment, expect you to call out what you actually find on the aircraft, and treat the records the same way.",
  },
];

const PERKS: { label: string; value: string }[] = [
  { label: "Pay", value: "Competitive, Paid Bi-Weekly" },
  { label: "Coverage", value: "Medical (Employee 100% Coverage), Dental, Vision" },
  { label: "Retirement", value: "401(k) With Match" },
  { label: "Time off", value: "PTO + Paid Holidays" },
];

const WHY_BLOCKS: { title: string; body: string; icon: "shield" | "clock" | "lines" | "diamond" }[] = [
  {
    icon: "shield",
    title: "Three airframes, that's it",
    body: `Repair Station ${COMPANY.faaCert}. Hawkers, Citations, Challengers. Nobody's bouncing to a King Air on Monday and a Gulfstream on Friday.`,
  },
  {
    icon: "clock",
    title: "Day shift, no rotation",
    body: "Monday through Friday, day shift. AOG calls and heavy events bring overtime now and then, but the regular schedule doesn't move around on you.",
  },
  {
    icon: "lines",
    title: "Records are part of the work",
    body: "We don't treat paperwork like something that happens after the wrench goes down. It's part of what the customer is paying for, and we write it that way.",
  },
  {
    icon: "diamond",
    title: "Cleburne, not Addison",
    body: "Thirty minutes from DFW, with a cost of living that's not Addison's. The math works for techs as much as it does for customers.",
  },
];

const careersJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://ppa.aero/careers#webpage",
      url: "https://ppa.aero/careers",
      name: "Careers — Plane Place Aviation",
      isPartOf: { "@id": "https://ppa.aero/#website" },
      about: { "@id": "https://ppa.aero/#organization" },
      inLanguage: "en-US",
    },
    {
      "@type": "FAQPage",
      "@id": "https://ppa.aero/careers#faq",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

function WhyIcon({ name }: { name: "shield" | "clock" | "lines" | "diamond" }) {
  // Hand-rolled stroke icons in the brass accent — kept inline so the page
  // doesn't pull a new icon dependency for four glyphs.
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "shield")
    return (
      <svg {...common}>
        <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z" />
      </svg>
    );
  if (name === "clock")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  if (name === "lines")
    return (
      <svg {...common}>
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 3l9 9-9 9-9-9 9-9z" />
    </svg>
  );
}

export default function CareersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(careersJsonLd) }}
      />

      {/* 1. Hero — full-bleed dark image. Vertically-centered content group
          holds the breadcrumb, eyebrow, H1+lede, and the 3-up stat row
          stacked below them. The perks ribbon is pinned to the bottom of
          the hero (inverted colors for dark canvas). */}
      <section className="relative h-[100dvh] min-h-[700px] lg:min-h-[860px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hangar-Hawker-v2.jpg"
            alt="Plane Place Aviation hangar in Cleburne with a Hawker on the floor"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/50 to-ppa-black/10" />
        </div>

        <div className="relative h-full w-full max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col pt-28 lg:pt-32 pb-10 lg:pb-12">
          {/* Vertically centered content (Breadcrumb + eyebrow + H1+lede + stats) */}
          <div className="flex-1 flex flex-col justify-center">
            <Breadcrumb crumbs={[{ label: "Careers", href: "/careers" }]} variant="dark" />

            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-ppa-brass-bright" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
                Careers at PPA
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-12">
              {/* Left column: H1 + 3-up stats stacked directly below it */}
              <div className="shrink-0">
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.9]">
                  We&apos;re hiring year-round.
                </h1>

                {/* 3-up stats — directly under the H1 */}
                <div className="mt-8 lg:mt-10 border-t border-white/15 pt-5 lg:pt-6 grid grid-cols-3 gap-4 lg:gap-8">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ppa-brass-bright mb-1.5">
                      Team
                    </div>
                    {/* TODO(content): verify team headcount with marketing */}
                    <div className="font-display text-2xl lg:text-3xl text-ppa-white leading-none">
                      {CAREERS.stats.teamSize}
                    </div>
                    <div className="text-xs lg:text-sm text-ppa-light/70 mt-1.5">
                      Technicians &amp; staff
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ppa-brass-bright mb-1.5">
                      Tenure
                    </div>
                    {/* TODO(content): verify median tenure with marketing */}
                    <div className="font-display text-2xl lg:text-3xl text-ppa-white leading-none">
                      {CAREERS.stats.medianTenure}
                    </div>
                    <div className="text-xs lg:text-sm text-ppa-light/70 mt-1.5">
                      Median for full-time techs
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ppa-brass-bright mb-1.5">
                      Run by
                    </div>
                    {/* TODO(content): verify with marketing */}
                    <div className="font-display text-2xl lg:text-3xl text-ppa-white leading-none">
                      {CAREERS.stats.posture}
                    </div>
                    <div className="text-xs lg:text-sm text-ppa-light/70 mt-1.5">
                      Tristan Noe &amp; Travis Roberson
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: lede */}
              <div className="lg:border-l-2 lg:border-ppa-brass-bright lg:pl-12 flex items-center">
                <p className="text-lg lg:text-xl text-ppa-light/85 font-light leading-relaxed max-w-xl">
                  We&apos;re a Part 145 repair station in Cleburne. We only
                  work on Hawkers, Citations, and Challengers, and we&apos;re
                  hiring across the floor and the office. If those three
                  airframes are where you&apos;ve put your reps, send us a
                  resume below.
                </p>
              </div>
            </div>
          </div>

          {/* Perks ribbon — pinned to the bottom of the hero. Brass-bright
              pipes on dark; same wrapping rule as the original ribbon
              (cols 1↔2 at mobile, all-adjacent at desktop). */}
          <div className="border-t border-white/15 pt-6 lg:pt-8 grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0">
            {PERKS.map((perk, i) => (
              <div
                key={perk.label}
                className={[
                  "px-4 md:px-6 lg:px-8",
                  i % 2 === 1 ? "border-l border-ppa-brass-bright" : "",
                  i === 2 ? "md:border-l md:border-ppa-brass-bright" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ppa-brass-bright mb-2">
                  {perk.label}
                </div>
                <div className="font-display text-base lg:text-lg text-ppa-white leading-tight">
                  {perk.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Why work here — prose spans the full container width;
          4 blocks sit below in a row, left-aligned with the text. */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-ppa-brass" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
              Why work here
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-black leading-none mb-10">
            What it&apos;s like here.
          </h2>
          <div className="space-y-5 text-ppa-gray font-light leading-relaxed">
            <p>
              <Link
                href="/about"
                className="text-ppa-black underline decoration-ppa-brass underline-offset-4 hover:text-ppa-brass transition-colors"
              >
                Tristan Noe and Travis Roberson
              </Link>{" "}
              started PPA in 2022. They&apos;d both spent years on bigger shop
              floors and had a pretty long list of things they wanted to do
              differently. The shop is basically that list.
            </p>
            <p>
              Both of them are still on the floor every day. If you have a
              scope question they&apos;re who you ask, and if something
              changes on the work order they&apos;re the ones calling the
              customer. The records get treated like part of the aircraft,
              because anyone who&apos;s bought a used jet knows they
              basically are.
            </p>
            <p>
              Most of what we hire for isn&apos;t on a resume. It&apos;s
              whether you care about the work, whether you&apos;ll tell us
              straight when something doesn&apos;t look right, and whether you
              actually want to specialize on three airframes for a while
              instead of jumping around.
            </p>
          </div>

          {/* 4 why blocks — 4-across at desktop, 2 at tablet, stacked on mobile.
              Shares the same container as the text above so left/right edges line up. */}
          <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_BLOCKS.map((block) => (
              <div
                key={block.title}
                className="border border-ppa-border bg-ppa-white p-7"
              >
                <div className="h-11 w-11 border border-ppa-border flex items-center justify-center text-ppa-brass mb-5">
                  <WhyIcon name={block.icon} />
                </div>
                <h3 className="font-display text-[22px] text-ppa-black leading-tight mb-2">
                  {block.title}
                </h3>
                <p className="text-sm text-ppa-gray font-light leading-relaxed">
                  {block.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Application form — dedicated section, anchored at #apply */}
      <section
        id="apply"
        className="scroll-mt-24 bg-ppa-white py-24 lg:py-32 border-y border-ppa-border"
      >
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
            {/* Header column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  Apply
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-black leading-none mb-8">
                Send a Resume.
              </h2>
              <p className="text-ppa-gray font-light leading-relaxed mb-6 max-w-md">
                Tell us where you sit and attach your Resume. A quick note
                about the airframe you&apos;ve worked most goes a long way.
                We usually get back to people in a couple of business days.
              </p>
              <div className="mt-8 space-y-3 text-sm text-ppa-gray">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ppa-muted shrink-0 w-16">
                    Email
                  </span>
                  <a
                    href={CAREERS.applyHref}
                    className="text-ppa-brass hover:text-ppa-brass-dark transition-colors break-all"
                  >
                    {CAREERS.email}
                  </a>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ppa-muted shrink-0 w-16">
                    Phone
                  </span>
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="text-ppa-black hover:text-ppa-brass transition-colors"
                  >
                    {COMPANY.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Form column */}
            <div>
              <FormErrorBanner />
              <form
                action="/careers"
                method="POST"
                encType="multipart/form-data"
                className="space-y-7"
              >
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] w-px h-px opacity-0"
                />

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="career-name" className="form-label">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="career-name"
                      name="name"
                      required
                      className="form-input"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="career-phone" className="form-label">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="career-phone"
                      name="phone"
                      className="form-input"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="career-email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="career-email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="career-role" className="form-label">
                      Role of interest
                    </label>
                    <select
                      id="career-role"
                      name="role"
                      className="form-input"
                      defaultValue=""
                    >
                      <option value="">Select a role…</option>
                      <option value="technician">Airframe Technician</option>
                      <option value="inspection">Inspection &amp; QC</option>
                      <option value="avionics">Avionics</option>
                      <option value="advisor">Service Advisor</option>
                      <option value="parts">Parts &amp; Logistics</option>
                      <option value="ops">Ops &amp; Admin</option>
                      <option value="other">Not sure / Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="career-airframe" className="form-label">
                      Airframe focus
                    </label>
                    <select
                      id="career-airframe"
                      name="airframe"
                      className="form-input"
                      defaultValue=""
                    >
                      <option value="">Select airframe…</option>
                      <option value="hawker">Hawker</option>
                      <option value="citation">Citation</option>
                      <option value="challenger">Challenger</option>
                      <option value="multiple">Multiple</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="career-note" className="form-label">
                    Note
                  </label>
                  <textarea
                    id="career-note"
                    name="note"
                    rows={5}
                    maxLength={2000}
                    className="form-input resize-none"
                    placeholder="Optional. Tell us about the airframes you've worked, certifications you hold, or what you're looking for."
                  />
                </div>

                <div>
                  <label htmlFor="career-resume" className="form-label">
                    Resume *
                  </label>
                  <input
                    type="file"
                    id="career-resume"
                    name="resume"
                    required
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="block w-full text-sm text-ppa-dark file:mr-4 file:px-5 file:py-2.5 file:border-0 file:bg-ppa-light file:text-ppa-dark file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.1em] hover:file:bg-ppa-border/50 cursor-pointer border border-ppa-border"
                  />
                  <p className="mt-2 text-xs text-ppa-muted">
                    PDF or Word (.pdf, .doc, .docx) — up to 10MB.
                  </p>
                </div>

                <div>
                  <label htmlFor="career-supporting" className="form-label">
                    Supporting document
                  </label>
                  <input
                    type="file"
                    id="career-supporting"
                    name="supporting"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="block w-full text-sm text-ppa-dark file:mr-4 file:px-5 file:py-2.5 file:border-0 file:bg-ppa-light file:text-ppa-dark file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.1em] hover:file:bg-ppa-border/50 cursor-pointer border border-ppa-border"
                  />
                  <p className="mt-2 text-xs text-ppa-muted">
                    Optional — cover letter, portfolio, or references. PDF or
                    Word, up to 10MB. All files are virus-scanned before
                    delivery.
                  </p>
                </div>

                <Turnstile siteKey={TURNSTILE_SITE_KEY} />

                <button
                  type="submit"
                  className="w-full py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-ppa-brass"
                >
                  Submit Application
                </button>

                <p className="text-xs text-ppa-muted text-center">
                  We usually get back to people within a couple of business days.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Founders quote band — full-bleed image with cinematic scrim
          (no solid black panel; matches the home page "What We Do" pattern) */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/PPA-22.jpg"
            alt="Plane Place Aviation technicians on the hangar floor in Cleburne"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ppa-black/85" />
        </div>
        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-ppa-brass-bright" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
              From the founders
            </span>
          </div>
          <blockquote className="font-display text-3xl sm:text-4xl lg:text-[44px] text-ppa-white leading-[1.15] max-w-4xl">
            We built the shop we wanted to work at, back when we were the
            ones taking those customer calls. That hasn&apos;t changed.{" "}
            <span className="text-ppa-brass-bright">
              It&apos;s what we look for in every hire too.
            </span>
          </blockquote>
          <div className="mt-10 flex items-center gap-4">
            <span className="h-px w-10 bg-ppa-brass-bright" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-light/85">
              Tristan Noe &amp; Travis Roberson — Co-Founders
            </span>
          </div>
        </div>
      </section>

      {/* 5. FAQ accordion */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-ppa-brass" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                FAQ
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-ppa-black leading-none mb-8">
              The questions we get.
            </h2>
            <p className="text-ppa-gray font-light leading-relaxed max-w-[420px]">
              If your question isn&apos;t here, email{" "}
              <a
                href={CAREERS.applyHref}
                className="text-ppa-black underline decoration-ppa-brass underline-offset-4 hover:text-ppa-brass transition-colors"
              >
                {CAREERS.email}
              </a>
              . Ron Larson, our Accountable Manager, reads the inbox too.
            </p>
          </div>

          <div className="border-t border-ppa-border">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group border-b border-ppa-border">
                <summary className="flex items-center justify-between gap-6 py-6 cursor-pointer list-none">
                  <span className="font-display text-[20px] lg:text-[22px] text-ppa-black leading-snug">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 h-7 w-7 border border-ppa-border flex items-center justify-center text-ppa-brass font-display text-lg leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="pb-7 pr-12 text-ppa-gray font-light leading-relaxed text-[15px]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Page-local CTA strip — replaces the global quote CTA on this route */}
      <section className="bg-ppa-brass">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-none">
              Send a Resume.
            </h2>
            <p className="mt-3 text-ppa-white/80 max-w-xl">
              We hire year-round. Fastest way in is a real resume and a quick
              note about the airframe you&apos;ve spent the most time on.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#apply"
              className="px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-brass bg-ppa-white hover:bg-ppa-light transition-colors text-center"
            >
              Apply Now
            </a>
            <a
              href={CAREERS.applyHref}
              className="px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white border border-ppa-white/50 hover:bg-ppa-white/10 transition-colors text-center"
            >
              {CAREERS.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
