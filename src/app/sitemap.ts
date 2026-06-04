import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog-posts";
import { AIRFRAMES } from "@/lib/constants";

export const dynamic = "force-static";

const BASE = "https://ppa.aero";
// Evaluated at build time. Bumps lastModified on every deploy, which is the
// right signal for static evergreen pages we touch through site-wide edits.
// Per-post lastModified is set from the post's own date (see below).
const BUILD_TIME = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/about`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/careers`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/services`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/capabilities`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/gallery`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/quote`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: BUILD_TIME, changeFrequency: "yearly", priority: 0.3 },
  ];

  const aircraftPages: MetadataRoute.Sitemap = Object.values(AIRFRAMES).map((airframe) => ({
    url: `${BASE}/capabilities/${airframe.slug}`,
    lastModified: BUILD_TIME,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...aircraftPages, ...blogPages];
}
