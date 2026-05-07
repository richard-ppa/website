"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader, PageContainer } from "@/components/admin/PageHeader";
import type { Article, BlogSection } from "@/lib/articles-types";

// Form state mirrors the Article shape but tolerates the empty-draft case.
interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  date_display: string;
  author: string;
  reading_time: string;
  hero_src: string;
  hero_alt: string;
  tags: string; // comma-separated input
  sections: BlogSection[];
  cta_headline: string;
  cta_body: string;
}

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  excerpt: "",
  category: "Field Insights",
  date: new Date().toISOString().slice(0, 10),
  date_display: "",
  author: "Plane Place Aviation",
  reading_time: "4 min read",
  hero_src: "",
  hero_alt: "",
  tags: "",
  sections: [],
  cta_headline: "",
  cta_body: "",
};

function articleToForm(a: Article): FormState {
  return {
    slug: a.slug ?? "",
    title: a.title ?? "",
    excerpt: a.excerpt ?? "",
    category: a.category ?? "",
    date: a.date ?? "",
    date_display: a.date_display ?? "",
    author: a.author ?? "",
    reading_time: a.reading_time ?? "",
    hero_src: a.hero_src ?? "",
    hero_alt: a.hero_alt ?? "",
    tags: (a.tags ?? []).join(", "),
    sections: a.sections ?? [],
    cta_headline: a.cta_headline ?? "",
    cta_body: a.cta_body ?? "",
  };
}

interface ArticlePayload {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  date_display: string;
  author: string;
  reading_time: string;
  hero_src: string;
  hero_alt: string;
  tags: string[];
  sections: BlogSection[];
  cta_headline: string | null;
  cta_body: string | null;
}

function formToPayload(f: FormState): ArticlePayload {
  return {
    slug: f.slug.trim(),
    title: f.title.trim(),
    excerpt: f.excerpt.trim(),
    category: f.category.trim(),
    date: f.date.trim(),
    date_display: f.date_display.trim() || formatFallbackDateDisplay(f.date),
    author: f.author.trim(),
    reading_time: f.reading_time.trim(),
    hero_src: f.hero_src.trim(),
    hero_alt: f.hero_alt.trim(),
    tags: f.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sections: f.sections,
    cta_headline: f.cta_headline.trim() || null,
    cta_body: f.cta_body.trim() || null,
  };
}

function formatFallbackDateDisplay(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Toast = { kind: "success" | "error" | "info"; message: string } | null;

export default function ArticleEditor() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();

  // Resolve the article ID from the URL pathname first, falling back to route
  // params. With static export + Cloudflare Pages SPA fallback (`_redirects`),
  // a UUID URL like /admin/articles/<uuid> is served by /admin/articles/new/
  // — useParams() reports "new" but the URL bar shows the UUID. usePathname()
  // sees the real URL, so we extract the segment from there.
  const idFromPath = useMemo(() => {
    if (!pathname) return null;
    const m = pathname.match(/^\/admin\/articles\/([^/]+)\/?$/);
    return m?.[1] ?? null;
  }, [pathname]);
  const id =
    idFromPath && idFromPath !== "new" ? idFromPath : params?.id ?? null;
  const isNew = !id || id === "new";

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [confirmModal, setConfirmModal] = useState<
    null | { kind: "publish" | "delete" | "unpublish" }
  >(null);

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
        setForm(articleToForm(data));
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

  // Auto-clear toast after 4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const slugValid = useMemo(
    () => form.slug === "" || SLUG_RE.test(form.slug),
    [form.slug]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSection(index: number, next: BlogSection) {
    setForm((prev) => {
      const sections = [...prev.sections];
      sections[index] = next;
      return { ...prev, sections };
    });
  }

  function addSection(kind: BlogSection["kind"]) {
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, blankSection(kind)],
    }));
  }

  function removeSection(index: number) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  }

  function moveSection(index: number, direction: -1 | 1) {
    setForm((prev) => {
      const sections = [...prev.sections];
      const swap = index + direction;
      if (swap < 0 || swap >= sections.length) return prev;
      [sections[index], sections[swap]] = [sections[swap], sections[index]];
      return { ...prev, sections };
    });
  }

  async function save(opts: { preview?: boolean } = {}): Promise<Article | null> {
    if (!slugValid) {
      setToast({ kind: "error", message: "Slug must be lowercase, hyphenated (e.g. my-post)." });
      return null;
    }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      let res: Response;
      if (isNew) {
        res = await fetch(`/admin/api/articles`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/admin/api/articles/${id}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        let errBody: { error?: string; details?: Record<string, string>; detail?: string } = {};
        try {
          errBody = await res.json();
        } catch {
          // ignore
        }
        const msg =
          errBody.detail ||
          (errBody.details && Object.entries(errBody.details).map(([k, v]) => `${k}: ${v}`).join("; ")) ||
          errBody.error ||
          `Save failed (${res.status})`;
        setToast({ kind: "error", message: msg });
        return null;
      }
      const data = (await res.json()) as Article;
      setArticle(data);
      setForm(articleToForm(data));
      setToast({
        kind: "success",
        message: opts.preview ? "Saved — opening preview…" : "Saved.",
      });
      if (isNew) {
        // Update the URL to the persistent editor URL via history API rather
        // than router.replace — under static export, /admin/articles/<uuid>
        // isn't a known Next.js route, so router-driven navigation would try
        // to fetch a non-existent page. Cloudflare Pages handles the URL via
        // the _redirects SPA fallback; we just need the URL bar to reflect it.
        window.history.replaceState(null, "", `/admin/articles/${data.id}`);
      }
      return data;
    } catch (e) {
      setToast({
        kind: "error",
        message: e instanceof Error ? e.message : "Save failed",
      });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function saveAndPreview() {
    const saved = await save({ preview: true });
    if (saved) {
      window.open(`/admin/preview/${saved.id}`, "_blank", "noopener,noreferrer");
    }
  }

  async function doPublish() {
    setConfirmModal(null);
    setPublishing(true);
    try {
      // Save first so the publish acts on the latest content
      const saved = await save();
      if (!saved) return;
      const res = await fetch(`/admin/api/articles/${saved.id}/publish`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        setToast({ kind: "error", message: `Publish failed (${res.status})` });
        return;
      }
      const data = (await res.json()) as { article: Article; webhook_triggered: boolean };
      setArticle(data.article);
      setForm(articleToForm(data.article));
      setToast({
        kind: "success",
        message: data.webhook_triggered
          ? "Published — deploy webhook fired."
          : "Published. Webhook didn't fire — trigger a manual deploy.",
      });
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Publish failed" });
    } finally {
      setPublishing(false);
    }
  }

  async function doUnpublish() {
    setConfirmModal(null);
    if (isNew || !article) return;
    setPublishing(true);
    try {
      const res = await fetch(`/admin/api/articles/${article.id}/unpublish`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) {
        setToast({ kind: "error", message: `Unpublish failed (${res.status})` });
        return;
      }
      const data = (await res.json()) as Article;
      setArticle(data);
      setForm(articleToForm(data));
      setToast({
        kind: "info",
        message: "Unpublished. Post will fall out of the next deploy.",
      });
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Unpublish failed" });
    } finally {
      setPublishing(false);
    }
  }

  async function doDelete() {
    setConfirmModal(null);
    if (isNew || !article) return;
    try {
      const res = await fetch(`/admin/api/articles/${article.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok && res.status !== 204) {
        setToast({ kind: "error", message: `Delete failed (${res.status})` });
        return;
      }
      router.push("/admin/articles");
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Delete failed" });
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse">
          <div className="h-8 w-72 bg-ppa-border mb-4" />
          <div className="h-4 w-44 bg-ppa-border mb-10" />
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-ppa-light border border-ppa-border" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (loadError) {
    return (
      <PageContainer>
        <div className="bg-red-50 border border-red-300 p-6 text-sm text-red-900">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-800 mb-2">
            Error
          </div>
          <div>{loadError}</div>
          <Link
            href="/admin/articles"
            className="inline-block mt-4 text-ppa-brass hover:text-ppa-brass-dark transition-colors text-sm font-medium"
          >
            ← Back to articles
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Link
          href="/admin/articles"
          className="text-[11px] uppercase tracking-[0.15em] text-ppa-muted hover:text-ppa-brass-dark transition-colors"
        >
          ← All articles
        </Link>
      </div>

      <PageHeader
        eyebrow={isNew ? "New article" : "Edit article"}
        title={form.title || (isNew ? "Untitled draft" : "Untitled")}
        description={
          article
            ? `${article.published ? "Published" : "Draft"}${
                article.published_at
                  ? ` · since ${article.published_at.slice(0, 10)}`
                  : ""
              }`
            : "Fill in the fields below — published defaults to false."
        }
      />

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        {/* Main fields */}
        <div className="space-y-6">
          <FieldGroup title="Identity">
            <Field label="Title" required>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field
              label="Slug"
              required
              error={!slugValid ? "Lowercase letters, digits, and hyphens only." : undefined}
              hint="URL path: /blog/<slug>"
            >
              <input
                type="text"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                className={inputClass}
                placeholder="challenger-300-main-entry-corrosion"
              />
            </Field>
            <Field label="Category" required>
              <input
                type="text"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputClass}
                placeholder="Field Insights"
              />
            </Field>
            <Field label="Tags" hint="Comma-separated. Example: Challenger 300, Corrosion, 192-Month Inspection">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
                className={inputClass}
              />
            </Field>
          </FieldGroup>

          <FieldGroup title="Excerpt">
            <Field label="Excerpt" required hint="Shown above the body and in social previews.">
              <textarea
                value={form.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </Field>
          </FieldGroup>

          <FieldGroup title="Hero image">
            <Field label="Hero src" required hint="Path or URL. e.g. /blog/images/my-post/hero.jpg">
              <input
                type="text"
                value={form.hero_src}
                onChange={(e) => update("hero_src", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Hero alt text" required>
              <input
                type="text"
                value={form.hero_alt}
                onChange={(e) => update("hero_alt", e.target.value)}
                className={inputClass}
              />
            </Field>
          </FieldGroup>

          <FieldGroup title="Sections">
            <SectionsEditor
              sections={form.sections}
              onUpdate={updateSection}
              onAdd={addSection}
              onRemove={removeSection}
              onMove={moveSection}
            />
          </FieldGroup>

          <FieldGroup title="Bottom CTA (optional)">
            <Field label="CTA headline" hint="Falls back to a generic message when blank.">
              <input
                type="text"
                value={form.cta_headline}
                onChange={(e) => update("cta_headline", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="CTA body">
              <textarea
                value={form.cta_body}
                onChange={(e) => update("cta_body", e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </Field>
          </FieldGroup>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <FieldGroup title="Status">
            <div className="flex items-center gap-3">
              <StatusBadge published={article?.published ?? false} />
              {article?.updated_at && (
                <span className="text-xs text-ppa-muted">
                  Last edited {article.updated_at.slice(0, 10)}
                </span>
              )}
            </div>
          </FieldGroup>

          <FieldGroup title="Publication">
            <Field label="Date" required hint="YYYY-MM-DD. Used for sort order and JSON-LD.">
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field
              label="Date display"
              hint={`Shown in the byline. Auto-fills as "${formatFallbackDateDisplay(form.date)}" when blank.`}
            >
              <input
                type="text"
                value={form.date_display}
                onChange={(e) => update("date_display", e.target.value)}
                className={inputClass}
                placeholder={formatFallbackDateDisplay(form.date)}
              />
            </Field>
            <Field label="Author" required>
              <input
                type="text"
                value={form.author}
                onChange={(e) => update("author", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Reading time" required hint='Format: "4 min read"'>
              <input
                type="text"
                value={form.reading_time}
                onChange={(e) => update("reading_time", e.target.value)}
                className={inputClass}
              />
            </Field>
          </FieldGroup>

          <FieldGroup title="Actions">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => save()}
                disabled={saving || publishing}
                className={primaryBtn}
              >
                {saving ? "Saving…" : isNew ? "Create draft" : "Save"}
              </button>
              <button
                type="button"
                onClick={saveAndPreview}
                disabled={saving || publishing}
                className={secondaryBtn}
              >
                Save & preview
              </button>

              {!isNew && article && !article.published && (
                <button
                  type="button"
                  onClick={() => setConfirmModal({ kind: "publish" })}
                  disabled={saving || publishing}
                  className={publishBtn}
                >
                  {publishing ? "Publishing…" : "Publish"}
                </button>
              )}
              {!isNew && article && article.published && (
                <button
                  type="button"
                  onClick={() => setConfirmModal({ kind: "unpublish" })}
                  disabled={saving || publishing}
                  className={secondaryBtn}
                >
                  Unpublish
                </button>
              )}
              {!isNew && article && (
                <button
                  type="button"
                  onClick={() => setConfirmModal({ kind: "delete" })}
                  disabled={saving || publishing}
                  className={dangerBtn}
                >
                  Delete
                </button>
              )}
            </div>
          </FieldGroup>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 text-sm shadow-lg max-w-sm border ${
            toast.kind === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : toast.kind === "error"
              ? "bg-red-50 border-red-300 text-red-900"
              : "bg-ppa-light border-ppa-border text-ppa-black"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Confirm modal */}
      {confirmModal && (
        <ConfirmModal
          kind={confirmModal.kind}
          onConfirm={
            confirmModal.kind === "publish"
              ? doPublish
              : confirmModal.kind === "unpublish"
              ? doUnpublish
              : doDelete
          }
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </PageContainer>
  );
}

// ============================================================
// Section editor sub-components
// ============================================================

const SECTION_KINDS: BlogSection["kind"][] = [
  "paragraph",
  "heading",
  "figure",
  "takeaways",
  "callout",
];

function blankSection(kind: BlogSection["kind"]): BlogSection {
  switch (kind) {
    case "paragraph":
      return { kind: "paragraph", text: "" };
    case "heading":
      return { kind: "heading", text: "" };
    case "figure":
      return { kind: "figure", src: "", alt: "", caption: "" };
    case "takeaways":
      return { kind: "takeaways", items: [{ label: "", text: "" }] };
    case "callout":
      return { kind: "callout", text: "" };
  }
}

interface SectionsEditorProps {
  sections: BlogSection[];
  onUpdate: (index: number, next: BlogSection) => void;
  onAdd: (kind: BlogSection["kind"]) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

function SectionsEditor({ sections, onUpdate, onAdd, onRemove, onMove }: SectionsEditorProps) {
  const [addKind, setAddKind] = useState<BlogSection["kind"]>("paragraph");

  return (
    <div className="space-y-3">
      {sections.length === 0 && (
        <div className="text-sm text-ppa-muted italic p-4 border border-dashed border-ppa-border">
          No sections yet. Add a paragraph, heading, figure, takeaways list, or callout below.
        </div>
      )}
      {sections.map((s, i) => (
        <SectionCard
          key={i}
          index={i}
          section={s}
          isFirst={i === 0}
          isLast={i === sections.length - 1}
          onUpdate={(next) => onUpdate(i, next)}
          onRemove={() => onRemove(i)}
          onMoveUp={() => onMove(i, -1)}
          onMoveDown={() => onMove(i, 1)}
        />
      ))}

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-ppa-border">
        <select
          value={addKind}
          onChange={(e) => setAddKind(e.target.value as BlogSection["kind"])}
          className={`${inputClass} max-w-[200px]`}
        >
          {SECTION_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => onAdd(addKind)} className={secondaryBtn}>
          + Add section
        </button>
      </div>
    </div>
  );
}

interface SectionCardProps {
  index: number;
  section: BlogSection;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (next: BlogSection) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SectionCard({
  index,
  section,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SectionCardProps) {
  function changeKind(kind: BlogSection["kind"]) {
    onUpdate(blankSection(kind));
  }

  return (
    <div className="bg-ppa-white border border-ppa-border p-4">
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-ppa-border">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ppa-muted">
            #{index + 1}
          </span>
          <select
            value={section.kind}
            onChange={(e) => changeKind(e.target.value as BlogSection["kind"])}
            className="px-2 py-1 text-xs border border-ppa-border bg-ppa-white text-ppa-black focus:outline-none focus:border-ppa-brass"
          >
            {SECTION_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-ppa-muted hover:text-ppa-black disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move up"
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-ppa-muted hover:text-ppa-black disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move down"
            title="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-700 hover:text-red-900"
            aria-label="Remove"
            title="Remove section"
          >
            ✕
          </button>
        </div>
      </div>

      {section.kind === "paragraph" && (
        <textarea
          value={section.text}
          onChange={(e) => onUpdate({ kind: "paragraph", text: e.target.value })}
          className={textareaClass}
          rows={4}
          placeholder="Paragraph text. Use **bold** for emphasis."
        />
      )}

      {section.kind === "heading" && (
        <input
          type="text"
          value={section.text}
          onChange={(e) => onUpdate({ kind: "heading", text: e.target.value })}
          className={inputClass}
          placeholder="Heading text"
        />
      )}

      {section.kind === "figure" && (
        <div className="space-y-2">
          <input
            type="text"
            value={section.src}
            onChange={(e) =>
              onUpdate({ kind: "figure", src: e.target.value, alt: section.alt, caption: section.caption })
            }
            className={inputClass}
            placeholder="Image src (e.g. /blog/images/post/figure-1.png)"
          />
          <input
            type="text"
            value={section.alt}
            onChange={(e) =>
              onUpdate({ kind: "figure", src: section.src, alt: e.target.value, caption: section.caption })
            }
            className={inputClass}
            placeholder="Alt text"
          />
          <input
            type="text"
            value={section.caption}
            onChange={(e) =>
              onUpdate({ kind: "figure", src: section.src, alt: section.alt, caption: e.target.value })
            }
            className={inputClass}
            placeholder="Caption"
          />
        </div>
      )}

      {section.kind === "takeaways" && (
        <TakeawaysEditor
          items={section.items}
          onChange={(items) => onUpdate({ kind: "takeaways", items })}
        />
      )}

      {section.kind === "callout" && (
        <textarea
          value={section.text}
          onChange={(e) => onUpdate({ kind: "callout", text: e.target.value })}
          className={textareaClass}
          rows={3}
          placeholder="Callout text — typically a quote or emphasis line."
        />
      )}
    </div>
  );
}

interface TakeawaysEditorProps {
  items: { label: string; text: string }[];
  onChange: (items: { label: string; text: string }[]) => void;
}

function TakeawaysEditor({ items, onChange }: TakeawaysEditorProps) {
  function update(index: number, key: "label" | "text", value: string) {
    const next = items.map((it, i) => (i === index ? { ...it, [key]: value } : it));
    onChange(next);
  }
  function add() {
    onChange([...items, { label: "", text: "" }]);
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function move(index: number, direction: -1 | 1) {
    const next = [...items];
    const swap = index + direction;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="border border-ppa-border p-2 bg-ppa-light/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ppa-muted">
              Item {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="px-1 text-ppa-muted hover:text-ppa-black disabled:opacity-30"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="px-1 text-ppa-muted hover:text-ppa-black disabled:opacity-30"
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="px-1 text-red-700 hover:text-red-900"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
          <input
            type="text"
            value={it.label}
            onChange={(e) => update(i, "label", e.target.value)}
            className={`${inputClass} mb-2`}
            placeholder="Label (e.g. Verify the service bulletins)"
          />
          <textarea
            value={it.text}
            onChange={(e) => update(i, "text", e.target.value)}
            className={textareaClass}
            rows={2}
            placeholder="Detail text"
          />
        </div>
      ))}
      <button type="button" onClick={add} className={`${secondaryBtn} w-full`}>
        + Add takeaway
      </button>
    </div>
  );
}

// ============================================================
// Confirm modal + small UI bits
// ============================================================

function ConfirmModal({
  kind,
  onConfirm,
  onCancel,
}: {
  kind: "publish" | "unpublish" | "delete";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const copy =
    kind === "publish"
      ? {
          title: "Publish article?",
          body: "Publishing fires a Cloudflare Pages redeploy. The post will appear on the live site after the build completes (~2 min).",
          confirm: "Publish & deploy",
          confirmClass: publishBtn,
        }
      : kind === "unpublish"
      ? {
          title: "Unpublish article?",
          body: "The post will fall out of the next deploy. No redeploy is triggered.",
          confirm: "Unpublish",
          confirmClass: secondaryBtn,
        }
      : {
          title: "Delete article?",
          body: "This permanently deletes the article from Supabase. Cannot be undone.",
          confirm: "Delete permanently",
          confirmClass: dangerBtn,
        };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ppa-black/60 p-4">
      <div className="bg-ppa-white border border-ppa-border max-w-md w-full p-6">
        <h3 className="font-display text-2xl text-ppa-black mb-2">{copy.title}</h3>
        <p className="text-sm text-ppa-gray mb-6">{copy.body}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={secondaryBtn}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={copy.confirmClass}>
            {copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-ppa-white border border-ppa-border p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted mb-4">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-ppa-black mb-1.5">
        {label}
        {required && <span className="text-ppa-brass ml-1">*</span>}
      </div>
      {children}
      {error && <div className="text-xs text-red-700 mt-1">{error}</div>}
      {!error && hint && <div className="text-xs text-ppa-muted mt-1">{hint}</div>}
    </label>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  if (published) {
    return (
      <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-sm">
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ppa-muted bg-ppa-light border border-ppa-border rounded-sm">
      Draft
    </span>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm bg-ppa-white border border-ppa-border text-ppa-black focus:outline-none focus:border-ppa-brass focus:ring-0";
const textareaClass =
  "w-full px-3 py-2 text-sm bg-ppa-white border border-ppa-border text-ppa-black focus:outline-none focus:border-ppa-brass focus:ring-0 font-light leading-relaxed resize-y";
const primaryBtn =
  "w-full px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center";
const secondaryBtn =
  "px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-black bg-ppa-white border border-ppa-border hover:border-ppa-brass/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center";
const publishBtn =
  "w-full px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-ppa-white bg-emerald-700 hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center";
const dangerBtn =
  "w-full px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-red-800 bg-ppa-white border border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center";
