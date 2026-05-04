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
  {
    slug: "plane-place-aviation-receives-mexico-afac-repair-station-certification",
    title: "Plane Place Aviation Receives Mexico AFAC Repair Station Certification",
    excerpt:
      "PPA is now a Mexico AFAC Certified Repair Station, expanding maintenance services for Mexico-registered Challenger, Hawker, and Citation operators.",
    category: "Company News",
    date: "2025-08-18",
    dateDisplay: "August 18, 2025",
    author: "Plane Place Aviation",
    readingTime: "2 min read",
    hero: {
      src: "/blog/images/plane-place-aviation-receives-mexico-afac-repair-station-certification/hero.jpg",
      alt: "Plane Place Aviation receives Mexico AFAC certification",
    },
    tags: ["AFAC", "Mexico", "Certification", "Repair Station"],
    sections: [
      {
        kind: "paragraph",
        text: "Plane Place Aviation is proud to announce it has been approved by AFAC and is now a Mexico AFAC Certified Repair Station. This achievement marks the ongoing dedication of continued growth, enabling the expansion of capabilities and services to Mexico operators while delivering the highest safety and quality services in the industry.",
      },
      {
        kind: "paragraph",
        text: "Becoming AFAC certified is a process that affirms a repair station's full compliance with the federal regulations of safety, maintenance, training, and operational oversight. This allows Plane Place to perform maintenance on Mexico-registered aircraft at its Cleburne, Texas location. The hangar facilities offer a prime location, at less than an hour of flight time from the border. Services available include airframe, engine, radio, wheel, tire, battery maintenance, and additional accessory capabilities for Challenger, Hawker, and Citation airframes.",
      },
      {
        kind: "callout",
        text: "\"We are honored to receive our AFAC certification, which is only accomplished by our team's dedication to excellence and our commitment to provide the highest quality of safety and reliable services to our valued customers.\" — Travis Roberson, VP of Maintenance",
      },
      {
        kind: "callout",
        text: "\"We are very excited to become AFAC approved. With our centralized southern location, we are in a prime spot to be the first and only stop for Mexico operators to come for maintenance.\" — Tristan Noe, Director of Maintenance",
      },
    ],
  },
  {
    slug: "now-hiring-ap-mechanic-avionics-technician",
    title: "Now Hiring: A&P Mechanic & Avionics Technician",
    excerpt:
      "PPA is hiring experienced A&P mechanics and avionics technicians to support our growing Challenger, Hawker, and Citation maintenance operations in Cleburne, Texas.",
    category: "Careers",
    date: "2025-07-01",
    dateDisplay: "July 1, 2025",
    author: "Plane Place Aviation",
    readingTime: "2 min read",
    hero: {
      src: "/blog/images/now-hiring-ap-mechanic-avionics-technician/hero.jpg",
      alt: "PPA hiring A&P mechanics and avionics technicians",
    },
    tags: ["Careers", "Hiring", "A&P Mechanic", "Avionics"],
    sections: [
      {
        kind: "paragraph",
        text: "Plane Place Aviation is a growing Part 145 repair station specializing in Challenger, Citation, and Hawker business jets located in Cleburne, TX, just outside the DFW area. The company is expanding its Challenger and super-midsize maintenance services and seeking skilled A&P mechanics interested in building a career.",
      },
      {
        kind: "heading",
        text: "Position details",
      },
      {
        kind: "paragraph",
        text: "Location: Cleburne, TX (south of Fort Worth). Schedule: Full-time M–F with overtime opportunities.",
      },
      {
        kind: "heading",
        text: "Responsibilities",
      },
      {
        kind: "paragraph",
        text: "Performing scheduled and unscheduled maintenance on Challenger, Hawker, and Citation jets, troubleshooting and repairing airframe and powerplant systems, collaborating with experienced technicians, and maintaining FAA and manufacturer standards.",
      },
      {
        kind: "heading",
        text: "Required qualifications",
      },
      {
        kind: "paragraph",
        text: "A&P Certificate, 3+ years of experience on Challenger, Hawker, or Citation jets, strong troubleshooting skills, attention to quality, and ability to read technical manuals and wiring diagrams.",
      },
      {
        kind: "heading",
        text: "What we offer",
      },
      {
        kind: "paragraph",
        text: "Competitive pay, IRA matching, PTO, regular bonuses, employer-covered medical/dental/vision insurance, relocation assistance if needed, and genuine career advancement opportunities including lead roles and quality assurance positions.",
      },
      {
        kind: "callout",
        text: "Interested? Contact Tristan Noe, Director of Maintenance, at tristan@ppa.aero or (817) 768-8884.",
      },
    ],
  },
  {
    slug: "plane-place-aviation-expands-operations-with-move-to-larger-hangar-space",
    title: "Plane Place Aviation Expands Operations with Move to Larger Hangar Space",
    excerpt:
      "PPA expands to 40,000 sq ft of hangar space at Cleburne airport — additional capacity for the airframe-specific maintenance our customers depend on.",
    category: "Company News",
    date: "2025-03-01",
    dateDisplay: "March 1, 2025",
    author: "Plane Place Aviation",
    readingTime: "1 min read",
    hero: {
      src: "/blog/images/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space/hero.jpg",
      alt: "PPA's newly renovated hangar at Cleburne airport",
    },
    tags: ["Facilities", "Cleburne", "Expansion"],
    sections: [
      {
        kind: "paragraph",
        text: "Plane Place Aviation is pleased to announce its expansion to a larger, newly renovated hangar facility at Cleburne, TX (KCPT) airport.",
      },
      {
        kind: "paragraph",
        text: "Plane Place, a Certified Repair Station, expanded to a larger facility to provide additional space for employees and visitors, while also accommodating the growing customer demand for airframe-specific maintenance. The newly acquired and completely renovated hangar brings the company's total to 40,000 sq. ft. of hangar space at Cleburne airport. The facility also includes a comfortable lounge area and ample office space for customers and employees.",
      },
      {
        kind: "callout",
        text: "\"We're quickly growing and expanding the services we offer, addressing the growing demand for quality maintenance on the airframes we specialize in. This growth can all be attributed to our commitment to provide the best possible service to our customers, backed by our exceptional and specialized team members.\" — Tristan Noe, co-founder",
      },
    ],
  },
  {
    slug: "receives-faa-certification-as-a-part-145-repair-station",
    title: "Plane Place Aviation Receives FAA Certification as a Part 145 Repair Station",
    excerpt:
      "PPA has received FAA Part 145 certification — a milestone enabling expanded service offerings on Hawker, Citation, and Challenger aircraft.",
    category: "Company News",
    date: "2024-08-01",
    dateDisplay: "August 1, 2024",
    author: "Plane Place Aviation",
    readingTime: "1 min read",
    hero: {
      src: "/blog/images/receives-faa-certification-as-a-part-145-repair-station/hero.jpg",
      alt: "Plane Place Aviation team at the Cleburne hangar",
    },
    tags: ["FAA", "Part 145", "Certification"],
    sections: [
      {
        kind: "paragraph",
        text: "Plane Place is pleased to announce it has received FAA certification as a Part 145 repair station.",
      },
      {
        kind: "paragraph",
        text: "Plane Place, located in Texas, offers an array of services including maintenance and inspections on Hawker, Citation, and Challenger aircraft. This certification will enable Plane Place to expand its service offerings, further establishing the company as a trusted partner in the business aviation industry.",
      },
      {
        kind: "callout",
        text: "\"With our team's dedication, we are proud to earn this prestigious certification, marking a significant milestone in our commitment to maintain the highest standards of safety, quality, and operational excellence, while ensuring each customer receives an exceptional maintenance experience.\" — Tristan Noe, Owner / Director of Maintenance",
      },
      {
        kind: "heading",
        text: "We specialize in",
      },
      {
        kind: "paragraph",
        text: "**Hawker:** 800, 800XP, 900XP, 1000",
      },
      {
        kind: "paragraph",
        text: "**Citation:** 550, 560, 560XL/XLS, 650, 680",
      },
      {
        kind: "paragraph",
        text: "**Challenger:** 300, 350, 604, 605, 650",
      },
    ],
  },
  {
    slug: "plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities",
    title: "Plane Place Aviation Adds New Challenger 604, 605 and 650 Capabilities",
    excerpt:
      "PPA expands Challenger maintenance to the 604, 605, and 650 — adding to existing 300 and 350 capabilities, with 24/7 AOG support across Texas and Oklahoma.",
    category: "Capabilities",
    date: "2024-09-01",
    dateDisplay: "September 1, 2024",
    author: "Plane Place Aviation",
    readingTime: "1 min read",
    hero: {
      src: "/blog/images/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities/hero.jpg",
      alt: "Bombardier Challenger aircraft maintained by Plane Place Aviation",
    },
    tags: ["Challenger 604", "Challenger 605", "Challenger 650", "Capabilities"],
    sections: [
      {
        kind: "paragraph",
        text: "Plane Place Aviation is pleased to announce the addition of Challenger 604, 605, and 650 to our growing list of maintenance capabilities, which already includes Challenger 300 and 350.",
      },
      {
        kind: "paragraph",
        text: "The additional capabilities expand the reach of Plane Place's already established support for Hawker and Citation models. With 24/7 AOG support available in Texas and Oklahoma, customers will experience top-tier maintenance, tailored specifically to their aircraft.",
      },
      {
        kind: "callout",
        text: "\"Our commitment to high-quality maintenance and dedication to customer satisfaction continues to be our focus as we expand our capabilities, ensuring we surpass each customer's expectations with an exceptional experience.\" — Tristan Noe, co-owner",
      },
      {
        kind: "callout",
        text: "\"We feel supporting this fleet will help us support our current customer base who are upgrading to the Challenger fleet and also reaching new operators who seek high-quality maintenance.\" — Travis Roberson, co-owner",
      },
      {
        kind: "heading",
        text: "We specialize in",
      },
      {
        kind: "paragraph",
        text: "**Hawker:** 800, 800XP, 900XP, 1000",
      },
      {
        kind: "paragraph",
        text: "**Citation:** 550, 560, 560XL/XLS, 650, 680",
      },
      {
        kind: "paragraph",
        text: "**Challenger:** 300, 350, 604, 605, 650",
      },
    ],
  },
  {
    slug: "plane-place-aviation-taps-into-surging-demand-for-airframe-mro",
    title: "Plane Place Aviation Featured in AIN: Tapping into Surging Demand for Airframe MRO",
    excerpt:
      "Aviation International News profiles PPA on the heels of expanded AOG and mobile repair team services for Texas and Oklahoma, plus growing onsite support at Dallas Love Field.",
    category: "Press",
    date: "2024-04-01",
    dateDisplay: "April 1, 2024",
    author: "Plane Place Aviation",
    readingTime: "2 min read",
    hero: {
      src: "/blog/images/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/hero.jpg",
      alt: "Plane Place Aviation hangar operations",
    },
    tags: ["Press", "AIN", "MRO", "Industry Trends", "AOG"],
    sections: [
      {
        kind: "paragraph",
        text: "Aviation International News profiled Plane Place Aviation in April 2024, covering our expansion into AOG and mobile repair team (MRT) services across Texas and Oklahoma, plus growing onsite support at Dallas Love Field.",
      },
      {
        kind: "heading",
        text: "What the article covered",
      },
      {
        kind: "paragraph",
        text: "AIN highlighted PPA's specialization in Bombardier Challenger 300, Hawker, and Cessna Citation airframes, and our focus on supporting large MROs, charter operations, and aircraft management companies. Co-owners Tristan Noe and Travis Roberson discussed the company's growth trajectory two years after founding, the realities of hiring senior technicians in a tight labor market, and the parts-availability and turnaround pressures shaping the broader MRO industry.",
      },
      {
        kind: "callout",
        text: "\"We've got a lot of customers up there and sometimes it just doesn't make sense for them to fly their airplane down to Cleburne to get minor maintenance done. So, we're trying to provide some support for them up there.\" — Tristan Noe, on the expansion to Dallas Love Field",
      },
      {
        kind: "paragraph",
        text: "The full AIN article is available at AINonline. For PPA's current capabilities and AOG response coverage, see our [services page](/services).",
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
