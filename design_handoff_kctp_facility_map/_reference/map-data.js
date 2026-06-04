// Hangar data — keyed by SVG data-hangar attribute (matches data-ramp on the ramp paths)
// Airframe fits are illustrative — adjust to your actual configurations.
window.HANGAR_DATA = {
  "99": {
    number: "99",
    name: "Hangar 99",
    hangarSqft: 38000,
    rampSqft: 25000,
    door: { width: 110, height: 28 },        // ft
    fits: [
      "2× Challenger 605/650",
      "or 1× Challenger 350 + 2× Citation",
      "or 4× Citation Sovereign"
    ],
    available: true,
    availableLabel: "Available Q3 2026",
  },
  "98": {
    number: "98",
    name: "Hangar 98",
    hangarSqft: 12000,
    rampSqft: 20000,
    door: { width: 80, height: 22 },
    fits: [
      "1× Challenger 350",
      "or 2× Citation Sovereign",
      "or 2× Hawker 800/900"
    ],
    available: false,
    availableLabel: "Currently leased",
  },
  "1010": {
    number: "1010",
    name: "Hangar 1010",
    hangarSqft: 10000,
    rampSqft: 10000,
    door: { width: 70, height: 20 },
    fits: [
      "1× Citation X / Sovereign",
      "or 1× Hawker 800XP",
      "or 1× Challenger 300"
    ],
    available: true,
    availableLabel: "Available now",
  },
  "2100": {
    number: "2100",
    name: "Hangar 2100",
    hangarSqft: 20000,
    rampSqft: 60000,
    door: { width: 95, height: 26 },
    fits: [
      "1× Challenger 605/650",
      "or 2× Citation Sovereign",
      "or 2× Hawker 800/900"
    ],
    available: false,
    availableLabel: "Currently leased",
  },
};

window.HANGAR_ORDER = ["99", "98", "1010", "2100"];

// Single brand-aligned theme — replaces the old multi-theme system
window.MAP_THEME = {
  // Surfaces
  bg: "#F4F1EC",
  bgGradient: "radial-gradient(ellipse at 50% 25%, #ffffff 0%, #ece8e1 80%)",
  panelBg: "#ffffff",
  panelBorder: "rgba(15,24,40,0.10)",
  panelShadow: "0 24px 60px rgba(15,40,80,0.14), 0 4px 14px rgba(15,40,80,0.06)",
  surfaceCard: "#F8F6F2",

  // Type
  text: "#0F1828",
  textMuted: "#6A7280",
  textFaint: "#9AA3B2",

  // Brand
  accent: "#134B7A",       // Plane Place navy
  accent2: "#1E9FD8",      // Plane Place light blue
  accentDark: "#0E3A60",
  warning: "#C24F2E",      // for AOG / leased indicators

  // Map elements
  hangarFill: "#134B7A",
  hangarHover: "#0E3A60",
  hangarActive: "#1E9FD8",
  rampFill: "#B4B8BD",
  rampHover: "#9CA0A6",
  rampActive: "#D4E9F5",
  taxiwayLine: "#1E9FD8",
};

// Airport facts shown in the chrome
window.AIRPORT_INFO = {
  icao: "KCTP",
  iata: "CPT",
  name: "Cleburne Regional Airport",
  cityState: "Cleburne, Texas",
  coords: { lat: "32°21′13″N", lon: "97°25′59″W" },
  elevation: "854 ft MSL",
  runway: {
    designation: "15/33",
    length: "5,778 ft",
    width: "100 ft",
    surface: "Asphalt",
  },
};

// Company info for header
window.COMPANY_INFO = {
  name: "Plane Place Aviation",
  certification: "FAA Part 145 Repair Station · LP3R890Y",
  authorizations: "Hawker · Citation · Challenger",
  aog: "(817) 768-8884",
};
