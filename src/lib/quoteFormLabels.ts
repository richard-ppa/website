// Quote form select options + label lookups.
// Source of truth for service/timeline display strings.
//
// NOTE: functions/quote.ts mirrors these maps inline (Cloudflare Pages
// Functions are bundled separately and cannot import from src/). If you
// change these, also update the mirrors in functions/quote.ts.

export const SERVICE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "scheduled", label: "Scheduled Maintenance / Phase Inspection" },
  { value: "ppi", label: "Pre-Purchase Inspection" },
  { value: "aog", label: "AOG / Emergency Service" },
  { value: "structural", label: "Structural Repair" },
  { value: "avionics", label: "Avionics" },
  { value: "management", label: "Maintenance Management" },
  { value: "other", label: "Other" },
];

export const TIMELINE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "asap", label: "ASAP / AOG" },
  { value: "30days", label: "Within 30 days" },
  { value: "60days", label: "Within 60 days" },
  { value: "90days", label: "Within 90 days" },
  { value: "planning", label: "Just planning ahead" },
];

const SERVICE_LABELS: Record<string, string> = Object.fromEntries(
  SERVICE_OPTIONS.map((o) => [o.value, o.label])
);
const TIMELINE_LABELS: Record<string, string> = Object.fromEntries(
  TIMELINE_OPTIONS.map((o) => [o.value, o.label])
);

export function serviceLabel(value: string | undefined | null): string {
  if (!value) return "";
  return SERVICE_LABELS[value] ?? value;
}

export function timelineLabel(value: string | undefined | null): string {
  if (!value) return "";
  return TIMELINE_LABELS[value] ?? value;
}
