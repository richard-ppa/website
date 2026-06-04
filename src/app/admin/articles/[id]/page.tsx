// Server component shell. Static export needs one param enumerated.
// The real editing flow is at /admin/articles/new?id=<uuid> via the document
// editor; this route exists only so the [id] dynamic slot is satisfied.
import { Suspense } from "react";
import DocumentEditor from "./DocumentEditor";

export function generateStaticParams() {
  return [{ id: "new" }];
}

export default function ArticleEditorPage() {
  return (
    <Suspense fallback={null}>
      <DocumentEditor />
    </Suspense>
  );
}
