"use client";

// Fires a Google Analytics 4 conversion event on mount. Use on thank-you /
// confirmation pages so the conversion is tied to the user's existing GA
// session (which already has source/medium/referrer attribution from GA's
// default tracking).

import { useEffect } from "react";

interface TrackConversionProps {
  /** GA4 event name. Use "generate_lead" for any lead-capture form. */
  event: string;
  /** Lead source label (e.g., "quote" / "contact" / "career"). Sent as event_label. */
  type: "quote" | "contact" | "career";
}

type Gtag = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export function TrackConversion({ event, type }: TrackConversionProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", event, {
      event_category: "lead",
      event_label: type,
      lead_type: type,
    });
  }, [event, type]);
  return null;
}
