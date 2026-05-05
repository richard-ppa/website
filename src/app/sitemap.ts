import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog-posts";
import { AIRFRAMES } from "@/lib/constants";

export const dynamic = "force-static";

const BASE = "https://ppa.aero";
const TODAY = new Date("2026-05-05");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: TODAY, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/about`, lastModified: TODAY, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/services`, lastModified: TODAY, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/capabilities`, lastModified: TODAY, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/gallery`, lastModified: TODAY, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: TODAY, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: TODAY, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/quote`, lastModified: TODAY, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: TODAY, changeFrequency: "yearly", priority: 0.3 },
  ];

  const aircraftPages: MetadataRoute.Sitemap = Object.values(AIRFRAMES).map((airframe) => ({
    url: `${BASE}/capabilities/${airframe.slug}`,
    lastModified: TODAY,
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
