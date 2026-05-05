"use client";

import { useEffect, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  "missing-fields": "Please fill in all required fields and try again.",
  "invalid-email": "That email address looks invalid. Please double-check and try again.",
  "invalid-request": "Something went wrong with your submission. Please try again.",
  "attachments-too-large": "Your attachments exceed the 25MB total limit. Please reduce file sizes and try again.",
  "send-failed": "We couldn't deliver your request. Please try again, or call us directly at (817) 768-8884.",
};

export function QuoteErrorBanner() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("error");
    if (code && ERROR_MESSAGES[code]) {
      setError(ERROR_MESSAGES[code]);
    }
  }, []);

  if (!error) return null;

  return (
    <div
      role="alert"
      className="mb-8 border border-red-200 bg-red-50 p-4 text-sm text-red-900"
    >
      <strong className="font-semibold">Submission error.</strong> {error}
    </div>
  );
}
