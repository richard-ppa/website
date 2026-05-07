// Server component shell for the article editor.
//
// Static export needs at least one param enumerated for [id]. We export a
// minimal placeholder ("new") so the build succeeds — the editor loads the
// real article client-side via useParams + fetch. For UUID routes the
// admin SPA shell is served by Cloudflare Pages (admin routes are guarded
// by Cloudflare Access at the edge, so unknown IDs reach the same client
// component which then fetches /admin/api/articles/:id).
import Editor from "./Editor";

export function generateStaticParams() {
  // Static export needs at least one param. We pre-render the "new" route
  // here (serves /admin/articles/new) and rely on the sibling
  // /admin/articles/new/page.tsx + the editor reading useParams() at
  // runtime. Direct UUID URLs require Cloudflare Pages SPA-fallback
  // routing — see the README/follow-up note.
  return [{ id: "new" }];
}

export default function ArticleEditorPage() {
  return <Editor />;
}
