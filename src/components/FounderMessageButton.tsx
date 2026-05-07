"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Turnstile } from "./Turnstile";

const TURNSTILE_SITE_KEY = "0x4AAAAAADJznk9rZYC4F2WZ";

interface Founder {
  name: string;
  title: string;
  slug: string;
}

interface FounderMessageButtonProps {
  founder: Founder;
  variant?: "default" | "footer";
}

export function FounderMessageButton({ founder, variant = "default" }: FounderMessageButtonProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus management
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        const target = dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]");
        target?.focus();
      });
    } else if (triggerRef.current) {
      // Only restore focus if the trigger button is still in the DOM
      // (avoids stealing focus on first render when open is false)
    }
  }, [open]);

  const triggerClassName =
    variant === "footer"
      ? "text-sm text-ppa-gray hover:text-ppa-brass transition-colors inline-flex items-center gap-1.5"
      : "text-sm text-ppa-gray hover:text-ppa-brass transition-colors inline-flex items-center gap-1.5";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
        aria-haspopup="dialog"
      >
        <span>Send Message</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>

      {open ? (
        <div
          // z must clear Leaflet's max z-index (~1000 on .leaflet-top/bottom)
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ppa-black/65 backdrop-blur-sm"
            tabIndex={-1}
          />

          {/* Modal */}
          <div
            ref={dialogRef}
            className="relative bg-ppa-white max-w-lg w-full max-h-[90vh] overflow-y-auto border border-ppa-border shadow-2xl"
          >
            <button
              data-autofocus
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 text-ppa-muted hover:text-ppa-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px w-6 bg-ppa-brass" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-brass">
                  Direct Message
                </span>
              </div>
              <h3 id={titleId} className="font-display text-2xl text-ppa-black leading-tight">
                Send {founder.name} a message
              </h3>
              <p className="mt-1 text-sm text-ppa-muted">{founder.title}</p>

              <form action="/contact" method="POST" className="mt-6 space-y-4">
                <input type="hidden" name="recipient" value={founder.slug} />
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] w-px h-px opacity-0"
                />

                <div>
                  <label htmlFor={`${titleId}-name`} className="form-label">
                    Name *
                  </label>
                  <input
                    id={`${titleId}-name`}
                    type="text"
                    name="name"
                    required
                    className="form-input"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor={`${titleId}-email`} className="form-label">
                    Email *
                  </label>
                  <input
                    id={`${titleId}-email`}
                    type="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor={`${titleId}-phone`} className="form-label">
                    Phone
                  </label>
                  <input
                    id={`${titleId}-phone`}
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor={`${titleId}-message`} className="form-label">
                    Message *
                  </label>
                  <textarea
                    id={`${titleId}-message`}
                    name="message"
                    required
                    rows={5}
                    className="form-input resize-none"
                    placeholder={`What can ${founder.name.split(" ")[0]} help you with?`}
                  />
                </div>

                <Turnstile siteKey={TURNSTILE_SITE_KEY} />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-dark border border-ppa-border hover:bg-ppa-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-ppa-brass"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
