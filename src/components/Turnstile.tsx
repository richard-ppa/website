"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      if (window.turnstile) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Turnstile script failed to load")), { once: true });
      }
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(s);
  });

  return scriptLoadPromise;
}

export function Turnstile({ siteKey }: { siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | null = null;
    const widgetEl = ref.current;
    const form = widgetEl?.closest("form") || null;

    const submitButtons: HTMLButtonElement[] = form
      ? Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="submit"], button:not([type])'))
      : [];

    const setSubmitDisabled = (disabled: boolean) => {
      submitButtons.forEach((b) => {
        b.disabled = disabled;
      });
    };

    setSubmitDisabled(true);

    // Submit handler: swap button content to spinner + "Sending…" so the user
    // gets visual feedback while the multipart upload + server-side scan runs.
    const handleSubmit = (e: Event) => {
      const tokenInput = form?.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
      if (!tokenInput || !tokenInput.value) {
        e.preventDefault();
        return;
      }
      submitButtons.forEach((b) => {
        if (b.dataset.submitting === "true") return;
        b.dataset.submitting = "true";
        b.dataset.originalHtml = b.innerHTML;
        b.innerHTML =
          '<span class="inline-flex items-center justify-center gap-2">' +
          '<span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span>' +
          '<span>Sending…</span>' +
          '</span>';
        b.disabled = true;
        b.style.cursor = "wait";
      });
    };
    form?.addEventListener("submit", handleSubmit);

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme: "light",
          callback: () => {
            if (cancelled) return;
            setVerified(true);
            setSubmitDisabled(false);
          },
          "expired-callback": () => {
            if (cancelled) return;
            setVerified(false);
            setSubmitDisabled(true);
            if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
          },
          "error-callback": () => {
            if (cancelled) return;
            setVerified(false);
            setSubmitDisabled(true);
          },
        });
      })
      .catch((err) => {
        console.error("Turnstile load failed", err);
      });

    return () => {
      cancelled = true;
      form?.removeEventListener("submit", handleSubmit);
      // Re-enable in case form/widget remounts elsewhere
      setSubmitDisabled(false);
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // widget may already be detached during unmount; safe to ignore
        }
      }
    };
  }, [siteKey]);

  return (
    <div>
      <div ref={ref} />
      {!verified ? (
        <p className="mt-2 text-xs text-ppa-muted">Verifying you&apos;re human… please wait.</p>
      ) : null}
    </div>
  );
}
