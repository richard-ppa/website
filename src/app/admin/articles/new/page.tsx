// Static route — wins over /[id]/page.tsx for the path /admin/articles/new.
// Renders the same Editor component, which reads "new" from useParams and
// starts with an empty draft.
import Editor from "../[id]/Editor";

export default function NewArticlePage() {
  return <Editor />;
}
