// PPA Brand Constants — Single source of truth for the website

export const COMPANY = {
  name: "Plane Place Aviation",
  shortName: "PPA",
  phone: "(817) 768-8884",
  phoneRaw: "8177688884",
  email: "info@ppa.aero",
  address: {
    street: "1650 Airport Dr, Hangar 98",
    city: "Cleburne",
    state: "TX",
    zip: "76033",
    airport: "KCPT — Cleburne Regional Airport",
  },
  founders: [
    {
      name: "Tristan Noe",
      title: "Co-Founder / Director of Maintenance",
      email: "tristan@ppa.aero",
    },
    {
      name: "Travis Roberson",
      title: "Co-Founder / VP of Maintenance",
      email: "travis@ppa.aero",
    },
  ],
  leadership: [
    {
      name: "Tristan Noe",
      title: "Co-Founder / Director of Maintenance",
      photo: "/images/Tristan.jpg",
    },
    {
      name: "Travis Roberson",
      title: "Co-Founder / VP of Maintenance",
      photo: "/images/Travis.jpg",
    },
    {
      name: "Ron Larson",
      title: "Accountable Manager",
      photo: "/images/Ron-Larson.jpg",
    },
    {
      name: "Ron Reiling",
      title: "Sales Manager",
      photo: "/images/Ron-Reiling.jpg",
    },
    {
      name: "Chris Zamora",
      title: "Citation Lead",
      photo: "/images/Chris-Zamora.jpg",
    },
    {
      name: "Angel Zamora",
      title: "Hawker Lead",
      photo: "/images/Angel-Zamora.jpg",
    },
    {
      name: "Dalton Friesenhahn",
      title: "Challenger Lead",
      photo: "/images/Dalton.jpg",
    },
  ],
  tagline: "Precise. Professional. Attentive.",
  stats: {
    airframesFamilies: "3",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/plane-place-aviation-llc",
    facebook: "https://www.facebook.com/Planeplaceaviation",
    instagram: "https://www.instagram.com/planeplaceaviationllc/",
  },
} as const;

export const AIRFRAMES = {
  hawker: {
    name: "Hawker",
    slug: "hawker",
    manufacturer: "Hawker Beechcraft",
    models: ["800", "800XP", "900XP", "1000"],
    modelSpecs: {
      "800": { class: "Midsize", engines: "2× Honeywell TFE731-5R", range: "2,540 nm" },
      "800XP": { class: "Midsize", engines: "2× Honeywell TFE731-5BR", range: "2,540 nm" },
      "900XP": { class: "Midsize", engines: "2× Honeywell TFE731-50BR", range: "2,818 nm" },
      "1000": { class: "Super-midsize", engines: "2× P&WC PW305", range: "3,050 nm" },
    },
    description:
      "Deep expertise across the entire Hawker 800 series — from the classic 800 through the 900XP and 1000. Our technicians know these airframes inside and out.",
    services: [
      "B, C, D, E, F, G inspections",
      "4-year and 8-year inspections",
      "Landing gear overhaul",
      "Structural repairs",
      "Avionics upgrades",
      "Pre-purchase inspections",
      "AOG response",
    ],
    majorEvents: {
      eyebrow: "Major Maintenance Events",
      heading: "Hawker 8-Year Inspections & Major Events",
      paragraphs: [
        "Every 8 years, your Hawker is due for its major inspection — a heavy maintenance event that touches every system on the aircraft. Plane Place Aviation has extensive experience performing Hawker 8-year inspections across the Hawker 800, 800XP, 900XP, and 1000 fleet. Our technicians know these airframes intimately, and our shop is set up to plan, scope, and turn these events on schedule.",
        "We also support 4-year inspections, B/C/D/E/F/G phase inspections, landing gear overhaul, and avionics upgrades for the entire Hawker series. Our type-specific tooling and procedures are dedicated to this airframe family — not borrowed from a generic shop floor.",
        "Hawker parts availability has become an industry-wide pain point. Plane Place Aviation has access to extensive Hawker parts inventory and a parts-out partner on the field, which means we can keep your maintenance event moving instead of waiting weeks on a back-ordered component. When Hawker maintenance is what you need, we go above and beyond to surpass expectations on your aircraft.",
      ],
    },
  },
  citation: {
    name: "Citation",
    slug: "citation",
    manufacturer: "Cessna / Textron Aviation",
    models: ["550", "560", "560XL/XLS", "650", "680"],
    modelSpecs: {
      "550": { class: "Light-midsize", engines: "2× P&WC PW530A", range: "1,900 nm" },
      "560": { class: "Midsize", engines: "2× P&WC JT15D / PW535A", range: "1,900 nm" },
      "560XL/XLS": { class: "Midsize", engines: "2× P&WC PW545B/C", range: "2,100 nm" },
      "650": { class: "Midsize", engines: "2× Garrett TFE731-3B-100S", range: "2,000 nm" },
      "680": { class: "Super-midsize", engines: "2× P&WC PW306C", range: "3,000 nm" },
    },
    description:
      "Full-service Citation maintenance from the 550 series through the 680 Sovereign — including the Citation 650. Whether it's a scheduled phase inspection or an unscheduled squawk, we have the tooling, parts, and type experience to turn your Citation quickly.",
    services: [
      "Phase inspections",
      "Annual inspections",
      "Landing gear service",
      "Structural repairs",
      "Avionics troubleshooting",
      "Pre-purchase inspections",
      "AOG response",
    ],
    majorEvents: {
      eyebrow: "Citation Maintenance",
      heading: "Phase Inspections & Heavy Events",
      paragraphs: [
        "Citation operators rely on Plane Place Aviation for full-service maintenance from the Citation 550 through the 680 Sovereign — including the Citation 560XL/XLS and Citation 650. Phase 1 through Phase 5 inspections, annual inspections, structural repairs, landing gear service, and avionics troubleshooting are all handled in-house at our Cleburne, Texas hangar.",
        "Our Citation team has the type-specific tooling, parts access, and OEM documentation to turn your aircraft on schedule. We support owner-operators, charter departments, and aircraft management companies — and we deliver the audit-ready documentation that protects your aircraft's resale value.",
      ],
    },
  },
  challenger: {
    name: "Challenger",
    slug: "challenger",
    manufacturer: "Bombardier",
    models: ["300", "350", "604", "605", "650"],
    modelSpecs: {
      "300": { class: "Super-midsize", engines: "2× Honeywell HTF7000", range: "3,100 nm" },
      "350": { class: "Super-midsize", engines: "2× Honeywell HTF7350", range: "3,200 nm" },
      "604": { class: "Large-cabin", engines: "2× GE CF34-3B", range: "4,027 nm" },
      "605": { class: "Large-cabin", engines: "2× GE CF34-3B", range: "4,077 nm" },
      "650": { class: "Large-cabin", engines: "2× GE CF34-3B", range: "4,000 nm" },
    },
    description:
      "Specialist Challenger maintenance from the 300/350 through the 604/605/650. Our team delivers on complex inspection events, structural work, and everything in between.",
    services: [
      "96/192-month inspections",
      "Phase inspections",
      "Landing gear removal & overhaul",
      "Structural repairs",
      "Avionics systems",
      "Pre-purchase inspections",
      "AOG response",
    ],
    majorEvents: {
      eyebrow: "Major Maintenance Events",
      heading: "Challenger 300/350 96 & 192-Month Inspections",
      paragraphs: [
        "Every 96 and 192 months, your Challenger is due for a major inspection and landing gear removal. Plane Place Aviation has completed several of these inspections and gear removals — we have the tooling, knowledge, and attention to detail this maintenance requires.",
        "Our factory-trained Challenger 300/350 technicians are on staff to support your aircraft at all times. From routine 96-month events to comprehensive 192-month inspections, we bring deep airframe specialization to every job. We see the same patterns again and again across this fleet, which means we know what to look for and how to plan the work — including known structural findings in the main entry area that often surface during the 192-month event.",
        "Plane Place Aviation also supports Challenger 604, 605, and 650 maintenance. Whether you're scheduling a heavy maintenance event or facing an unscheduled squawk, our 24/7 AOG response covers Texas and Oklahoma — so when your Challenger is down, we come to you.",
      ],
    },
  },
} as const;

export const SERVICES = [
  {
    name: "Scheduled Maintenance",
    slug: "scheduled-maintenance",
    short: "Phase inspections, annuals, and scheduled events — on time, every time.",
    icon: "wrench",
  },
  {
    name: "Pre-Purchase Inspections",
    slug: "pre-purchase-inspections",
    short: "Thorough, unbiased PPIs that protect your investment before you buy.",
    icon: "clipboard",
  },
  {
    name: "AOG Response",
    slug: "aog-response",
    short: "Aircraft down? Our mobile team covers Texas and Oklahoma.",
    icon: "bolt",
  },
  {
    name: "Structural Repairs / Modifications",
    slug: "structural-repairs",
    short: "FAA-approved structural engineering, repair, and modifications on all three airframe families.",
    icon: "shield",
  },
  {
    name: "Avionics",
    slug: "avionics",
    short: "Troubleshooting, repair, and upgrades for Hawker, Citation, and Challenger avionics suites.",
    icon: "cpu",
  },
  {
    name: "Maintenance Management",
    slug: "maintenance-management",
    short: "Consulting and management services from operators who've been in your seat.",
    icon: "chart",
  },
] as const;

export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const NAV_LINKS: NavLink[] = [
  { label: "Services", href: "/services" },
  {
    label: "Capabilities",
    href: "/capabilities",
    children: [
      { label: "Hawker", href: "/capabilities/hawker" },
      { label: "Citation", href: "/capabilities/citation" },
      { label: "Challenger", href: "/capabilities/challenger" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
