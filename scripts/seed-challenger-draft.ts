/**
 * seed-challenger-draft.ts — upserts the Challenger 300/350 maintenance
 * guide draft into Supabase (series post #1, the overview / hub).
 *
 * REVISED 2026-05-12 with Tristan's rewrite. The article is now an
 * operator-focused guide: what the maintenance program looks like, what
 * heavy events involve, how shops differ on downtime, the 300 vs 350
 * differences, and how to plan ahead. No specific man-hour figures —
 * Tristan removed those in favor of broader operator-facing framing.
 *
 * Idempotent (upsert keyed on slug). Re-run anytime.
 */

import type { ArticleInsert, BlogSection } from "../src/lib/articles-types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[seed-challenger-draft] Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.",
  );
  process.exit(1);
}

const SECTIONS: BlogSection[] = [
  // ── Intro ───────────────────────────────────────────────────────────────
  {
    kind: "paragraph",
    text:
      "The Bombardier Challenger 300 and Challenger 350 are among the most popular super-midsize business jets in operation today. They are also two of the most maintenance-friendly aircraft in their class when operated under a properly managed inspection program.",
  },
  {
    kind: "paragraph",
    text:
      "Because the Challenger 300 and 350 share nearly identical airframes and maintenance philosophies, operators can generally expect the same inspection structure, maintenance intervals, and long-term planning requirements across both aircraft.",
  },
  {
    kind: "paragraph",
    text:
      "This guide breaks down the published maintenance intervals, estimated man-hours, and what operators should realistically expect during routine and heavy inspection events.",
  },

  // ── Section: Understanding the program ─────────────────────────────────
  { kind: "heading", text: "Understanding the Challenger 300 & 350 Maintenance Program" },
  {
    kind: "paragraph",
    text:
      "Both aircraft follow a MSG-3-based maintenance program, meaning inspections are driven by flight hours, calendar time, and aircraft landings. Whichever limit occurs first becomes the controlling inspection requirement.",
  },
  {
    kind: "paragraph",
    text:
      "The maintenance program is designed to spread workload across recurring inspection intervals while concentrating larger structural and systems inspections into major long-term events.",
  },
  {
    kind: "paragraph",
    text:
      "For operators, understanding where those heavy inspections occur is critical for budgeting downtime, scheduling maintenance, and avoiding surprises.",
  },

  // ── Section: Heavy inspections ──────────────────────────────────────────
  { kind: "heading", text: "What Happens During Heavy Challenger Inspections?" },
  {
    kind: "paragraph",
    text:
      "The largest maintenance events on the Challenger 300 and 350 occur during the 48-month, 96-month, and 7,500-landing / 192-month inspections.",
  },
  {
    kind: "paragraph",
    text:
      "These inspections involve substantially more aircraft disassembly than routine hourly or annual events. Operators should expect:",
  },
  {
    kind: "takeaways",
    items: [
      { label: "Extensive panel removal", text: "Cabin, fairings, and cowlings opened for access." },
      { label: "Structural inspections", text: "Defined-zone visual checks across the primary structure." },
      { label: "NDT inspections", text: "Eddy current, ultrasonic, and fluorescent-penetrant testing." },
      { label: "Fuel tank access and inspection", text: "Tank entry, sealant condition, internal component checks." },
      { label: "Landing gear removal, inspection, and LLP verification", text: "Time-tracked component audit and overhaul as required." },
      { label: "Flight control inspections and checks", text: "Hinges, bearings, rigging, and bonding integrity." },
      { label: "Corrosion inspection and treatment", text: "Fleet-wide patterns and known problem areas." },
      { label: "Detailed systems testing", text: "Hydraulics, pressurization, environmental, and electrical bonding." },
    ],
  },
  {
    kind: "figure",
    src: "/images/Challenger Posts/Challenger-Wing-Inspections.jpg",
    alt: "Wing inspection in progress on a Bombardier Challenger at Plane Place Aviation",
    caption: "Defined-zone wing inspections during a Challenger heavy maintenance event.",
  },
  {
    kind: "paragraph",
    text:
      "The 7,500-landing event is generally considered the heaviest scheduled inspection in the aircraft's maintenance program.",
  },
  {
    kind: "paragraph",
    text:
      "A well-maintained aircraft with strong records and consistent maintenance history may remain close to published labor estimates. Aircraft with deferred discrepancies, corrosion exposure, incomplete records, or aging interiors often exceed baseline estimates substantially.",
  },

  // ── Section: Why downtime varies ───────────────────────────────────────
  { kind: "heading", text: "Why Challenger Downtime Varies Between Maintenance Shops" },
  {
    kind: "paragraph",
    text:
      "Most Challenger inspection man-hours are predictable. What separates maintenance providers is how efficiently they manage findings once the aircraft is opened.",
  },
  {
    kind: "paragraph",
    text:
      "During major inspections, additional repairs are common. Structural findings, corrosion, component wear, and wiring discrepancies can quickly extend downtime if the maintenance facility lacks:",
  },
  {
    kind: "takeaways",
    items: [
      { label: "Challenger-specific experience", text: "Familiarity with the airframe and its known findings." },
      { label: "In-house structural capability", text: "Damage-tolerant repairs completed without sending the work out." },
      { label: "Established vendor support", text: "Existing relationships for landing gear, engines, and components." },
      { label: "Familiarity with Bombardier inspection requirements", text: "Working knowledge of the task cards and SB compliance." },
      { label: "Efficient parts sourcing", text: "Proactive parts coordination during the inspection." },
    ],
  },
  {
    kind: "figure",
    src: "/images/Challenger Posts/challenger-in-shop.jpg",
    alt: "Bombardier Challenger on jacks in the Plane Place Aviation hangar during a scheduled inspection",
    caption: "A Challenger in for a scheduled inspection at our Cleburne hangar.",
  },
  {
    kind: "paragraph",
    text:
      "Facilities unfamiliar with the Challenger platform often outsource repairs, creating additional downtime through ferry coordination, third-party structural repairs, and delayed parts procurement.",
  },
  {
    kind: "paragraph",
    text:
      "For operators, choosing a shop that routinely performs Challenger inspections can significantly reduce schedule disruption during heavy events.",
  },

  // ── Section: 300 vs 350 differences ────────────────────────────────────
  { kind: "heading", text: "Challenger 300 vs. Challenger 350 Maintenance Differences" },
  {
    kind: "paragraph",
    text:
      "From a maintenance planning perspective, the Challenger 300 and Challenger 350 are extremely similar aircraft. However, several differences affect inspection and support requirements:",
  },

  { kind: "heading", text: "Engine Differences" },
  {
    kind: "paragraph",
    text:
      "The Challenger 300 uses the Honeywell HTF7000 engine, while the Challenger 350 uses the uprated HTF7350. Although the engines follow a similar maintenance philosophy, the 350 incorporates updated software, engine components, and support considerations.",
  },
  {
    kind: "figure",
    src: "/images/Challenger Posts/Challenger-Engine.jpg",
    alt: "Honeywell HTF7000 engine on a Bombardier Challenger",
    caption: "The Honeywell HTF7000 powers the Challenger 300; the 350 uses the uprated HTF7350 variant.",
  },

  { kind: "heading", text: "Avionics Differences" },
  {
    kind: "paragraph",
    text:
      "Challenger 350 aircraft introduced Collins Pro Line 21 Advanced avionics, which differs from the earlier Pro Line 21 systems installed in the Challenger 300.",
  },

  { kind: "heading", text: "Winglet Configuration" },
  {
    kind: "paragraph",
    text:
      "The Challenger 350 introduced canted winglets that slightly alter inspection access and structural inspection requirements.",
  },
  {
    kind: "paragraph",
    text:
      "Despite these differences, most maintenance facilities experienced on the Challenger 300 platform can support the Challenger 350 as well.",
  },

  // ── Section: Planning ──────────────────────────────────────────────────
  { kind: "heading", text: "Planning Ahead for Challenger Heavy Maintenance" },
  {
    kind: "paragraph",
    text:
      "Operators approaching a major Challenger inspection should begin planning well in advance. Before scheduling a 48-month, 96-month, 192-month, or 7,500-landing inspection, it is smart to review:",
  },
  {
    kind: "takeaways",
    items: [
      { label: "Aircraft maintenance records", text: "Complete history including any deferred items." },
      { label: "Open Service Bulletins", text: "Compliance audit ahead of the event." },
      { label: "Airworthiness Directive status", text: "Current AD compliance verified." },
      { label: "Landing gear LLP tracking", text: "Time-tracked component audit." },
      { label: "Engine program coverage", text: "Honeywell MSP status and inclusions." },
      { label: "Interior refurbishment needs", text: "Cabin work that bundles cleanly with the visit." },
    ],
  },

  // ── Section: PPA pitch ─────────────────────────────────────────────────
  { kind: "heading", text: "Why Operators Choose Plane Place Aviation for Challenger Maintenance" },
  {
    kind: "paragraph",
    text:
      "Plane Place Aviation focuses exclusively on business aircraft maintenance, including Challenger, Citation, and Hawker platforms.",
  },
  {
    kind: "paragraph",
    text:
      "Our team routinely performs Challenger inspections ranging from routine scheduled maintenance to major structural and heavy inspection events.",
  },
  {
    kind: "paragraph",
    text:
      "Because Challenger maintenance is part of our daily operation — not an occasional project — we understand the inspection flow, recurring findings, and planning considerations that affect operator downtime.",
  },
  {
    kind: "figure",
    src: "/images/Challenger Posts/Dalton-on-workstation.jpg",
    alt: "Plane Place Aviation technician working on a Challenger component at the maintenance workstation",
    caption: "Challenger work is part of our daily operation in Cleburne.",
  },

  // ── FAQ ────────────────────────────────────────────────────────────────
  { kind: "heading", text: "Frequently Asked Questions" },

  { kind: "heading", text: "What is the heaviest scheduled inspection on a Challenger 300 or 350?" },
  {
    kind: "paragraph",
    text:
      "The 7,500-landing / 192-month inspection is typically the largest scheduled maintenance event in the program, involving extensive structural inspection and aircraft disassembly.",
  },

  { kind: "heading", text: "Are Challenger 300 and Challenger 350 inspections basically the same?" },
  {
    kind: "paragraph",
    text:
      "Yes. The aircraft share nearly identical maintenance programs, with only minor differences related to engines, avionics, and winglet configuration.",
  },

  { kind: "heading", text: "How often are Challenger maintenance programs updated?" },
  {
    kind: "paragraph",
    text:
      "Bombardier periodically revises the Maintenance Planning Document (MPD). Operators should always reference the latest approved revision when planning inspections.",
  },

  { kind: "heading", text: "Do heavy inspections always exceed published man-hours?" },
  {
    kind: "paragraph",
    text:
      "Not always, but findings discovered during inspection commonly increase labor beyond baseline published estimates.",
  },

  // ── Final thoughts ─────────────────────────────────────────────────────
  { kind: "heading", text: "Final Thoughts" },
  {
    kind: "paragraph",
    text:
      "The Challenger 300 and 350 remain some of the most reliable and operationally efficient super-midsize aircraft in business aviation.",
  },
  {
    kind: "paragraph",
    text:
      "But like any high-performance aircraft, long-term reliability depends heavily on proactive maintenance planning and choosing a facility experienced with the platform.",
  },
  {
    kind: "paragraph",
    text:
      "Understanding inspection intervals, heavy maintenance events, and realistic downtime expectations allows operators to better control maintenance costs and reduce operational disruption.",
  },
];

const ARTICLE: ArticleInsert = {
  slug: "challenger-300-350-maintenance-guide",
  title: "Challenger 300 & 350 Maintenance Guide: Inspections, Heavy Events, and Operator Planning",
  excerpt:
    "An operator's guide to Challenger 300 and 350 maintenance — inspection intervals, what happens during heavy events, why downtime varies between shops, and how to plan ahead.",
  category: "Maintenance Guides",
  date: "2026-05-12",
  date_display: "May 12, 2026",
  author: "The Plane Place Aviation Challenger Team",
  reading_time: "5 min read",
  hero_src: "/images/Challenger Posts/hangar-98-Challenger1.jpg",
  hero_alt: "Bombardier Challenger in Hangar 98 at Plane Place Aviation, Cleburne, TX",
  tags: [
    "Challenger 300",
    "Challenger 350",
    "Maintenance",
    "Inspection",
    "Heavy Maintenance",
    "Operator Planning",
  ],
  sections: SECTIONS,
  cta_headline: "Planning a Challenger 300 or 350 maintenance event?",
  cta_body:
    "We do Challenger work weekly — send your airframe details and the next scheduled interval, and we'll come back with a scope and a turn target.",
};

async function main() {
  const endpoint = `${SUPABASE_URL}/rest/v1/articles?on_conflict=slug`;
  console.log(
    `[seed-challenger-draft] Upserting "${ARTICLE.slug}" (${ARTICLE.sections.length} sections) to ${SUPABASE_URL}...`,
  );
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(ARTICLE),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upsert failed: ${res.status} ${res.statusText}\n${errText}`);
  }

  const data = (await res.json()) as Array<{ id: string; slug: string; updated_at: string }>;
  const row = data[0];
  console.log(
    `[seed-challenger-draft] Done. id=${row.id}  status="draft"  updated_at=${row.updated_at}`,
  );
}

main().catch((e) => {
  console.error("[seed-challenger-draft] Failed:", e);
  process.exit(1);
});
