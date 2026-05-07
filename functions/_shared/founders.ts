// Server-side founder email map.
//
// Held in functions/ (not src/) so the addresses are NEVER bundled into
// client JS — preventing email scraping. The website only knows the slug;
// the worker resolves it to a real address here.

export interface FounderRecord {
  name: string;
  email: string;
}

export const FOUNDER_EMAILS: Record<string, FounderRecord> = {
  tristan: { name: "Tristan Noe", email: "tristan@ppa.aero" },
  travis: { name: "Travis Roberson", email: "travis@ppa.aero" },
};
