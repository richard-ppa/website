/**
 * seed-challenger-96month.ts — upserts post #4 in the Challenger 300/350
 * maintenance series: the 96-month inspection deep-dive.
 *
 * Authoring constraints (per Tristan, 2026-05-12):
 *   - No internal cost / downtime data on the public site
 *   - MPD numbers come straight from Bombardier (CL-300 Rev 22, CL-350 Rev 17)
 *   - Target ~900 words, SEO-optimized
 *
 * Sources beyond MPD: Elliott Aviation's published 29-working-day turn time
 * for a clean Challenger 300 96-month event; JetsMRO / West Star / Duncan
 * Aviation Challenger maintenance pages.
 */

import type { ArticleInsert, BlogSection } from "../src/lib/articles-types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[seed-challenger-96month] Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const SECTIONS: BlogSection[] = [
  // ── Overview ────────────────────────────────────────────────────────────
  {
    kind: "paragraph",
    text:
      "The 96-month inspection is the inflection point in the Bombardier Challenger 300 and 350 maintenance program. It's where the airframe gets its deepest scheduled look in the first decade of service — and where prior maintenance practice either pays off or compounds into expensive surprises. The published base scope for this event is one number; in practice, what shops actually work through is significantly larger. This post is part of the Challenger 300/350 maintenance series — see the program overview for the full schedule of intervals and man-hours.",
  },

  { kind: "heading", text: "What \"96-month\" actually means in practice" },

  {
    kind: "paragraph",
    text:
      "The 96-month interval is one event among many in the published maintenance program. The CL-300 lists 99 tasks at this interval; the CL-350 lists 97. Published base scope is approximately **1,079 task + access man-hours** for the CL-300 and ~1,076 for the CL-350 — what operators see when they pull just the 96-month tasks from the program.",
  },

  {
    kind: "paragraph",
    text:
      "In practice, no operator does just the 96-month tasks. By the time the aircraft is in the hangar, you bundle every concurrent interval: 12-month, 24-month, and 48-month calendar tasks all roll up. Add 3,200-hour and 450-landing supplemental inspections, landing gear R&R for overhaul, thrust reverser service bulletin rework, and any active service bulletins. The \"kitchen sink\" 96-month visit is several times the published base scope.",
  },

  { kind: "heading", text: "The supplementals that bundle into a 96-month visit" },

  {
    kind: "paragraph",
    text:
      "For a typical operator coming due at 96 months, here's what gets pulled together at the event:",
  },

  {
    kind: "takeaways",
    items: [
      {
        label: "Calendar inspections rolling up",
        text:
          "12-month, 24-month, and 48-month tasks plus supplementals — every interval that's coincident or due rolls into one visit.",
      },
      {
        label: "3,200-flight-hour inspection",
        text:
          "Required when the aircraft has accumulated 3,200 hours since the previous 3,200-hour event. Often coincides with the 96-month for moderately-utilized airframes.",
      },
      {
        label: "450-landing inspection",
        text:
          "Cycle-based event that aligns with the 96-month visit for typical operator utilization.",
      },
      {
        label: "Landing gear removal and overhaul",
        text:
          "Time-tracked gear is pulled and sent out (or completed in-house at a Challenger-specialist shop). LLP tracking should be audited well before the event.",
      },
      {
        label: "Thrust reverser service bulletin rework",
        text:
          "Periodic thrust reverser SBs are routinely addressed during heavy visits to avoid pulling the aircraft apart twice.",
      },
      {
        label: "Active service bulletins",
        text:
          "Auditing SB compliance before the event lets you negotiate scope rather than react to it. The most expensive findings at 96-month events are typically predictable through current SB status.",
      },
    ],
  },

  {
    kind: "paragraph",
    text:
      "On a clean aircraft with the supplementals bundled cleanly, plan on **around 30 working days** at a Challenger-experienced shop. Findings, missed SB compliance, or significant retrofit work added to the visit can extend that meaningfully. The number to focus on isn't average turn time — it's how predictable your shop's turn time is for your specific aircraft's history.",
  },

  { kind: "heading", text: "Common findings at the 96-month event" },

  {
    kind: "paragraph",
    text:
      "Findings at the 96-month inspection are normal — the aircraft is at the inflection point in its service life and the deepest inspection scope routinely surfaces a recurring set of items across the fleet:",
  },

  {
    kind: "takeaways",
    items: [
      {
        label: "Main entry area corrosion",
        text:
          "Documented fleet-wide pattern driven by ineffective drainage beneath the main door. Bombardier addressed it in SB 100-53-36 (CL-300) and SB 350-53-005 (CL-350). Aircraft without SB incorporation are at higher risk for advanced corrosion findings.",
      },
      {
        label: "Belly pan and bilge corrosion",
        text:
          "Galley and lavatory water reaches the lowest point of the fuselage over time. Lower skin, frames, and drainage paths need careful inspection.",
      },
      {
        label: "Fuel tank sealant degradation",
        text:
          "Original sealant reaches end-of-service life by the 96-month event. Resealing scope is common and worth budgeting for in advance.",
      },
      {
        label: "Wing-to-fuselage joint and empennage attachment NDT",
        text:
          "Defined-zone inspection that occasionally surfaces fastener-hole findings requiring engineered repair.",
      },
      {
        label: "Wire bundle and connector condition",
        text:
          "Avionics bay terminal corrosion and chafing — common root cause of intermittent fault codes operators chase between events.",
      },
      {
        label: "Cabin window and windshield condition",
        text:
          "Multi-pane windshield delamination and cabin window crazing surface at heavy-check NDT.",
      },
    ],
  },

  { kind: "heading", text: "300 vs. 350 at the 96-month event" },

  {
    kind: "paragraph",
    text:
      "At the 96-month interval, the airframes are functionally identical from an inspection standpoint. CL-300 has 99 tasks (~1,079 published man-hours); CL-350 has 97 tasks (~1,076 published man-hours) — within rounding of each other. Where the two diverge is in the bundled engine and avionics work: the 350's HTF7350 engines use different part numbers and software than the 300's HTF7000, and later 350s ship with Collins Pro Line 21 Advanced rather than original Pro Line 21. Operators planning a Pro Line 21 → Pro Line 21 Advanced retrofit usually time it to a 96-month event since the aircraft is already disassembled.",
  },

  { kind: "heading", text: "Why a Challenger specialist matters at this event" },

  {
    kind: "paragraph",
    text:
      "The 96-month is the inspection where shop selection matters most. The base scope is predictable — Bombardier published it. What's not predictable is what gets discovered. Structural findings on a damage-tolerant airframe like the Challenger require OEM-engineered repairs; shops without in-house structural capability ship those out, adding ferry flights, weeks of downtime, and a transfer entry in the aircraft logs that follows the airframe through resale. Plane Place Aviation services Hawker, Citation, and Challenger exclusively. Challenger 300/350 work is in our hangar every week.",
  },

  { kind: "heading", text: "FAQ" },

  {
    kind: "heading",
    text: "What's actually included in a Challenger 300 or 350 96-month inspection?",
  },
  {
    kind: "paragraph",
    text:
      "The base 96-month scope is 99 tasks (CL-300) or 97 tasks (CL-350) totaling approximately 1,079 task + access man-hours. In practice, the visit also bundles concurrent 12 / 24 / 48-month calendar tasks, the 3,200-hour and 450-landing supplemental inspections, landing gear R&R for overhaul, thrust reverser SB rework, and any active service bulletins.",
  },

  {
    kind: "heading",
    text: "How long does a Challenger 300 96-month inspection take?",
  },
  {
    kind: "paragraph",
    text:
      "On a clean aircraft with the supplementals bundled cleanly, plan on around 30 working days at a Challenger-experienced shop. Findings, missed SB compliance, or significant retrofit work can extend that meaningfully. Always verify the target with your shop based on your specific aircraft's history.",
  },

  {
    kind: "heading",
    text: "Does the Challenger 350 have the same 96-month inspection as the 300?",
  },
  {
    kind: "paragraph",
    text:
      "Yes, with minor refinements. Task counts differ by single digits at the 96-month event; published man-hours are within ~3 hours of each other. Engine and avionics differences (HTF7350 vs HTF7000; Pro Line 21 Advanced vs Pro Line 21) drive most of the variation in actual work scope.",
  },

  {
    kind: "heading",
    text: "What's the difference between the 48-month and 96-month inspection on a Challenger 300/350?",
  },
  {
    kind: "paragraph",
    text:
      "The 48-month is the first heavy event — approximately 674 published man-hours across 98 tasks (CL-300). The 96-month is roughly 60% larger by base scope and pulls in landing gear overhaul, supplemental inspections, thrust reverser SB rework, and active SBs. The 96-month is also where significant retrofits (avionics, paint, interior) get planned because the aircraft is already substantially disassembled.",
  },

  {
    kind: "heading",
    text: "Should service bulletin compliance happen before or during the 96-month event?",
  },
  {
    kind: "paragraph",
    text:
      "Before. Auditing SB status against the MPD before the aircraft arrives lets you negotiate scope with the shop and avoid reactive cost. The most expensive findings at heavy events are usually predictable through current SB compliance — addressing them ahead of the visit saves downtime and dollars.",
  },
];

const ARTICLE: ArticleInsert = {
  slug: "challenger-300-350-96-month-inspection",
  title: "Challenger 300 & 350 96-Month Inspection: Scope, Man-Hours, and Common Findings",
  excerpt:
    "The 96-month event is where the Challenger maintenance program weight lands. Here's what Bombardier's MPD includes, the supplementals operators bundle in, and the findings shops see most often.",
  category: "Maintenance Guides",
  date: "2026-05-12",
  date_display: "May 12, 2026",
  author: "The Plane Place Aviation Challenger Team",
  reading_time: "6 min read",
  hero_src: "/images/Challenger-350.jpg",
  hero_alt: "Bombardier Challenger 350 undergoing 96-month inspection at Plane Place Aviation",
  tags: [
    "Challenger 300",
    "Challenger 350",
    "96-month inspection",
    "Maintenance",
    "C Check",
    "MPD",
    "Heavy inspection",
  ],
  sections: SECTIONS,
  cta_headline: "Planning a Challenger 300 or 350 96-month event?",
  cta_body:
    "We do Challenger heavy events weekly. Send your airframe's history and current SB status — we'll come back with a scope and a turn target.",
};

async function main() {
  const endpoint = `${SUPABASE_URL}/rest/v1/articles?on_conflict=slug`;
  console.log(
    `[seed-challenger-96month] Upserting "${ARTICLE.slug}" (${ARTICLE.sections.length} sections) to ${SUPABASE_URL}...`,
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
    `[seed-challenger-96month] Done. id=${row.id}  status="draft"  updated_at=${row.updated_at}`,
  );
  console.log(`[seed-challenger-96month] Open /admin/articles → review under Drafts.`);
}

main().catch((e) => {
  console.error("[seed-challenger-96month] Failed:", e);
  process.exit(1);
});
