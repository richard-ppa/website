"use client";

// Document-style editor for blog articles.
//
// The article renders as a styled document (think MS Word) — headings are
// big, paragraphs are readable serif text, bullets are real bullets. Every
// piece of text is editable inline: click anywhere and type. Bracketed
// placeholders like [NEEDS PPA INPUT — typical turn time] stay visible as
// plain text and the "Placeholders remaining" counter at the top scans for
// any remaining `[...]` markers so Tristan can see what's left to fill in.
//
// The structured/section editor at ./Editor.tsx is kept in the codebase for
// any future need but is no longer routed.

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, PageContainer } from "@/components/admin/PageHeader";
import type { Article, ArticleStatus, BlogSection } from "@/lib/articles-types";
import { StatusBadge } from "../_status-badge";

// ─── Auto-growing textarea ──────────────────────────────────────────────────
// Standard textareas don't grow with content. This wrapper resizes height to
// fit. The rendered look is borderless / transparent so the textareas blend
// into the document.

interface AutoTextareaProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  ariaLabel?: string;
  minRows?: number;
}

function AutoTextarea({ value, onChange, className, style, placeholder, ariaLabel, minRows = 1 }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  // Resize on mount + on every value change.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={style}
      placeholder={placeholder}
      aria-label={ariaLabel}
      rows={minRows}
      spellCheck
    />
  );
}

// ─── Section renderers ──────────────────────────────────────────────────────
// Each section type renders as a styled editable element.

interface SectionEditorProps {
  section: BlogSection;
  onChange: (next: BlogSection) => void;
}

function SectionEditor({ section, onChange }: SectionEditorProps) {
  switch (section.kind) {
    case "heading":
      return (
        <AutoTextarea
          value={section.text}
          onChange={(text) => onChange({ ...section, text })}
          className="doc-h2-edit"
          ariaLabel="Section heading"
          placeholder="Section heading"
        />
      );
    case "paragraph":
      return (
        <AutoTextarea
          value={section.text}
          onChange={(text) => onChange({ ...section, text })}
          className="doc-p-edit"
          ariaLabel="Paragraph"
          placeholder="Paragraph text…"
        />
      );
    case "callout":
      return (
        <div className="doc-callout-wrap">
          <AutoTextarea
            value={section.text}
            onChange={(text) => onChange({ ...section, text })}
            className="doc-callout-edit"
            ariaLabel="Callout"
            placeholder="Callout / pull-quote text…"
          />
        </div>
      );
    case "takeaways":
      return (
        <ol className="doc-takeaways">
          {section.items.map((item, i) => (
            <li key={i}>
              <AutoTextarea
                value={item.label}
                onChange={(label) => {
                  const items = [...section.items];
                  items[i] = { ...items[i], label };
                  onChange({ ...section, items });
                }}
                className="doc-takeaway-label-edit"
                ariaLabel={`Takeaway ${i + 1} label`}
                placeholder="Takeaway label"
              />
              <AutoTextarea
                value={item.text}
                onChange={(text) => {
                  const items = [...section.items];
                  items[i] = { ...items[i], text };
                  onChange({ ...section, items });
                }}
                className="doc-takeaway-text-edit"
                ariaLabel={`Takeaway ${i + 1} body`}
                placeholder="Takeaway detail…"
              />
            </li>
          ))}
        </ol>
      );
    case "figure":
      return (
        <figure className="doc-figure">
          <div className="doc-figure-img">{section.src}</div>
          <AutoTextarea
            value={section.caption}
            onChange={(caption) => onChange({ ...section, caption })}
            className="doc-figure-caption-edit"
            ariaLabel="Figure caption"
            placeholder="Figure caption…"
          />
        </figure>
      );
  }
}

// ─── Editor component ───────────────────────────────────────────────────────

type Toast = { kind: "success" | "error" | "info"; message: string } | null;

const SECTION_KINDS: BlogSection["kind"][] = ["paragraph", "heading", "takeaways", "callout"];

function blankSection(kind: BlogSection["kind"]): BlogSection {
  switch (kind) {
    case "paragraph":
      return { kind: "paragraph", text: "" };
    case "heading":
      return { kind: "heading", text: "" };
    case "callout":
      return { kind: "callout", text: "" };
    case "takeaways":
      return { kind: "takeaways", items: [{ label: "", text: "" }] };
    case "figure":
      return { kind: "figure", src: "", alt: "", caption: "" };
  }
}

export default function DocumentEditor() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const idFromQuery = searchParams?.get("id") ?? null;
  const idFromPath = useMemo(() => {
    if (!pathname) return null;
    const m = pathname.match(/^\/admin\/articles\/([^/]+)\/?$/);
    return m?.[1] ?? null;
  }, [pathname]);
  const id =
    idFromQuery ||
    (idFromPath && idFromPath !== "new" ? idFromPath : null) ||
    params?.id ||
    null;
  const isNew = !id || id === "new";

  const [article, setArticle] = useState<Article | null>(null);
  const [sections, setSections] = useState<BlogSection[]>([]);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [confirmModal, setConfirmModal] = useState<
    null | "publish" | "delete" | "unpublish"
  >(null);
  const [metaOpen, setMetaOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Status reading (defensive for older rows without `status`)
  const currentStatus: ArticleStatus = (() => {
    const s = article?.status;
    if (s === "draft" || s === "in_review" || s === "published") return s;
    if (article?.published) return "published";
    return "draft";
  })();

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/admin/api/articles/${id}`, { credentials: "same-origin" })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setLoadError("Article not found");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setLoadError(`Failed to load (${res.status})`);
          setLoading(false);
          return;
        }
        const data = (await res.json()) as Article;
        setArticle(data);
        setSections(data.sections ?? []);
        setTitle(data.title ?? "");
        setExcerpt(data.excerpt ?? "");
        setDirty(false);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Unknown error");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  function updateSection(idx: number, next: BlogSection) {
    setSections((prev) => {
      const out = [...prev];
      out[idx] = next;
      return out;
    });
    setDirty(true);
  }

  function addSection(kind: BlogSection["kind"], after: number) {
    setSections((prev) => {
      const out = [...prev];
      out.splice(after + 1, 0, blankSection(kind));
      return out;
    });
    setDirty(true);
  }

  function removeSection(idx: number) {
    setSections((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function moveSection(idx: number, dir: -1 | 1) {
    setSections((prev) => {
      const out = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= out.length) return prev;
      [out[idx], out[j]] = [out[j], out[idx]];
      return out;
    });
    setDirty(true);
  }

  // Count remaining `[...]` placeholders across all editable text.
  const bracketsRemaining = useMemo(() => {
    const re = /\[[^\]]+\]/g;
    let n = 0;
    const count = (s: string) => (s.match(re) ?? []).length;
    n += count(title);
    n += count(excerpt);
    for (const sec of sections) {
      switch (sec.kind) {
        case "heading":
        case "paragraph":
        case "callout":
          n += count(sec.text);
          break;
        case "takeaways":
          for (const item of sec.items) {
            n += count(item.label);
            n += count(item.text);
          }
          break;
        case "figure":
          n += count(sec.caption);
          break;
      }
    }
    return n;
  }, [title, excerpt, sections]);

  async function save(opts: { showToast?: boolean } = {}): Promise<Article | null> {
    if (!article) return null;
    setSaving(true);
    try {
      const res = await fetch(`/admin/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title, excerpt, sections }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        setToast({ kind: "error", message: errBody.error || `Save failed (${res.status})` });
        return null;
      }
      const data = (await res.json()) as Article;
      setArticle(data);
      setSections(data.sections);
      setTitle(data.title);
      setExcerpt(data.excerpt);
      setDirty(false);
      if (opts.showToast !== false) setToast({ kind: "success", message: "Saved." });
      return data;
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Save failed" });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function submitForReview() {
    if (!article) return;
    const saved = await save({ showToast: false });
    if (!saved) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/admin/api/articles/${saved.id}/submit-for-review`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        setToast({ kind: "error", message: errBody.error || "Submit failed" });
        return;
      }
      const data = (await res.json()) as { article: Article };
      setArticle(data.article);
      setToast({ kind: "success", message: "Submitted for review. Richard will get an email." });
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Submit failed" });
    } finally {
      setSubmitting(false);
    }
  }

  async function publish() {
    if (!article) return;
    setConfirmModal(null);
    const saved = await save({ showToast: false });
    if (!saved) return;
    setPublishing(true);
    try {
      const res = await fetch(`/admin/api/articles/${saved.id}/publish`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        setToast({ kind: "error", message: errBody.error || "Publish failed" });
        return;
      }
      const data = (await res.json()) as Article;
      setArticle(data);
      setToast({ kind: "success", message: "Published. Run `wrangler pages deploy out` to push live." });
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Publish failed" });
    } finally {
      setPublishing(false);
    }
  }

  async function unpublish() {
    if (!article) return;
    setConfirmModal(null);
    try {
      const res = await fetch(`/admin/api/articles/${article.id}/unpublish`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        setToast({ kind: "error", message: "Unpublish failed" });
        return;
      }
      const data = (await res.json()) as Article;
      setArticle(data);
      setToast({ kind: "info", message: "Unpublished." });
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Unpublish failed" });
    }
  }

  async function sendBackToDraft() {
    if (!article) return;
    try {
      const res = await fetch(`/admin/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: "draft" }),
      });
      if (!res.ok) {
        setToast({ kind: "error", message: "Failed to send back to draft" });
        return;
      }
      const data = (await res.json()) as Article;
      setArticle(data);
      setToast({ kind: "info", message: "Sent back to draft." });
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Failed" });
    }
  }

  async function doDelete() {
    if (!article) return;
    setConfirmModal(null);
    try {
      const res = await fetch(`/admin/api/articles/${article.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        setToast({ kind: "error", message: "Delete failed" });
        return;
      }
      router.push("/admin/articles");
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Delete failed" });
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (isNew) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Articles" title="New article" />
        <div className="mx-auto max-w-2xl bg-white border border-ppa-border p-8 mt-6">
          <p className="text-ppa-gray">
            New-from-scratch authoring isn&apos;t wired up yet — open an existing draft to edit.
          </p>
          <Link href="/admin/articles" className="text-ppa-brass-dark underline mt-4 inline-block">
            ← Back to articles
          </Link>
        </div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Articles" title="Loading…" />
      </PageContainer>
    );
  }

  if (loadError) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Articles" title="Article" />
        <div className="mx-auto max-w-2xl bg-white border border-ppa-border p-8 mt-6">
          <p className="text-red-600">{loadError}</p>
          <Link href="/admin/articles" className="text-ppa-brass-dark underline mt-4 inline-block">
            ← Back to articles
          </Link>
        </div>
      </PageContainer>
    );
  }

  if (!article) return null;

  return (
    <PageContainer>
      <style jsx global>{`
        .doc-page {
          background: #ffffff;
          border: 1px solid var(--ppa-border, #e1e5eb);
          max-width: 820px;
          margin: 0 auto;
          padding: 64px 72px;
          font-family: var(--font-archivo), system-ui, sans-serif;
          color: #0f1828;
        }
        @media (max-width: 800px) {
          .doc-page { padding: 32px 28px; }
        }

        /* Shared textarea reset — every editable area in the doc inherits this */
        .doc-page textarea {
          width: 100%;
          display: block;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: 4px 8px;
          margin: -4px -8px;
          font-family: inherit;
          color: inherit;
          resize: none;
          overflow: hidden;
          line-height: inherit;
          font-size: inherit;
          font-weight: inherit;
        }
        .doc-page textarea:hover {
          background: #fafbfc;
        }
        .doc-page textarea:focus {
          outline: none;
          background: #fffbeb;
          border-color: #f59e0b;
        }
        .doc-page textarea::placeholder {
          color: #9ca3af;
          font-style: italic;
        }

        .doc-title-edit {
          font-size: 36px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #0f1828;
          margin: 0 0 16px;
        }
        .doc-excerpt-edit {
          font-size: 18px;
          line-height: 1.5;
          color: #3b4960;
          margin: 0 0 32px;
          font-weight: 300;
        }
        .doc-h2-edit {
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #0f1828;
          margin: 36px 0 12px;
        }
        .doc-p-edit {
          font-size: 16px;
          line-height: 1.7;
          color: #1f2937;
          margin: 0 0 16px;
        }
        .doc-callout-wrap {
          border-top: 1px solid #e1e5eb;
          border-bottom: 1px solid #e1e5eb;
          padding: 16px 0;
          margin: 24px 0;
        }
        .doc-callout-edit {
          font-size: 22px;
          line-height: 1.35;
          font-weight: 500;
          color: #0f1828;
        }
        .doc-takeaways {
          list-style: none;
          padding: 0;
          margin: 24px 0;
          border-left: 2px solid #c8a062;
        }
        .doc-takeaways > li {
          padding: 0 0 16px 24px;
        }
        .doc-takeaway-label-edit {
          font-size: 17px;
          font-weight: 700;
          color: #0f1828;
          margin: 0;
        }
        .doc-takeaway-text-edit {
          font-size: 15px;
          line-height: 1.6;
          color: #4b5563;
          margin: 4px 0 0;
        }
        .doc-figure {
          margin: 24px 0;
          padding: 16px;
          background: #f3f4f6;
          color: #6b7280;
          font-size: 13px;
        }
        .doc-figure-img {
          font-family: monospace;
          padding: 8px;
          background: white;
          border: 1px dashed #d1d5db;
          margin-bottom: 8px;
        }
        .doc-figure-caption-edit {
          font-style: italic;
          font-size: 13px;
          color: #6b7280;
        }

        /* Section toolbar — small action buttons that appear on hover */
        .doc-section {
          position: relative;
        }
        .doc-section-tools {
          position: absolute;
          right: -52px;
          top: 0;
          display: none;
          flex-direction: column;
          gap: 2px;
          z-index: 5;
        }
        .doc-section:hover .doc-section-tools,
        .doc-section:focus-within .doc-section-tools {
          display: flex;
        }
        .doc-section-tool {
          width: 28px;
          height: 22px;
          font-size: 11px;
          background: white;
          border: 1px solid #d1d5db;
          color: #6b7280;
          cursor: pointer;
          border-radius: 3px;
        }
        .doc-section-tool:hover {
          background: #f3f4f6;
          color: #0f1828;
        }

        /* Add-section row between sections */
        .doc-add-row {
          opacity: 0;
          transition: opacity 120ms ease;
          margin: -8px 0;
          display: flex;
          gap: 4px;
          justify-content: center;
        }
        .doc-add-row:hover {
          opacity: 1;
        }
        .doc-add-row button {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b7280;
          background: white;
          border: 1px dashed #d1d5db;
          padding: 2px 10px;
          cursor: pointer;
          border-radius: 999px;
        }
        .doc-add-row button:hover {
          color: #0f1828;
          border-color: #6b7280;
        }
      `}</style>

      <PageHeader
        eyebrow="Articles"
        title={title || "Untitled article"}
        action={<StatusBadge status={currentStatus} />}
      />

      {/* Status / progress strip */}
      <div className="mx-auto max-w-[820px] mb-6 mt-4">
        <div className="flex items-center justify-between gap-4 px-1">
          <Link href="/admin/articles" className="text-[12px] uppercase tracking-[0.15em] text-ppa-muted hover:text-ppa-brass-dark">
            ← All articles
          </Link>
          <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.15em]">
            {dirty ? (
              <span className="text-amber-700 font-semibold">Unsaved changes</span>
            ) : null}
            <span className="text-ppa-muted">Placeholders:</span>
            <span
              className={
                bracketsRemaining === 0
                  ? "text-emerald-700 font-semibold"
                  : "text-amber-700 font-semibold"
              }
            >
              {bracketsRemaining === 0 ? "all filled" : `${bracketsRemaining} remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* Document body */}
      <article className="doc-page">
        <AutoTextarea
          value={title}
          onChange={(v) => { setTitle(v); setDirty(true); }}
          className="doc-title-edit"
          ariaLabel="Article title"
          placeholder="Untitled article"
        />
        <AutoTextarea
          value={excerpt}
          onChange={(v) => { setExcerpt(v); setDirty(true); }}
          className="doc-excerpt-edit"
          ariaLabel="Article excerpt / dek"
          placeholder="One-sentence summary that appears under the title…"
        />

        {sections.map((section, idx) => (
          <div className="doc-section" key={idx}>
            <SectionEditor
              section={section}
              onChange={(next) => updateSection(idx, next)}
            />
            <div className="doc-section-tools" aria-hidden>
              <button
                type="button"
                className="doc-section-tool"
                onClick={() => moveSection(idx, -1)}
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="doc-section-tool"
                onClick={() => moveSection(idx, 1)}
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="doc-section-tool"
                onClick={() => removeSection(idx)}
                title="Delete section"
              >
                ✕
              </button>
            </div>
            <div className="doc-add-row">
              {SECTION_KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => addSection(kind, idx)}
                  title={`Insert ${kind} below`}
                >
                  + {kind}
                </button>
              ))}
            </div>
          </div>
        ))}
        {sections.length === 0 ? (
          <div className="doc-add-row" style={{ opacity: 1 }}>
            {SECTION_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => addSection(kind, -1)}
              >
                + {kind}
              </button>
            ))}
          </div>
        ) : null}
      </article>

      {/* Metadata (collapsed) */}
      <div className="mx-auto max-w-[820px] mt-8 bg-white border border-ppa-border">
        <button
          type="button"
          onClick={() => setMetaOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 text-left text-[12px] uppercase tracking-[0.15em] text-ppa-muted hover:text-ppa-black"
        >
          <span>Article details (read-only)</span>
          <span>{metaOpen ? "▾" : "▸"}</span>
        </button>
        {metaOpen ? (
          <dl className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <MetaRow label="Slug" value={article.slug} />
            <MetaRow label="Category" value={article.category} />
            <MetaRow label="Author" value={article.author} />
            <MetaRow label="Date" value={article.date_display || article.date} />
            <MetaRow label="Reading time" value={article.reading_time} />
            <MetaRow label="Hero image" value={article.hero_src} />
            <MetaRow label="Tags" value={(article.tags ?? []).join(", ")} />
          </dl>
        ) : null}
      </div>

      {/* Action bar */}
      <div className="mx-auto max-w-[820px] mt-8 mb-12 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => save()}
            disabled={saving}
            className="px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] border border-ppa-border bg-white hover:bg-ppa-light text-ppa-black disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {currentStatus === "draft" ? (
            <button
              type="button"
              onClick={submitForReview}
              disabled={submitting || saving}
              className="px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-white disabled:opacity-50"
              style={{ background: "#0C7CB0" }}
            >
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          ) : null}
          {currentStatus === "in_review" ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmModal("publish")}
                disabled={publishing || saving}
                className="px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-white bg-ppa-black hover:bg-ppa-gray disabled:opacity-50"
              >
                {publishing ? "Publishing…" : "Publish"}
              </button>
              <button
                type="button"
                onClick={sendBackToDraft}
                className="px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] border border-ppa-border bg-white text-ppa-gray hover:text-ppa-black"
              >
                Send back to draft
              </button>
            </>
          ) : null}
          {currentStatus === "published" ? (
            <button
              type="button"
              onClick={() => setConfirmModal("unpublish")}
              className="px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] border border-ppa-border bg-white text-ppa-gray hover:text-ppa-black"
            >
              Unpublish
            </button>
          ) : null}
        </div>
        {currentStatus === "draft" ? (
          <button
            type="button"
            onClick={() => setConfirmModal("delete")}
            className="px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-red-600 hover:text-red-800"
          >
            Delete draft
          </button>
        ) : null}
      </div>

      {/* Toast */}
      {toast ? (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded shadow-lg text-sm"
          style={{
            background:
              toast.kind === "success"
                ? "#10b981"
                : toast.kind === "error"
                  ? "#dc2626"
                  : "#0C7CB0",
            color: "white",
          }}
        >
          {toast.message}
        </div>
      ) : null}

      {/* Confirm modals */}
      {confirmModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white max-w-md w-full p-6 border border-ppa-border">
            <h3 className="font-display text-xl mb-2 text-ppa-black">
              {confirmModal === "publish"
                ? "Publish article?"
                : confirmModal === "unpublish"
                  ? "Unpublish article?"
                  : "Delete this draft?"}
            </h3>
            <p className="text-sm text-ppa-gray mb-6">
              {confirmModal === "publish"
                ? "This will set the status to Published. You'll still need to run `wrangler pages deploy out` to push the new content to ppa.aero."
                : confirmModal === "unpublish"
                  ? "The article will be removed from the next site build and reverted to draft."
                  : "This permanently deletes the article. There is no undo."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-[12px] uppercase tracking-[0.15em] border border-ppa-border bg-white text-ppa-gray hover:text-ppa-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal === "publish") publish();
                  else if (confirmModal === "unpublish") unpublish();
                  else if (confirmModal === "delete") doDelete();
                }}
                className={
                  "px-4 py-2 text-[12px] uppercase tracking-[0.15em] text-white " +
                  (confirmModal === "delete" ? "bg-red-600 hover:bg-red-800" : "bg-ppa-black hover:bg-ppa-gray")
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.15em] text-ppa-muted">{label}</dt>
      <dd className="text-ppa-black mt-0.5 break-words">{value || "—"}</dd>
    </div>
  );
}
