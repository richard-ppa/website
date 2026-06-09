// ------------------------------------------------------------------
// CoverTool.tsx
// Standalone port of /admin/estimate-cover from the main ppa-website.
// Targets the Chrome extension build (Vite + React), so all Next.js
// APIs (next/image, next/script, next/link) are removed and pdf-lib /
// html2canvas-pro are bundled as ES modules at build time.
// ------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import html2canvas from "html2canvas-pro";
import "./CoverTool.css";

// --- Company + preparer data (inlined; the extension is standalone) -

const COMPANY = {
  phone: "(817) 768-8884",
  address: {
    street: "1650 Airport Dr, Hangar 98",
    city: "Cleburne",
    state: "TX",
    zip: "76033",
  },
  faaCert: "PLPR528E",
  siteUrl: "ppa.aero",
};

interface Preparer {
  name: string;
  title: string;
  photo: string;
  email: string;
  phone: string;
}

// `?v=2` query string is a cache-buster — the headshot files were upgraded
// to higher resolution but kept the same path, so browsers were still
// serving the cached lower-res versions. Bumping the version param forces
// a fresh fetch. If you swap these files again later, bump the number.
const LEADERSHIP_PREPARERS: Preparer[] = [
  { name: "Tristan Noe", title: "Director of Maintenance", photo: "/images/team/tristan.png?v=2", email: "tristan@ppa.aero", phone: "(817) 739-5630" },
  { name: "Travis Roberson", title: "VP of Maintenance", photo: "/images/team/travis.png?v=2", email: "travis@ppa.aero", phone: "(423) 504-3249" },
  { name: "Ron Larson", title: "Accountable Manager", photo: "/images/team/ron-larson.png?v=2", email: "ron@ppa.aero", phone: "(972) 822-0637" },
  { name: "Ron Reiling", title: "Sales Manager", photo: "/images/team/ron-reiling.png?v=2", email: "rreiling@ppa.aero", phone: "(817) 240-7197" },
  { name: "James Noe", title: "Hawker Service Advisor", photo: "/images/team/james.png?v=2", email: "james@ppa.aero", phone: "(817) 614-9513" },
];

function findPreparer(name: string): Preparer {
  return LEADERSHIP_PREPARERS.find((m) => m.name === name) || LEADERSHIP_PREPARERS[0];
}

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

// --- Airframe data (high-res shots in /images/aircraft/) ----------
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
//   - "quote"    -  original customer quote -  prefix QKCPT
//   - "estimate" -  addendum for an aircraft already in the shop -  prefix KCPT
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
  quote: "QKCPT",
  estimate: "KCPT",
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
  const canvas = await html2canvas(coverEl, {
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
  const { bytes: jpgBytes } = await captureCoverImageBytes(coverEl);
  const mergedDoc = await PDFDocument.create();
  const coverImg = await mergedDoc.embedJpg(jpgBytes);
  const coverPage = mergedDoc.addPage([612, 792]); // US Letter, points
  coverPage.drawImage(coverImg, { x: 0, y: 0, width: 612, height: 792 });

  // Append the user's estimate pages
  const userBytes = await file.arrayBuffer();
  const userPdf = await PDFDocument.load(userBytes, { ignoreEncryption: true });
  const copied = await mergedDoc.copyPages(userPdf, userPdf.getPageIndices());
  for (const p of copied) {
    mergedDoc.addPage(p);
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

// --- Component ---------------------------------------------------
export default function CoverTool() {
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
          Chrome extensions can load external fonts; the font CSS is hosted,
          but the actual font files load via the @font-face declared in
          that CSS. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap"
      />

      <div className="cv-tool-root" style={{ maxWidth: 1500, margin: "0 auto", padding: "24px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span className="cv-tool-header-rule" />
          <span className="cv-tool-eyebrow">Internal Tool</span>
        </div>
        <h1 className="cv-tool-title">Estimate Cover Page</h1>
        <p className="cv-tool-sub">
          Fill the form and the cover updates live. Upload a customer&apos;s
          estimate PDF to prepend this cover as page 1 and download the merged
          file. Print Cover Only opens a print-ready window with the cover at
          US Letter.
        </p>

        <div className="cv-tool-layout">
          {/* --- Form panel --------------------------------- */}
          <div className="cv-tool-form">
            <div className="cv-tool-form-inner">
              {/* Airframe */}
              <Section label="Airframe">
                <div className="cv-btn-row-3">
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
                        className={"cv-toggle" + (on ? " is-on" : "")}
                      >
                        <span className="cv-toggle-label">{AIRFRAMES[key].label}</span>
                        <span className="cv-toggle-tag">{AIRFRAMES[key].tagline}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Hero images */}
              <Section label="Hero images">
                <div className="cv-btn-row-2" style={{ marginBottom: 8 }}>
                  {(["single", "collage"] as HeroMode[]).map((m) => {
                    const on = heroMode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setHeroMode(m)}
                        className={"cv-toggle-flat" + (on ? " is-on" : "")}
                      >
                        {m === "single" ? "Single image" : "Collage"}
                      </button>
                    );
                  })}
                </div>
                <div className="cv-thumb-row">
                  {af.images.map((src, i) => {
                    const slot = selectedImgs.indexOf(i);
                    const on = slot >= 0;
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => toggleImg(i)}
                        className={"cv-thumb" + (on ? " is-on" : "")}
                        style={{ backgroundImage: `url("${src}")` }}
                        aria-label={`Image ${i + 1}${on ? " (selected)" : ""}`}
                      >
                        {on && (
                          <span className="cv-thumb-badge">
                            {heroMode === "collage" ? slot + 1 : "-S"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {heroMode === "collage" && (
                  <p className="cv-help">
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
                <div className="cv-field-row-2">
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
                  <div className="cv-input-prefixed">
                    <span className="cv-input-prefix">$</span>
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
                  <div className="cv-btn-row-3">
                    {(["business", "calendar", "weeks"] as DowntimeUnit[]).map((u) => {
                      const on = downtimeUnit === u;
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setDowntimeUnit(u)}
                          className={"cv-toggle-flat" + (on ? " is-on" : "")}
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
                    className="file-drop"
                  >
                    <div className="file-drop-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" />
                      </svg>
                    </div>
                    <div className="file-drop-text">
                      <strong className="file-drop-title">Upload estimate PDF</strong>
                      <span className="file-drop-sub">Drop here or click to choose · PDF only</span>
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
                  <div className="file-chip">
                    <div className="file-chip-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                    </div>
                    <div className="file-chip-body">
                      <div className="file-chip-name">{pdfFile.name}</div>
                      <div className="file-chip-size">{fmtBytes(pdfFile.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="file-chip-x"
                      aria-label="Remove file"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {mergeError && (
                  <div className="cv-error">
                    {mergeError}
                  </div>
                )}
              </Section>

              <Section label="Document">
                <Field label="Document type">
                  <div className="cv-btn-row-2">
                    {(["quote", "estimate"] as DocType[]).map((t) => {
                      const on = docType === t;
                      const label = t === "quote" ? "Quote (QKCPT)" : "Estimate (KCPT)";
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setDocType(t)}
                          className={"cv-toggle-flat" + (on ? " is-on" : "")}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <div className="cv-field-row-2">
                  <Field
                    label={`${DOC_TYPE_LABEL[docType]} #`}
                    hint={`Number only - "${DOC_TYPE_PREFIX[docType]}-" prefix is added automatically.`}
                  >
                    <div className="cv-input-prefixed">
                      <span className="cv-input-prefix-sm">
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
            <div className="cv-actions">
              <button
                type="button"
                onClick={onMerge}
                disabled={!pdfFile || mergeBusy}
                className="cv-actions-primary"
                title={!pdfFile ? "Upload an estimate PDF first" : undefined}
              >
                {mergeBusy ? <Spinner /> : <DownloadIcon />}
                {mergeBusy ? "Building⬦" : "Merge & Download"}
              </button>
              <button
                type="button"
                onClick={onPrint}
                title="Print cover only"
                className="cv-actions-icon"
              >
                <PrinterIcon />
              </button>
              <button
                type="button"
                onClick={onReset}
                title="Reset form"
                className="cv-actions-icon"
              >
                <ResetIcon />
              </button>
            </div>
          </div>

          {/* --- Preview stage ----------------------------- */}
          <div ref={stageRef} className="cv-stage">
            <div
              ref={coverRef}
              className="preview-scale cv-stage-inner"
              style={{
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
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
    <div className="cv-section">
      <div className="cv-section-label">{label}</div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="cv-field">
      <span className="cv-field-label">{label}</span>
      {children}
      {hint && <span className="cv-field-hint">{hint}</span>}
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
