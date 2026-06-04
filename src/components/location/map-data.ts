// KCTP facility map — design tokens, hangar specs, airport facts.
// Ported from design_handoff_kctp_facility_map/_reference/map-data.js.

export interface MapTheme {
  bg: string;
  bgGradient: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  surfaceCard: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accent2: string;
  accentDark: string;
  warning: string;
  hangarFill: string;
  hangarHover: string;
  hangarActive: string;
  rampFill: string;
  rampHover: string;
  rampActive: string;
  taxiwayLine: string;
}

export const MAP_THEME: MapTheme = {
  bg: "#F4F1EC",
  bgGradient: "radial-gradient(ellipse at 50% 25%, #ffffff 0%, #ece8e1 80%)",
  panelBg: "#ffffff",
  panelBorder: "rgba(15,24,40,0.10)",
  panelShadow: "0 24px 60px rgba(15,40,80,0.14), 0 4px 14px rgba(15,40,80,0.06)",
  surfaceCard: "#F8F6F2",
  text: "#0F1828",
  textMuted: "#6A7280",
  textFaint: "#9AA3B2",
  accent: "#134B7A",
  accent2: "#1E9FD8",
  accentDark: "#0E3A60",
  warning: "#C24F2E",
  hangarFill: "#134B7A",
  hangarHover: "#0E3A60",
  hangarActive: "#1E9FD8",
  rampFill: "#B4B8BD",
  rampHover: "#9CA0A6",
  rampActive: "#D4E9F5",
  taxiwayLine: "#1E9FD8",
};

export interface AirportInfo {
  icao: string;
  iata: string;
  name: string;
  cityState: string;
  coords: { lat: string; lon: string };
  elevation: string;
  runway: {
    designation: string;
    length: string;
    width: string;
    surface: string;
  };
}

export const AIRPORT_INFO: AirportInfo = {
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

export const SITE_COPY = {
  eyebrow: "Location",
  heading: "Cleburne, Texas — KCPT",
  body:
    "80,000 sq ft of hangar space across four hangars at Cleburne Regional Airport — 30 minutes south of DFW. Lower operating costs than Love Field or Addison translate directly to better value for our customers, with comfortable lounge and office space for visiting crews.",
  address1: "1650 Airport Dr, Hangar 98",
  address2: "Cleburne, TX 76033",
  directionsHref:
    "https://www.google.com/maps/dir/?api=1&destination=1650+Airport+Dr+Cleburne+TX+76033",
};

export const STATS = [
  { label: "Hangars", value: "4" },
  { label: "Hangar sqft", value: "80k" },
  { label: "Ramp sqft", value: "115k" },
] as const;

export const HANGAR_LABELS: Record<string, string> = {
  "99": "Hangar 99 — primary maintenance bay",
  "98": "Hangar 98 — primary maintenance bay",
  "1010": "Hangar 1010 — maintenance bay",
  "2100": "Hangar 2100 — maintenance bay",
};

export interface HangarSpec {
  number: string;
  name: string;
  hangarSqft: number;
  rampSqft: number;
  door: { width: number; height: number };
  available: boolean;
}

export const HANGAR_DATA: Record<string, HangarSpec> = {
  "99": {
    number: "99",
    name: "Hangar 99",
    hangarSqft: 38000,
    rampSqft: 25000,
    door: { width: 110, height: 28 },
    available: true,
  },
  "98": {
    number: "98",
    name: "Hangar 98",
    hangarSqft: 12000,
    rampSqft: 20000,
    door: { width: 80, height: 22 },
    available: false,
  },
  "1010": {
    number: "1010",
    name: "Hangar 1010",
    hangarSqft: 10000,
    rampSqft: 10000,
    door: { width: 70, height: 20 },
    available: true,
  },
  "2100": {
    number: "2100",
    name: "Hangar 2100",
    hangarSqft: 20000,
    rampSqft: 60000,
    door: { width: 95, height: 26 },
    available: false,
  },
};
