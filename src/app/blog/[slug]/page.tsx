import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, type BlogSection } from "@/lib/blog-posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Plane Place Aviation`,
    description: post.excerpt,
    alternates: { canonical: `https://ppa.aero/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.hero.src, alt: post.hero.alt }],
    },
  };
}

function renderInline(text: string) {
  // Bold pass only — split on **…**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ppa-black">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Section({ section }: { section: BlogSection }) {
  switch (section.kind) {
    case "paragraph":
      return (
        <p className="text-ppa-dark font-light leading-[1.75] text-lg">
          {renderInline(section.text)}
        </p>
      );
    case "heading":
      return (
        <h2 className="font-display text-3xl lg:text-4xl text-ppa-black leading-tight mt-14 mb-2">
          {section.text}
        </h2>
      );
    case "figure":
      return (
        <figure className="my-10">
          <div className="relative aspect-[4/3] overflow-hidden bg-ppa-surface">
            <Image
              src={section.src}
              alt={section.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>
          <figcaption className="mt-3 text-sm text-ppa-muted italic leading-relaxed">
            {section.caption}
          </figcaption>
        </figure>
      );
    case "takeaways":
      return (
        <ol className="my-8 space-y-6 border-l-2 border-ppa-brass pl-6">
          {section.items.map((item, i) => (
            <li key={i}>
              <p className="font-display text-lg text-ppa-black mb-1">
                {item.label}
              </p>
              <p className="text-ppa-gray font-light leading-relaxed">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <blockquote className="my-12 py-8 border-y border-ppa-border">
          <p className="font-display text-2xl lg:text-3xl text-ppa-black leading-tight">
            {section.text}
          </p>
        </blockquote>
      );
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={post.hero.src}
            alt={post.hero.alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/60 to-ppa-black/10" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 lg:pb-20">
          <div className="flex items-center gap-3 mb-6 text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
            <span>{post.category}</span>
            <span className="h-px w-6 bg-ppa-brass-bright/50" />
            <span className="text-ppa-light/80">{post.dateDisplay}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-ppa-white leading-[0.95] max-w-4xl">
            {post.title}
          </h1>
          <div className="mt-8 flex items-center gap-4 text-sm text-ppa-light/80">
            <span>{post.author}</span>
            <span className="h-1 w-1 rounded-full bg-ppa-light/40" />
            <span>{post.readingTime}</span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <p className="text-xl lg:text-2xl text-ppa-black font-light leading-[1.5] mb-12">
            {post.excerpt}
          </p>
          <div className="space-y-6">
            {post.sections.map((section, i) => (
              <Section key={i} section={section} />
            ))}
          </div>

          {post.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-ppa-border flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ppa-muted px-3 py-1.5 border border-ppa-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ppa-light border-t border-ppa-border py-20 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl lg:text-5xl text-ppa-black leading-none">
              Seeing something similar on your aircraft?
            </h2>
            <p className="mt-3 text-ppa-gray max-w-xl">
              We handle Challenger structural work in-house. Send us the squawk
              or your upcoming inspection scope — we&apos;ll tell you what
              we&apos;d do about it.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/quote"
              className="px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-white bg-ppa-brass hover:bg-ppa-brass-dark transition-colors text-center"
            >
              Request a Quote
            </Link>
            <Link
              href="/blog"
              className="px-8 py-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-ppa-brass border border-ppa-brass/40 hover:bg-ppa-brass/10 transition-colors text-center"
            >
              More Field Insights
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
