import type { ArticleStatus } from "@/lib/articles-types";

/**
 * Small uppercase status chip used in the articles list + editor.
 * Visual spec (from supabase/STATUS-WORKFLOW-SPEC.md):
 *   - DRAFT:        bg #E5E7EB, text #374151
 *   - NEEDS REVIEW: bg #E0F2FE, text #0C7CB0
 *   - PUBLISHED:    bg #DCFCE7, text #15803D
 */
export interface StatusBadgeProps {
  status: ArticleStatus | string | null | undefined;
  className?: string;
}

const BADGE_STYLES: Record<ArticleStatus, { bg: string; fg: string; label: string }> = {
  draft: { bg: "#E5E7EB", fg: "#374151", label: "Draft" },
  in_review: { bg: "#E0F2FE", fg: "#0C7CB0", label: "Needs Review" },
  published: { bg: "#DCFCE7", fg: "#15803D", label: "Published" },
};

function normalize(status: StatusBadgeProps["status"]): ArticleStatus {
  if (status === "in_review" || status === "published" || status === "draft") {
    return status;
  }
  // Defensive default — if a row predates the status migration, treat it
  // as a draft. Published rows always have status set by the publish
  // endpoint, so this only impacts legacy un-migrated rows.
  return "draft";
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const s = normalize(status);
  const style = BADGE_STYLES[s];
  return (
    <span
      className={`inline-flex items-center uppercase font-semibold ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.fg,
        fontSize: "10px",
        letterSpacing: "0.18em",
        padding: "4px 8px",
        borderRadius: "3px",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {style.label}
    </span>
  );
}
