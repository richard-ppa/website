// Renders the document-style editor for the path
// /admin/articles/new?id=<uuid> (existing articles) or /admin/articles/new
// (new from scratch — not yet supported by the document editor).
import { Suspense } from "react";
import DocumentEditor from "../[id]/DocumentEditor";

export default function NewArticlePage() {
  return (
    <Suspense fallback={null}>
      <DocumentEditor />
    </Suspense>
  );
}
