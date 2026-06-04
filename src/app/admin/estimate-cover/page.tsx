"use client";

// ------------------------------------------------------------------
// /admin/estimate-cover
// Drop-in replacement for src/app/admin/estimate-cover/page.tsx
//
// What this gives you:
//   ⬢ Three cover layouts (Editorial / Split / Portrait) selectable inline
//   ⬢ Per-airframe image picker - Single image or 3-image Collage
//   ⬢ Upload customer's estimate PDF -  merges your cover as page 1
//   ⬢ Print Cover Only opens a print-ready window with the rasterized cover
//   ⬢ Captures at 300 DPI as JPEG for sharp output at email-friendly size
//
// Runtime deps (no npm install required - loaded via next/script):
//   - pdf-lib (UMD: window.PDFLib)
//   - html2canvas-pro (UMD: window.html2canvas) - community fork of
//     html2canvas with many rendering bug fixes; same API surface so the
//     existing capture code works unchanged.
//
// Images: uses files already in /public/images/ - adjust the AIRFRAMES
// arrays below if you want to point at different shots.
// ------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { COMPANY } from "@/lib/constants";
import { LEADERSHIP_PREPARERS, findPreparer } from "@/lib/team";

// --- Types --------------------------------------------------------
type AirframeKey = "Hawker" | "Citation" | "Challenger";
type HeroMode = "single" | "collage";

interface AirframeMeta {
  label: string;
  tagline: string;
  hangar: string;
  models: string[];
  images: string[];
}

declare global {
  interface Window {
    PDFLib?: {
      PDFDocument: {
        create: () => Promise<PDFDocLike>;
        load: (bytes: ArrayBuffer, opts?: { ignoreEncryption?: boolean }) => Promise<PDFDocLike>;
      };
    };
    html2canvas?: (el: HTMLElement, opts?: Html2CanvasOpts) => Promise<HTMLCanvasElement>;
  }
}

interface Html2CanvasOpts {
  scale?: number;
  backgroundColor?: string | null;
  useCORS?: boolean;
  logging?: boolean;
  imageTimeout?: number;
  onclone?: (doc: Document) => void;
}

interface PDFImageLike {
  width: number;
  height: number;
}
interface PDFPageLike {
  drawImage: (img: PDFImageLike, opts: { x: number; y: number; width: number; height: number }) => void;
}
interface PDFDocLike {
  addPage: (size?: [number, number]) => PDFPageLike;
  embedJpg: (bytes: ArrayBuffer) => Promise<PDFImageLike>;
  embedPng: (bytes: ArrayBuffer) => Promise<PDFImageLike>;
  copyPages: (other: PDFDocLike, indices: number[]) => Promise<PDFPageLike[]>;
  getPageIndices: () => number[];
  save: () => Promise<Uint8Array>;
}

// --- Airframe data (high-res shots in /public/images/aircraft/) ---
const AIRFRAMES: Record<AirframeKey, AirframeMeta> = {
  Hawker: {
    label: "Hawker",
    tagline: "Hawker Beechcraft",
    hangar: "Hangar 2100",
    models: ["800", "800XP", "850XP", "900XP", "1000"],
    images: [
      "/images/aircraft/hawker-1.jpg",
      "/images/aircraft/hawker-2.jpg",
      "/images/aircraft/hawker-3.jpg",
      "/images/aircraft/hawker-4.jpg",
    ],
  },
  Citation: {
    label: "Citation",
    tagline: "Cessna Citation",
    hangar: "Hangar 98",
    models: ["550", "560", "560XL", "560XLS", "650", "680"],
    images: [
      "/images/aircraft/citation-1.jpg",
      "/images/aircraft/citation-2.jpg",
      "/images/aircraft/citation-3.jpg",
      "/images/aircraft/citation-4.jpg",
      "/images/aircraft/citation-5.jpg",
      "/images/aircraft/citation-6.png",
      "/images/aircraft/citation-7.png",
    ],
  },
  Challenger: {
    label: "Challenger",
    tagline: "Bombardier Challenger",
    hangar: "Hangar 98",
    models: ["300", "350", "604", "605", "650"],
    images: [
      "/images/aircraft/challenger-1.jpg",
      "/images/aircraft/challenger-2.jpg",
      "/images/aircraft/challenger-3.jpg",
      "/images/aircraft/challenger-4.jpg",
    ],
  },
};

// --- Helpers ------------------------------------------------------
const fmtMoney = (v: string) => {
  if (!v) return "-";
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  if (isNaN(n)) return "-";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

const todayStr = () =>
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// Document-type prefixes used on the cover. Selected per-cover from the form.
//   - "quote"    -  original customer quote -  prefix QKCTP
//   - "estimate" -  addendum for an aircraft already in the shop -  prefix KCTP
type DocType = "quote" | "estimate";
type DowntimeUnit = "business" | "calendar" | "weeks";
const DOWNTIME_UNIT_LABEL: Record<DowntimeUnit, string> = {
  business: "Business Days",
  calendar: "Calendar Days",
  weeks: "Weeks",
};
const DOWNTIME_UNIT_SHORT: Record<DowntimeUnit, string> = {
  business: "days",
  calendar: "days",
  weeks: "weeks",
};
const DOC_TYPE_PREFIX: Record<DocType, string> = {
  quote: "QKCTP",
  estimate: "KCTP",
};
const DOC_TYPE_LABEL: Record<DocType, string> = {
  quote: "Quote",
  estimate: "Estimate",
};

// Compose the full document number ({prefix}-{number}) for display. Returns
// just the prefix if the user hasn't typed a number yet, so the placeholder
// reads sensibly in the preview.
const formatDocNo = (docType: DocType, num: string): string => {
  const prefix = DOC_TYPE_PREFIX[docType];
  const trimmed = num.trim();
  return trimmed ? `${prefix}-${trimmed}` : prefix;
};

const fmtBytes = (b: number) => {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
};

// --- Cover capture + PDF merge -----------------------------------
async function captureCoverImageBytes(coverEl: HTMLElement) {
  if (!window.html2canvas) throw new Error("html2canvas not loaded yet - try again in a moment.");
  // Wait for web fonts to fully load before capture so text renders with
  // the correct font (otherwise html2canvas can rasterize with a fallback
  // whose metrics shift the layout slightly).
  if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* non-fatal - fall through and let html2canvas do its best */
    }
  }
  const canvas = await window.html2canvas(coverEl, {
    // Scale 3 for higher-resolution capture. Small elements like the
    // headshot circle and footer text benefit significantly from the extra
    // pixels at print zoom.
    scale: 3,
    backgroundColor: "#F7F6F3",
    useCORS: true,
    logging: false,
    imageTimeout: 15000,
    onclone: (doc: Document) => {
      const ps = doc.querySelector(".preview-scale") as HTMLElement | null;
      if (ps) ps.style.transform = "none";
    },
  });
  // JPEG at 0.95 quality — the cover content is mostly photographic
  // (aircraft hero + headshot) where JPEG handles compression
  // gracefully. The other quality improvements (high-res source PNGs,
  // img-tag headshot rendering, scale-3 capture) carry visual fidelity
  // here; the format itself shouldn't be the bottleneck.
  // Tradeoff: PNG output produced ~7 MB merged PDFs. JPEG @ 0.95 lands
  // around 1 MB with no perceptible quality loss for photographic content.
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const bytes = await (await fetch(dataUrl)).arrayBuffer();
  return { bytes, dataUrl };
}

async function mergeCoverWithEstimate(coverEl: HTMLElement, file: File, filename: string) {
  if (!window.PDFLib) throw new Error("pdf-lib not loaded yet - try again in a moment.");
  const { bytes: jpgBytes } = await captureCoverImageBytes(coverEl);
  const { PDFDocument } = window.PDFLib;
  const mergedDoc = await PDFDocument.create();
  const coverImg = await mergedDoc.embedJpg(jpgBytes);
  const coverPage = mergedDoc.addPage([612, 792]); // US Letter, points
  coverPage.drawImage(coverImg, { x: 0, y: 0, width: 612, height: 792 });

  // Append the user's estimate pages
  const userBytes = await file.arrayBuffer();
  const userPdf = await PDFDocument.load(userBytes, { ignoreEncryption: true });
  const copied = await mergedDoc.copyPages(userPdf, userPdf.getPageIndices());
  for (const p of copied) {
    // pdf-lib accepts a PDFPage to addPage at runtime
    (mergedDoc as unknown as { addPage: (p: unknown) => void }).addPage(p);
  }

  const mergedBytes = await mergedDoc.save();
  // Cast: pdf-lib types save() as Uint8Array, which under TS 5.7+ lib.dom
  // can hold a SharedArrayBuffer - Blob() rejects that variant. The runtime
  // value is always a regular Uint8Array, so the cast is safe.
  const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

async function printCover(coverEl: HTMLElement) {
  const { dataUrl } = await captureCoverImageBytes(coverEl);
  const w = window.open("", "_blank");
  if (!w) throw new Error("Couldn't open print window - check your popup blocker.");
  w.document.write(`<!DOCTYPE html><html><head><title>Estimate Cover Page</title>
<style>
  @page { size: Letter; margin: 0; }
  html, body { margin: 0; padding: 0; background: white; }
  img { display: block; width: 8.5in; height: 11in; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body><img src="${dataUrl}" alt="Estimate Cover Page" /></body></html>`);
  w.document.close();
  const fire = () => { w.focus(); w.print(); };
  if (w.document.readyState === "complete") setTimeout(fire, 200);
  else w.addEventListener("load", fire);
}

// --- Page ---------------------------------------------------------
export default function EstimateCoverPage() {
  // Form state
  const [airframe, setAirframe] = useState<AirframeKey>("Hawker");
  const [customer, setCustomer] = useState("");
  const [make, setMake] = useState("Hawker");
  const [model, setModel] = useState("");
  const [tail, setTail] = useState("");
  const [total, setTotal] = useState("");
  const [downtime, setDowntime] = useState("");
  const [downtimeUnit, setDowntimeUnit] = useState<DowntimeUnit>("business");
  const [docType, setDocType] = useState<DocType>("estimate");
  const [estNo, setEstNo] = useState("");
  const [date, setDate] = useState(() => todayStr());
  const [preparedBy, setPreparedBy] = useState(LEADERSHIP_PREPARERS[0].name);
  const [scopeMain, setScopeMain] = useState("");
  const [scopeKind, setScopeKind] = useState("");

  // Display state (Portrait is the only layout; toggle controls single vs collage)
  const [heroMode, setHeroMode] = useState<HeroMode>("collage");
  const [selectedImgs, setSelectedImgs] = useState<number[]>([0, 1, 2]);

  // PDF merge state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [mergeBusy, setMergeBusy] = useState(false);
  const [mergeError, setMergeError] = useState("");

  // Refs
  const coverRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const af = AIRFRAMES[airframe];

  // Reset image selection when airframe changes
  useEffect(() => {
    const max = heroMode === "single" ? 1 : 3;
    setSelectedImgs([0, 1, 2].slice(0, Math.min(max, af.images.length)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airframe]);

  // Resize selection when hero mode flips
  useEffect(() => {
    if (heroMode === "single") {
      setSelectedImgs((prev) => (prev.length ? [prev[0]] : [0]));
    } else {
      setSelectedImgs((prev) => {
        const next = [...prev];
        let i = 0;
        while (next.length < 3 && i < af.images.length) {
          if (!next.includes(i)) next.push(i);
          i++;
        }
        return next.slice(0, 3);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroMode]);

  // Fit-to-stage scaling
  const [scale, setScale] = useState(0.7);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const PAD = 32;
      const w = el.clientWidth - PAD;
      const h = el.clientHeight - PAD;
      if (w <= 0 || h <= 0) return;
      const s = Math.min(w / 850, h / 1100, 1.2);
      setScale(s);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 200);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
      clearTimeout(t);
    };
  }, []);

  // Helpers
  const imgAt = (i: number) =>
    af.images[(selectedImgs[i] ?? i) % af.images.length];
  const hero = imgAt(0);
  const customerLine = customer || "Customer Name";
  const modelLine = [make || af.label, model].filter(Boolean).join(" ");
  const tailDisplay = tail || "REG#";

  // Actions
  const onPrint = async () => {
    setMergeError("");
    try {
      const coverEl = coverRef.current?.querySelector(".cover") as HTMLElement | null;
      if (!coverEl) throw new Error("Cover not ready");
      await printCover(coverEl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Couldn't open print window.";
      setMergeError(msg);
    }
  };

  const onMerge = async () => {
    if (!pdfFile) return;
    setMergeBusy(true);
    setMergeError("");
    try {
      const coverEl = coverRef.current?.querySelector(".cover") as HTMLElement | null;
      if (!coverEl) throw new Error("Cover not ready");
      const safeTail = (tail || "REG").replace(/[^A-Z0-9]/gi, "");
      const safeName = (customer || "Estimate")
        .replace(/[^A-Za-z0-9_-]+/g, "_")
        .slice(0, 40);
      const outName = `${DOC_TYPE_LABEL[docType]}_${safeName}_${safeTail}.pdf`;
      await mergeCoverWithEstimate(coverEl, pdfFile, outName);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Couldn't merge the PDF.";
      setMergeError(msg);
    } finally {
      setMergeBusy(false);
    }
  };

  const onReset = () => {
    setCustomer("");
    setAirframe("Hawker");
    setMake("Hawker");
    setModel("");
    setTail("");
    setTotal("");
    setDowntime("");
    setDowntimeUnit("business");
    setEstNo("");
    setDocType("estimate");
    setScopeMain("");
    setScopeKind("");
    setDate(todayStr());
    setPdfFile(null);
    setMergeError("");
  };

  const toggleImg = (i: number) => {
    const has = selectedImgs.indexOf(i);
    if (heroMode === "single") {
      setSelectedImgs([i]);
      return;
    }
    if (has >= 0) {
      if (selectedImgs.length === 1) return;
      setSelectedImgs(selectedImgs.filter((x) => x !== i));
    } else if (selectedImgs.length < 3) {
      setSelectedImgs([...selectedImgs, i]);
    } else {
      setSelectedImgs([...selectedImgs.slice(0, 2), i]);
    }
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setMergeError("Please choose a PDF file.");
      return;
    }
    setMergeError("");
    setPdfFile(f);
  };

  return (
    <>
      {/* Load Archivo directly from Google Fonts under its canonical name.
          Next.js's font loader (next/font/google) hashes the family name
          (e.g. __Archivo_a9a7IW), which the browser resolves via the
          --font-archivo CSS variable - but html2canvas-pro reads the
          computed font-family and tries to render with that hashed name,
          which Canvas's text API can't find. Loading the font under the
          literal "Archivo" name here means both renderers resolve it. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap"
      />

      <Script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js" strategy="afterInteractive" />

      <CoverStyles />

      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-8 lg:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-8 bg-ppa-brass" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
            Internal Tool
          </span>
        </div>
        <h1 className="font-display text-3xl lg:text-4xl text-ppa-black leading-tight mb-2">
          Estimate Cover Page
        </h1>
        <p className="text-sm text-ppa-gray font-light mb-8 max-w-2xl">
          Fill the form and the cover updates live. Upload a customer&apos;s
          estimate PDF to prepend this cover as page 1 and download the merged
          file. Print Cover Only opens a print-ready window with the cover at
          US Letter.
        </p>

        <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
          {/* --- Form panel --------------------------------- */}
          <div className="bg-white border border-ppa-border">
            <div className="p-6 space-y-6">
              {/* Airframe */}
              <Section label="Airframe">
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(AIRFRAMES) as AirframeKey[]).map((key) => {
                    const on = airframe === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setAirframe(key);
                          setMake(key);
                          setModel("");
                        }}
                        className={
                          "flex flex-col gap-0.5 text-left px-2.5 py-2.5 border transition-colors " +
                          (on
                            ? "bg-ppa-navy border-ppa-navy text-white"
                            : "bg-white border-ppa-border text-ppa-black hover:border-ppa-navy")
                        }
                      >
                        <span className="text-[13px] font-bold">{AIRFRAMES[key].label}</span>
                        <span
                          className={
                            "text-[9px] uppercase tracking-[0.1em] font-medium " +
                            (on ? "text-white/65" : "text-ppa-muted")
                          }
                        >
                          {AIRFRAMES[key].tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Hero images */}
              <Section label="Hero images">
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {(["single", "collage"] as HeroMode[]).map((m) => {
                    const on = heroMode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setHeroMode(m)}
                        className={
                          "px-2 py-2 text-[12px] font-bold tracking-wide capitalize border transition-colors " +
                          (on
                            ? "bg-ppa-navy border-ppa-navy text-white"
                            : "bg-white border-ppa-border text-ppa-black hover:border-ppa-navy")
                        }
                      >
                        {m === "single" ? "Single image" : "Collage"}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {af.images.map((src, i) => {
                    const slot = selectedImgs.indexOf(i);
                    const on = slot >= 0;
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => toggleImg(i)}
                        className={
                          "relative aspect-[4/3] bg-cover bg-center border-2 transition-colors " +
                          (on ? "border-ppa-brass" : "border-transparent hover:outline hover:outline-1 hover:outline-ppa-navy")
                        }
                        style={{ backgroundImage: `url("${src}")`, outline: on ? "none" : "1px solid var(--color-ppa-border)" }}
                        aria-label={`Image ${i + 1}${on ? " (selected)" : ""}`}
                      >
                        {on && (
                          <span className="absolute top-1 left-1 min-w-[20px] h-[20px] px-1.5 bg-ppa-brass text-white text-[11px] font-bold inline-flex items-center justify-center leading-none">
                            {heroMode === "collage" ? slot + 1 : "-S"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {heroMode === "collage" && (
                  <p className="text-[11px] text-ppa-muted mt-2">
                    Pick three. First is the large image; the others stack to the right.
                  </p>
                )}
              </Section>

              {/* Customer / Aircraft / Estimate fields */}
              <Section label="Customer">
                <Field label="Customer Name">
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g. Lone Star Aviation LLC"
                    className="form-input"
                  />
                </Field>
              </Section>

              <Section label="Aircraft">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Make">
                    <input
                      type="text"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder={af.label}
                      className="form-input"
                    />
                  </Field>
                  <Field label="Model">
                    <select value={model} onChange={(e) => setModel(e.target.value)} className="form-input form-select">
                      <option value="">Select model…</option>
                      {af.models.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Registration Number">
                  <input
                    type="text"
                    value={tail}
                    onChange={(e) => setTail(e.target.value.toUpperCase())}
                    placeholder="N123PP"
                    style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
                    className="form-input"
                  />
                </Field>
              </Section>

              <Section label={DOC_TYPE_LABEL[docType]}>
                <Field label={`${DOC_TYPE_LABEL[docType]} Total`} hint="Numbers only - formatting added automatically.">
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-ppa-muted font-semibold pointer-events-none">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={total}
                      onChange={(e) => setTotal(e.target.value)}
                      placeholder="142,500"
                      className="form-input"
                      // Inline style overrides .form-input's default
                      // padding-left so the dollar-sign prefix has room.
                      style={{ paddingLeft: "26px" }}
                    />
                  </div>
                </Field>
                <Field label={`Estimated Downtime (${DOWNTIME_UNIT_SHORT[downtimeUnit]})`} hint={`Single number or range (e.g. 4-6). "${DOWNTIME_UNIT_LABEL[downtimeUnit]}" is appended automatically.`}>
                  <input
                    type="text"
                    inputMode="text"
                    value={downtime}
                    onChange={(e) => setDowntime(e.target.value.replace(/[^0-9.\-\s]/g, ""))}
                    placeholder={downtimeUnit === "weeks" ? "4-6" : "10-14"}
                    className="form-input"
                  />
                </Field>
                <Field label="Downtime unit">
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["business", "calendar", "weeks"] as DowntimeUnit[]).map((u) => {
                      const on = downtimeUnit === u;
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setDowntimeUnit(u)}
                          className={
                            "px-2 py-2 text-[12px] font-bold tracking-wide border transition-colors " +
                            (on
                              ? "bg-ppa-navy border-ppa-navy text-white"
                              : "bg-white border-ppa-border text-ppa-black hover:border-ppa-navy")
                          }
                        >
                          {DOWNTIME_UNIT_LABEL[u]}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </Section>

              <Section label="Work Scope">
                <Field label="Scope (display)" hint="Big-type headline. Use | to separate items, e.g. E | F | G.">
                  <input
                    type="text"
                    value={scopeMain}
                    onChange={(e) => setScopeMain(e.target.value)}
                    placeholder="Phase 64"
                    className="form-input"
                  />
                </Field>
                <Field label="Scope kind" hint="Subhead under the display text. Leave blank if N/A.">
                  <input
                    type="text"
                    value={scopeKind}
                    onChange={(e) => setScopeKind(e.target.value)}
                    placeholder="Inspection"
                    className="form-input"
                  />
                </Field>
              </Section>

              <Section label="Estimate PDF">
                {!pdfFile ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                    onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).classList.add("is-over"); }}
                    onDragLeave={(e) => (e.currentTarget as HTMLElement).classList.remove("is-over")}
                    onDrop={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).classList.remove("is-over");
                      onFile(e.dataTransfer.files?.[0]);
                    }}
                    className="file-drop flex items-center gap-3 p-3.5 border border-dashed border-ppa-border bg-white cursor-pointer hover:border-ppa-brass transition-colors"
                  >
                    <div className="flex-shrink-0 w-9 h-9 bg-ppa-light text-ppa-navy flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <strong className="text-[13px] font-bold text-ppa-black">Upload estimate PDF</strong>
                      <span className="text-[11px] text-ppa-muted">Drop here or click to choose · PDF only</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => onFile(e.target.files?.[0])}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border border-ppa-navy bg-white">
                    <div className="flex-shrink-0 w-8 h-8 bg-ppa-navy text-white flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="text-[13px] font-semibold text-ppa-black whitespace-nowrap overflow-hidden text-ellipsis">{pdfFile.name}</div>
                      <div className="text-[11px] text-ppa-muted">{fmtBytes(pdfFile.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="flex-shrink-0 p-1.5 text-ppa-muted hover:text-ppa-black hover:bg-ppa-light transition-colors"
                      aria-label="Remove file"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {mergeError && (
                  <div className="mt-2 px-2.5 py-2 bg-red-50 border-l-2 border-red-600 text-red-800 text-[12px] leading-snug">
                    {mergeError}
                  </div>
                )}
              </Section>

              <Section label="Document">
                <Field label="Document type">
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["quote", "estimate"] as DocType[]).map((t) => {
                      const on = docType === t;
                      const label = t === "quote" ? "Quote (QKCTP)" : "Estimate (KCTP)";
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setDocType(t)}
                          className={
                            "px-2 py-2 text-[12px] font-bold tracking-wide border transition-colors " +
                            (on
                              ? "bg-ppa-navy border-ppa-navy text-white"
                              : "bg-white border-ppa-border text-ppa-black hover:border-ppa-navy")
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label={`${DOC_TYPE_LABEL[docType]} #`}
                    hint={`Number only - "${DOC_TYPE_PREFIX[docType]}-" prefix is added automatically.`}
                  >
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-ppa-muted font-semibold pointer-events-none text-[12px]">
                        {DOC_TYPE_PREFIX[docType]}-
                      </span>
                      <input
                        type="text"
                        value={estNo}
                        onChange={(e) => setEstNo(e.target.value)}
                        placeholder="1234"
                        className="form-input"
                        style={{
                          paddingLeft: docType === "quote" ? "74px" : "62px",
                        }}
                      />
                    </div>
                  </Field>
                  <Field label="Date Prepared">
                    <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
                  </Field>
                </div>
                <Field label="Prepared By">
                  <select value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} className="form-input form-select">
                    {LEADERSHIP_PREPARERS.map((m) => (
                      <option key={m.name} value={m.name}>{m.name} · {m.title}</option>
                    ))}
                  </select>
                </Field>
              </Section>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-ppa-border p-4 flex gap-2">
              <button
                type="button"
                onClick={onMerge}
                disabled={!pdfFile || mergeBusy}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-ppa-brass disabled:bg-ppa-border disabled:cursor-not-allowed text-white text-[12px] font-bold uppercase tracking-[0.08em] hover:bg-ppa-brass-dark transition-colors"
                title={!pdfFile ? "Upload an estimate PDF first" : undefined}
              >
                {mergeBusy ? <Spinner /> : <DownloadIcon />}
                {mergeBusy ? "Building⬦" : "Merge & Download"}
              </button>
              <button
                type="button"
                onClick={onPrint}
                title="Print cover only"
                className="px-3.5 py-3 border border-ppa-border text-ppa-navy hover:border-ppa-navy transition-colors"
              >
                <PrinterIcon />
              </button>
              <button
                type="button"
                onClick={onReset}
                title="Reset form"
                className="px-3.5 py-3 border border-ppa-border text-ppa-navy hover:border-ppa-navy transition-colors"
              >
                <ResetIcon />
              </button>
            </div>
          </div>

          {/* --- Preview stage ----------------------------- */}
          <div
            ref={stageRef}
            className="relative bg-ppa-black overflow-hidden border border-ppa-border min-h-[760px] h-[calc(100vh-200px)]"
          >
            <div
              ref={coverRef}
              className="preview-scale absolute top-1/2 left-1/2"
              style={{
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
                filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.45))",
              }}
            >
              <CoverPortrait
                heroMode={heroMode}
                af={af}
                hero={hero}
                imgAt={imgAt}
                data={{
                  customerLine,
                  modelLine,
                  tailDisplay,
                  estNo,
                  docType,
                  date,
                  total,
                  downtime,
                  downtimeUnit,
                  preparedBy,
                  scopeMain,
                  scopeKind,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Small UI helpers --------------------------------------------
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ppa-muted pb-1 border-b border-ppa-border">
        {label}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ppa-black">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ppa-muted">{hint}</span>}
    </label>
  );
}

function PrinterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}
function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7M3 3v6h6" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2a10 10 0 1 0 10 10" />
    </svg>
  );
}

// --- Cover Page (the printed/captured artifact) -----------------
interface CoverData {
  customerLine: string;
  modelLine: string;
  tailDisplay: string;
  estNo: string;
  docType: DocType;
  date: string;
  total: string;
  downtime: string;
  downtimeUnit: DowntimeUnit;
  preparedBy: string;
  scopeMain: string;
  scopeKind: string;
}
/**
 * ScopeFit — text that fits its container by either shrinking font-size on
 * one line, or wrapping to multiple lines once shrinking would go too small.
 *
 * Flow on each render / resize:
 *   1) Start at maxPx with white-space: nowrap, measure overflow.
 *   2) If overflowing, step font-size down 1px at a time.
 *   3) Stop shrinking at wrapAtPx (default 26). Below that, readability tanks.
 *   4) If still overflowing at wrapAtPx, switch to multi-line mode
 *      (white-space: normal, line-height bumped so the lines don't touch).
 *      Font stays at wrapAtPx — the text just wraps to a second line.
 *
 * The inline style is set on the live DOM, which html2canvas-pro reads at
 * capture time — so the printed/merged PDF matches the on-screen preview.
 */
function ScopeFit({
  text,
  maxPx = 36,
  wrapAtPx = 26,
  className,
}: {
  text: string;
  maxPx?: number;
  wrapAtPx?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId = 0;
    const fit = () => {
      // requestAnimationFrame so we measure after the browser has applied
      // layout — measuring synchronously inside the effect can read stale
      // widths right after a sibling change.
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Phase 1: shrink to fit on one line, no smaller than wrapAtPx.
        el.style.whiteSpace = "nowrap";
        el.style.lineHeight = "1";
        let size = maxPx;
        el.style.fontSize = `${size}px`;
        let guard = 0;
        while (
          el.scrollWidth > el.clientWidth &&
          size > wrapAtPx &&
          guard < 200
        ) {
          size -= 1;
          el.style.fontSize = `${size}px`;
          guard++;
        }
        // Phase 2: if still overflowing at the wrap threshold, allow wrapping
        // to a second line at wrapAtPx. line-height bumps slightly so lines
        // don't touch.
        if (el.scrollWidth > el.clientWidth) {
          el.style.whiteSpace = "normal";
          el.style.lineHeight = "1.1";
          el.style.fontSize = `${wrapAtPx}px`;
        }
      });
    };
    fit();
    // Re-fit if the container resizes (e.g., preview stage scaling).
    const ro = new ResizeObserver(fit);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [text, maxPx, wrapAtPx]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%" }}
    >
      {text}
    </div>
  );
}

// --- Cover (Portrait layout - the only one we render) ----------
function CoverPortrait({ af, hero, imgAt, data, heroMode }: { af: AirframeMeta; hero: string; imgAt: (i: number) => string; data: CoverData; heroMode: HeroMode }) {
  return (
    <article className="cover cover-portrait">
      <div className="cv-portrait-hero">
        {heroMode === "single" ? (
          <div className="cv-portrait-single" style={{ backgroundImage: `url("${hero}")` }} role="img" aria-label={af.label} />
        ) : (
          <div className="cv-portrait-collage">
            <div className="cv-collage-cell cv-collage-big" style={{ backgroundImage: `url("${imgAt(0)}")` }} role="img" aria-label={af.label} />
            <div className="cv-collage-cell" style={{ backgroundImage: `url("${imgAt(1)}")` }} role="img" aria-label={af.label} />
            <div className="cv-collage-cell" style={{ backgroundImage: `url("${imgAt(2)}")` }} role="img" aria-label={af.label} />
          </div>
        )}
        <div className="cv-portrait-scrim" />
        <header className="cv-portrait-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cv-logo cv-logo--lg" src="/images/logo-white.png" alt="Plane Place Aviation" />
          <div className="cv-portrait-meta">
            <div className="cv-portrait-meta-row">
              <span className="cv-portrait-meta-label">Date</span>
              <span className="cv-portrait-meta-value">{data.date}</span>
            </div>
            <div className="cv-portrait-meta-row">
              <span className="cv-portrait-meta-label">{DOC_TYPE_LABEL[data.docType]}</span>
              <span className="cv-portrait-meta-value">{formatDocNo(data.docType, data.estNo)}</span>
            </div>
          </div>
        </header>
        <div className="cv-portrait-hero-foot">
          <div className="cv-portrait-num">{af.hangar}</div>
        </div>
      </div>
      <div className="cv-portrait-card">
        <div className="cv-portrait-eyebrow">Maintenance {DOC_TYPE_LABEL[data.docType]}</div>
        <h1 className="cv-portrait-title">
          <span className="cv-title-model">{data.modelLine}</span>
          <span className="cv-title-pill">{data.tailDisplay}</span>
        </h1>
        <div className="cv-portrait-grid">
          <GridItem label="Prepared For" value={data.customerLine} />
          <GridItem label="Aircraft" value={data.modelLine} />
          <GridItem label="Registration" value={data.tailDisplay} mono />
          <GridItem label="Estimated Downtime" value={data.downtime ? `${data.downtime} ${DOWNTIME_UNIT_LABEL[data.downtimeUnit]}` : "-"} />
        </div>
        <div className="cv-portrait-summary">
          <div className="cv-summary-col cv-summary-total">
            <div className="cv-summary-label">{DOC_TYPE_LABEL[data.docType]} Total</div>
            <div className="cv-summary-total-value">{fmtMoney(data.total)}</div>
            <div className="cv-summary-sub">Subject to inspection findings</div>
          </div>
          <div className="cv-summary-col cv-summary-scope">
            <div className="cv-summary-label">Work Scope</div>
            <ScopeFit className="cv-summary-scope-main" text={data.scopeMain || "-"} maxPx={36} wrapAtPx={26} />
            {data.scopeKind && <div className="cv-summary-scope-kind">{data.scopeKind}</div>}
          </div>
          <div className="cv-summary-col cv-summary-prep">
            <div className="cv-summary-prep-row">
              <div className="cv-summary-prep-text">
                <div className="cv-summary-label">Prepared By</div>
                <div className="cv-summary-prep-name">{data.preparedBy}</div>
                <div className="cv-summary-prep-title">{findPreparer(data.preparedBy).title}</div>
              </div>
              {/* Headshot as an <img> tag — html2canvas-pro renders <img>
                  elements at their native resolution rather than going
                  through CSS background-image rescaling, which preserves
                  detail when downsampling the high-res source PNG into
                  the small circular avatar. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="cv-summary-prep-photo"
                src={findPreparer(data.preparedBy).photo}
                alt={data.preparedBy}
              />
            </div>
            <div className="cv-summary-prep-contact">
              <span className="cv-summary-prep-email">{findPreparer(data.preparedBy).email}</span>
              <span className="cv-summary-prep-pipe" aria-hidden>|</span>
              <span className="cv-summary-prep-phone">{findPreparer(data.preparedBy).phone}</span>
            </div>
          </div>
        </div>
        <footer className="cv-portrait-footer">
          <span>FAA Part 145 · Cert {COMPANY.faaCert}</span>
          <span className="cv-portrait-footer-bar" aria-hidden>·</span>
          <span>1650 Airport Dr. HGR 98, Cleburne, TX 76033</span>
          <span className="cv-portrait-footer-bar" aria-hidden>·</span>
          <span>{COMPANY.phone}</span>
          <span className="cv-portrait-footer-bar" aria-hidden>·</span>
          <span>{COMPANY.siteUrl}</span>
        </footer>
      </div>
    </article>
  );
}

function GridItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="cv-grid-item">
      <div className="cv-grid-label">{label}</div>
      <div className={"cv-grid-value" + (mono ? " cv-mono" : "")}>{value}</div>
    </div>
  );
}

// --- Cover-only styles ------------------------------------------
function CoverStyles() {
  // Inline so the captured DOM has its full styling. Self-scoped via .cover.
  return (
    <style jsx global>{`
      /* Hard cascade reset for the cover - undoes Tailwind preflight,
         globals.css inheritance (body font-family, line-height: 1.55,
         font-feature-settings), and font-metric variations that diverge
         between the live browser DOM and the html2canvas capture.
         Without this, the captured output gets pushed around by upstream
         rules that don't affect the design-tool iframe. */
      .cover, .cover * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0;
        line-height: 1;
        font-feature-settings: normal;
        text-rendering: geometricPrecision;
        -webkit-font-smoothing: antialiased;
      }
      /* Note: an h1/h2/h3/p reset was tried here and removed - it had
         specificity (0,1,1) which beat our own (0,1,0) title rules, and
         its font-weight: inherit / margin: 0 then killed the bold and
         the negative margin on .cv-portrait-title. The general
         .cover, .cover * reset above handles margin/padding zeroing for
         every element including h1, and Tailwind preflight rules are
         layered (@layer base) so they lose to our unlayered rules. */
      .cover img { display: block; max-width: none; height: auto; }
      .cover button { all: unset; }

      .cover {
        --cv-navy: #0E2A56;
        --cv-cyan: #16A6DE;
        --cv-cyan-deep: #0F89B8;
        --cv-cream: #F4F0E8;
        --cv-ink: #0B1B36;
        --cv-ink-mute: #8088A0;
        --cv-line: rgba(14, 42, 86, 0.12);
        --cv-line-strong: rgba(14, 42, 86, 0.25);
        --cv-ghost: #273b81; /* PPA brand navy - used for the registration-number ghost text in the title */

        width: 850px;
        height: 1100px;
        background: var(--cv-cream);
        color: var(--cv-navy);
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: "Archivo", system-ui, sans-serif;
      }

      .cv-logo { height: 36px; width: auto; display: block; }
      .cv-logo--lg { height: auto; width: 360px; }

      .cv-mono { font-variant-numeric: tabular-nums; letter-spacing: 0.02em; }

      /* Shared base styles used by the Portrait layout */
      .cv-title-line { display: block; color: var(--cv-navy); }
      .cv-title-line--ghost { color: rgba(14, 42, 86, 0.28); }
      .cv-grid-item { display: flex; flex-direction: column; gap: 4px; }
      .cv-grid-label {
        font-size: 10px; font-weight: 700; letter-spacing: 0.2em;
        text-transform: uppercase; color: var(--cv-ink-mute);
      }
      .cv-grid-value { font-size: 18px; font-weight: 600; color: var(--cv-navy); letter-spacing: -0.01em; }
      .cv-total-label {
        font-size: 10px; font-weight: 700; letter-spacing: 0.2em;
        text-transform: uppercase; color: var(--cv-ink-mute); padding-top: 16px;
      }
      .cv-total-value {
        font-size: 72px; font-weight: 800; letter-spacing: -0.04em;
        line-height: 1; color: var(--cv-navy);
        font-variant-numeric: tabular-nums; text-align: right;
      }

      /* Portrait layout */
      .cover-portrait { background: #061538; padding: 0; }
      .cv-portrait-hero { position: relative; height: 660px; overflow: hidden; }
      .cv-portrait-single {
        position: absolute; inset: 0; background-size: cover;
        background-position: center; background-color: #1a2a3a;
      }
      .cv-portrait-collage {
        position: absolute; inset: 0; display: grid;
        grid-template-columns: 1fr 1fr; grid-template-rows: 1.7fr 1fr;
        gap: 6px; background: var(--cv-cream);
      }
      .cv-collage-cell {
        position: relative; overflow: hidden;
        background: #1a2a3a no-repeat center / cover;
      }
      .cv-collage-big { grid-column: 1 / -1; }
      .cv-portrait-scrim {
        position: absolute; inset: 0;
        background: linear-gradient(180deg,
          rgba(6, 21, 56, 0.85) 0%,
          rgba(6, 21, 56, 0.55) 18%,
          transparent 38%, transparent 58%,
          rgba(6, 21, 56, 0.55) 100%);
      }
      .cv-portrait-head {
        position: absolute; top: 0; left: 0; right: 0;
        padding: 32px 48px; display: flex;
        justify-content: space-between; align-items: flex-start; gap: 24px;
      }
      .cv-portrait-meta {
        display: flex; flex-direction: column; gap: 10px;
        align-items: flex-end; text-align: right; padding-top: 6px;
      }
      .cv-portrait-meta-row { display: flex; flex-direction: column; gap: 2px; }
      .cv-portrait-meta-label {
        font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
        font-weight: 600; color: white;
      }
      .cv-portrait-meta-value {
        font-size: 14px; font-weight: 600; color: white;
        font-variant-numeric: tabular-nums; letter-spacing: 0.02em;
      }
      .cv-portrait-hero-foot {
        position: absolute; bottom: 28px; left: 48px; right: 48px;
        display: flex; justify-content: space-between; align-items: flex-end;
      }
      .cv-portrait-num {
        color: #ffffff; font-size: 11px; font-weight: 700;
        letter-spacing: 0.22em; text-transform: uppercase;
      }
      .cv-portrait-card {
        background: var(--cv-cream); padding: 40px 48px 48px;
        flex: 1; display: flex; flex-direction: column;
      }
      .cv-portrait-eyebrow {
        font-size: 13px; font-weight: 700; letter-spacing: 0.22em;
        text-transform: uppercase; color: var(--cv-cyan);
        line-height: 1; margin: 0 0 22px;
      }
      /* Title - model name to the left, navy pill containing the registration
         number to the right. The pill bleeds off the right edge of the card
         (margin-right: -48px) with rounded corners only on the left.
         !important on line-height / font-size / font-family because:
           - The cascade reset hardens inheritance, but body { line-height: 1.55 }
             in globals.css and Tailwind preflight's h1 { font-size: inherit }
             can still slip through depending on stylesheet load order.
           - styled-jsx injects styles at runtime which puts them late in the
             cascade, BUT we want bulletproof guarantees here, not "should win." */
      .cv-portrait-title {
        display: flex !important;
        align-items: center !important;
        flex-wrap: nowrap;
        gap: 18px;
        margin: 0 -48px 28px 0;
        padding: 0;
        font-family: "Archivo", system-ui, sans-serif !important;
        font-size: 65px !important;
        line-height: 1 !important;
        letter-spacing: -0.04em;
        font-weight: 800;
        min-width: 0;
        height: auto;
      }
      .cv-title-model {
        flex: 0 0 auto;
        color: var(--cv-navy);
        font-weight: 800 !important;
        font-family: "Archivo", system-ui, sans-serif !important;
        font-size: 65px !important;
        line-height: 1 !important;
        white-space: nowrap;
        margin: 0 !important;
        padding: 0 !important;
        display: block;
      }
      .cv-title-pill {
        flex: 1 1 auto;
        min-width: 80px;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start;
        background: var(--cv-navy);
        color: white;
        font-family: "Archivo", system-ui, sans-serif !important;
        font-weight: 800 !important;
        font-size: 60px !important;
        line-height: 1 !important;
        letter-spacing: -0.02em;
        padding: 18px 48px 18px 28px !important;
        border-radius: 18px 0 0 18px;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        box-sizing: border-box;
      }
      .cv-portrait-grid {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        padding: 18px 0;
        /* Explicit margin shorthand so the cascade reset (which zeroes all
           margins) doesn't strip this. */
        margin: 0 0 20px;
      }
      .cv-portrait-grid .cv-grid-value { font-size: 15px; }
      /* Three-column summary band: Total / Work Scope / Prepared By, separated
         by vertical hairline rules.
         Same html2canvas-hardening as the title:
           - Symmetric vertical padding on the container (22/22) instead of
             asymmetric (28/18) so the capture engine renders predictably
           - Explicit line-height: 1 on every text node - inherited browser
             defaults add invisible leading that html2canvas measures
             differently than the live render
           - Explicit margin: 0 resets on value/scope/sub so the only spacing
             is the one we declare. */
      .cv-portrait-summary {
        display: grid;
        /* minmax(0, 1fr) is the canonical fix for grid items that wont shrink
           below their content. Plain 1fr keeps the implicit auto floor, so a
           wide nowrap child still pushes the column past its share.
           minmax(0,1fr) sets the floor to 0, locking columns to truly equal
           thirds regardless of content. */
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
        gap: 0;
        padding: 22px 0;
        border-top: 1px solid var(--cv-line-strong);
        border-bottom: 1px solid var(--cv-line-strong);
        margin: 0 0 18px;
      }
      .cv-summary-col {
        padding: 6px 28px; display: flex; flex-direction: column;
        align-items: center; justify-content: flex-start;
        text-align: center; min-height: 144px;
        line-height: 1;
        /* CRITICAL: grid items default to min-width: auto which prevents them
           from shrinking below their content's intrinsic min-content size.
           Without min-width: 0 the nowrap scope text would push this column
           wider than its 1fr share, eating into the neighbors. */
        min-width: 0;
        overflow: hidden;
      }
      .cv-summary-col + .cv-summary-col { border-left: 1px solid var(--cv-line-strong); }
      .cv-summary-label {
        font-size: 11px; font-weight: 600; letter-spacing: 0.22em;
        text-transform: uppercase; color: var(--cv-ink-mute);
        line-height: 1; margin: 0 0 18px;
      }
      .cv-summary-total-value {
        font-size: 44px; font-weight: 800; letter-spacing: -0.04em;
        line-height: 1; color: var(--cv-navy);
        font-variant-numeric: tabular-nums;
        margin: 0;
      }
      .cv-summary-sub {
        font-size: 10px; letter-spacing: 0.18em;
        text-transform: uppercase; color: var(--cv-ink-mute);
        font-weight: 500;
        line-height: 1.3; margin: 16px 0 0;
      }
      .cv-summary-scope-main {
        font-size: 36px; font-weight: 800; letter-spacing: 0.02em;
        line-height: 1; color: var(--cv-navy); text-transform: uppercase;
        margin: 0;
      }
      .cv-summary-scope-kind {
        font-size: 18px; font-weight: 700;
        letter-spacing: 0.12em; text-transform: uppercase; color: var(--cv-navy);
        line-height: 1; margin: 10px 0 0;
      }
      .cv-summary-prep {
        flex-direction: column !important;
        align-items: center; justify-content: center;
        gap: 12px; text-align: center;
      }
      .cv-summary-prep-row {
        display: flex; flex-direction: row;
        align-items: flex-start; justify-content: center;
        gap: 16px; text-align: right;
      }
      .cv-summary-prep-text {
        display: flex; flex-direction: column;
        align-items: flex-end; text-align: right;
      }
      .cv-summary-prep .cv-summary-label { margin-bottom: 12px; }
      .cv-summary-prep-name {
        font-size: 14px; font-weight: 700; color: var(--cv-navy);
        letter-spacing: -0.005em; line-height: 1.15;
      }
      .cv-summary-prep-title {
        margin-top: 3px; font-size: 11px; color: var(--cv-ink-mute);
        font-weight: 500; letter-spacing: 0.04em; line-height: 1.3;
      }
      .cv-summary-prep-contact {
        display: flex; flex-direction: row;
        align-items: center; justify-content: center;
        gap: 8px; white-space: nowrap;
      }
      .cv-summary-prep-email,
      .cv-summary-prep-phone {
        font-size: 10px; color: var(--cv-ink-mute);
        font-weight: 500; letter-spacing: 0.02em; line-height: 1.3;
      }
      .cv-summary-prep-pipe {
        color: var(--cv-navy); font-weight: 600;
        font-size: 10px; line-height: 1; user-select: none;
      }
      /* Override the shared summary-label size for the Prepared By column
         only - keeps ESTIMATE TOTAL and WORK SCOPE labels at their default
         11px while shrinking PREPARED BY to 7.5px. */
      .cv-summary-prep .cv-summary-label { font-size: 7.5px; }
      /* <img> rendered at native resolution via object-fit: cover.
         html2canvas-pro handles object-fit on img tags correctly (the
         original html2canvas did not), and rendering as an img lets the
         capture engine draw the source bitmap directly rather than
         re-sampling through CSS background scaling. */
      .cv-summary-prep-photo {
        flex-shrink: 0; width: 110px; height: 110px; border-radius: 50%;
        object-fit: cover; object-position: center top;
        background-color: rgba(14, 42, 86, 0.08);
        border: 1px solid var(--cv-line-strong);
        display: block;
      }
      .cv-portrait-footer {
        margin-top: auto; padding-top: 18px;
        display: flex; align-items: center; gap: 10px;
        font-size: 10px; line-height: 1; font-weight: 600; letter-spacing: 0.08em;
        text-transform: uppercase; color: var(--cv-navy); flex-wrap: wrap;
      }
      /* Footer dot - rendered as a literal "·" text character so the font's
         own typographic metrics handle vertical alignment. Eliminates the
         flex-centering vs. caps-visual-middle drift the styled-div approach
         caused. The character is hidden from screen readers (it's purely
         decorative) and is upsized + bolded to read as a bullet, not punctuation. */
      .cv-portrait-footer-bar {
        color: var(--cv-cyan);
        font-size: 16px;
        font-weight: 900;
        line-height: 1;
        transform: translateY(0);
        display: inline-block;
      }

      /* Form select arrow */
      .form-select {
        appearance: none; -webkit-appearance: none; padding-right: 36px;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%230E2A56' stroke-width='2'><path d='M1 1l5 5 5-5'/></svg>");
        background-repeat: no-repeat;
        background-position: right 12px center;
        cursor: pointer;
      }
      .file-drop.is-over { border-color: var(--color-ppa-brass); background: rgba(22, 166, 222, 0.04); }
      .spinner { animation: ec-spin 0.8s linear infinite; }
      @keyframes ec-spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}

