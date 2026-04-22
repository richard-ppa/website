export type BlogSection =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "figure"; src: string; alt: string; caption: string }
  | { kind: "takeaways"; items: { label: string; text: string }[] }
  | { kind: "callout"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  dateDisplay: string;
  author: string;
  readingTime: string;
  hero: { src: string; alt: string };
  sections: BlogSection[];
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "challenger-300-main-entry-corrosion",
    title: "Challenger 300 Main Entry Area Corrosion: Field Insights",
    excerpt:
      "A recurring structural pattern in the Challenger 300 fleet — what's driving it, and why operators should catch it before the 192-month inspection turns into a major structural repair.",
    category: "Field Insights",
    date: "2026-04-21",
    dateDisplay: "April 21, 2026",
    author: "The PPA Structural Team",
    readingTime: "4 min read",
    hero: {
      src: "/blog/images/challenger-300-corrosion/figure-1.png",
      alt: "Corrosion on the main entry area frame and stringer of a Challenger 300",
    },
    tags: ["Challenger 300", "Challenger 350", "Corrosion", "192-Month Inspection", "Structural Repair"],
    sections: [
      {
        kind: "paragraph",
        text: "Over the past year, we've seen a pattern emerge across the Challenger 300 fleet: heavy corrosion in the main entry area, most often surfacing during the 192-month inspection. This isn't an isolated finding — it's a trend. Left alone, it turns a scheduled inspection into a major structural repair, with the downtime and cost to match.",
      },
      {
        kind: "heading",
        text: "The problem: hidden corrosion in a high-risk area",
      },
      {
        kind: "figure",
        src: "/blog/images/challenger-300-corrosion/figure-1.png",
        alt: "Corrosion identified on the frame and stringer in the main entry area",
        caption: "Figure 1. Corrosion identified on the frame and stringer in the main entry area.",
      },
      {
        kind: "figure",
        src: "/blog/images/challenger-300-corrosion/figure-2.png",
        alt: "Main entry area after cleaning, exposing corrosion",
        caption: "Figure 2. Main entry area after cleaning and identifying possible corrosion.",
      },
      {
        kind: "paragraph",
        text: "Across multiple recent inspections, we've identified heavy corrosion on frames and stringers within the main entry area. The Challenger 300 uses a damage-tolerant structure, which means repairs in this region are highly engineered and generally limited to OEM-approved methods. That makes the work both time-consuming and expensive once it's already there.",
      },
      {
        kind: "heading",
        text: "Root cause #1: ineffective drainage design",
      },
      {
        kind: "figure",
        src: "/blog/images/challenger-300-corrosion/figure-3.png",
        alt: "Water and contamination trapped along the structure due to ineffective drainage routing",
        caption: "Figure 3. Water and contamination trapped along the structure due to ineffective drainage routing.",
      },
      {
        kind: "paragraph",
        text: "The primary driver is water intrusion combined with poor drainage beneath the main entry doorstep. Water pools under the step with no efficient path out. A drain hole exists, but it only starts functioning once water reaches a specific level — and when drainage does occur, it routes water into the middle of the fuselage, soaking the insulation and giving moisture another path to migrate.",
      },
      {
        kind: "paragraph",
        text: "Bombardier has addressed this with **SB 100-53-36** (Challenger 300) and **SB 350-53-005** (Challenger 350), both aimed at improving drainage in the passenger door area.",
      },
      {
        kind: "heading",
        text: "Root cause #2: missed findings during scheduled inspections",
      },
      {
        kind: "figure",
        src: "/blog/images/challenger-300-corrosion/figure-4.png",
        alt: "Debris and contamination hiding corrosion during a scheduled inspection",
        caption: "Figure 4. Debris and contamination can hide corrosion during scheduled inspections.",
      },
      {
        kind: "paragraph",
        text: "During 48- and 96-month inspections, limited access and inadequate cleaning can mask corrosion that is already present. Bombardier emphasizes proper cleaning and access prior to inspection in **AW300-53-0420** — and it matters. You cannot inspect what you cannot see.",
      },
      {
        kind: "heading",
        text: "The PPA approach",
      },
      {
        kind: "paragraph",
        text: "We've completed several full frame and stringer replacements in the main entry area on Challenger 300s. Our structural team knows this region, and we turn repairs and replacements around quickly. Because the work stays in-house, operators avoid the downtime and resale damage that comes with a major-repair history on the aircraft logs.",
      },
      {
        kind: "heading",
        text: "Takeaways for operators",
      },
      {
        kind: "takeaways",
        items: [
          {
            label: "Verify the service bulletins",
            text: "Check whether the drainage-improvement SBs have been incorporated on your aircraft.",
          },
          {
            label: "Prioritize access and cleaning",
            text: "Ensure inspections include full access, thorough cleaning, and detailed visual checks — not a quick look through what's already there.",
          },
          {
            label: "Pick a provider who can repair, not just inspect",
            text: "Make sure your maintenance provider has the in-house capability to perform complex structural repairs — not just run the inspection. This is the deciding factor for 48-, 96-, and 192-month events.",
          },
        ],
      },
      {
        kind: "callout",
        text: "Early detection is the only way to keep a minor maintenance finding from becoming a major structural overhaul.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}
