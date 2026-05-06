"use client";

import { useEffect, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  "missing-fields": "Please fill in all required fields and try again.",
  "invalid-email": "That email address looks invalid. Please double-check and try again.",
  "invalid-request": "Something went wrong with your submission. Please try again.",
  "turnstile-failed": "Anti-spam check failed. Please refresh the page and try again.",
  "too-many-files": "Maximum 5 files per submission. Please reduce the number and try again.",
  "attachments-too-large": "Your attachments exceed the 25MB total limit. Please reduce file sizes and try again.",
  "file-too-large": "One of your files exceeds the 10MB limit. Please reduce the file size and try again.",
  "file-type-not-allowed": "Only PDF and Excel files (.pdf, .xls, .xlsx) are allowed.",
  "file-magic-mismatch": "One of your files appears corrupted or doesn't match its file type. Please re-export and try again.",
  "virus-detected": "One of your files was flagged as potentially malicious and has been rejected. Please scan it locally and try again, or call us directly.",
  "scan-failed": "We couldn't complete the security scan on your files. Please try again in a few minutes, or call us directly at (817) 768-8884.",
  "storage-failed": "We couldn't store your attachment. Please try again, or call us directly at (817) 768-8884.",
  "send-failed": "We couldn't deliver your request. Please try again, or call us directly at (817) 768-8884.",
};

export function FormErrorBanner() {
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
