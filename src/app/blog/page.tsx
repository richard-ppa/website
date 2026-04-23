import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Field Insights — Plane Place Aviation Blog",
  description:
    "Technical notes and field insights from the Plane Place Aviation team — recurring structural issues, inspection findings, and what operators of Hawker, Citation, and Challenger aircraft should know.",
  alternates: {
    canonical: "https://ppa.aero/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      {/* Header — cinematic hero */}
      <section className="relative h-[65vh] min-h-[480px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/tech-on-lift.jpg"
            alt="PPA technician on a lift working on a business jet"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ppa-black via-ppa-black/55 to-ppa-black/10" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 lg:pb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-ppa-brass-bright" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass-bright">
              Field Insights
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ppa-white leading-[0.95] max-w-4xl">
            Notes from the hangar floor.
          </h1>
          <p className="mt-6 text-lg text-ppa-light/85 font-light max-w-2xl leading-relaxed">
            Trends we&apos;re seeing across the Hawker, Citation, and Challenger
            fleets — written by the technicians doing the work.
          </p>
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="py-16 lg:py-24">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={featured.hero.src}
                  alt={featured.hero.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass">
                  <span>{featured.category}</span>
                  <span className="h-px w-6 bg-ppa-border" />
                  <span className="text-ppa-muted">{featured.dateDisplay}</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ppa-black leading-[1.05] mb-5 group-hover:text-ppa-brass transition-colors">
                  {featured.title}
                </h2>
                <p className="text-ppa-gray font-light leading-relaxed mb-6 max-w-xl">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-ppa-muted">
                  <span>{featured.author}</span>
                  <span className="h-1 w-1 rounded-full bg-ppa-border" />
                  <span>{featured.readingTime}</span>
                </div>
                <span className="mt-8 inline-flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-ppa-brass">
                  Read the piece
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Remaining posts */}
      {rest.length > 0 && (
        <section className="pb-24 lg:pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden mb-5">
                    <Image
                      src={post.hero.src}
                      alt={post.hero.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass mb-3">
                    {post.category} · {post.dateDisplay}
                  </div>
                  <h3 className="font-display text-2xl text-ppa-black leading-tight mb-3 group-hover:text-ppa-brass transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-ppa-gray font-light leading-relaxed text-sm">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
