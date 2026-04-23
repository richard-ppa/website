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
      title: "Co-Founder",
      email: "tristan@ppa.aero",
    },
    {
      name: "Travis Roberson",
      title: "Co-Founder",
      email: "travis@ppa.aero",
    },
  ],
  tagline: "Precise. Professional. Attentive.",
  stats: {
    airframesFamilies: "3",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/plane-place-aviation",
    facebook: "https://www.facebook.com/planeplaceaviation",
    instagram: "https://www.instagram.com/planeplaceaviation",
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
  },
  citation: {
    name: "Citation",
    slug: "citation",
    manufacturer: "Cessna / Textron Aviation",
    models: ["525", "550", "560", "560XL/XLS", "680", "680A"],
    modelSpecs: {
      "525": { class: "Light", engines: "2× Williams FJ44", range: "1,500–2,200 nm" },
      "550": { class: "Light-midsize", engines: "2× P&WC PW530A", range: "1,900 nm" },
      "560": { class: "Midsize", engines: "2× P&WC JT15D / PW535A", range: "1,900 nm" },
      "560XL/XLS": { class: "Midsize", engines: "2× P&WC PW545B/C", range: "2,100 nm" },
      "680": { class: "Super-midsize", engines: "2× P&WC PW306C", range: "3,000 nm" },
      "680A": { class: "Super-midsize", engines: "2× P&WC PW306D", range: "3,200 nm" },
    },
    description:
      "Full-service maintenance for the Citation 525 series through the 680A. Whether it's a scheduled phase inspection or an unscheduled squawk, we have the tooling, parts, and type experience to turn your Citation quickly.",
    services: [
      "Phase inspections",
      "Annual inspections",
      "Landing gear service",
      "Structural repairs",
      "Avionics troubleshooting",
      "Pre-purchase inspections",
      "AOG response",
    ],
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
    label: "Aircraft",
    href: "/aircraft",
    children: [
      { label: "Hawker", href: "/aircraft/hawker" },
      { label: "Citation", href: "/aircraft/citation" },
      { label: "Challenger", href: "/aircraft/challenger" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
