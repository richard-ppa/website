# Seed data source — existing posts to migrate

The 8 posts below currently live hardcoded in `src/lib/blog-posts.ts`. The
seed script (`scripts/seed-articles.ts`, owned by the build-time agent)
must insert each into `public.articles` with `published = true` and
`published_at = date::timestamptz` so the ordering & freshness signals
match the pre-CMS site.

After seeding, `select count(*) from public.articles where published`
must return **8**. Re-running the seed must be a no-op (upsert on `slug`).

## Checklist (in current display order — newest first)

| #   | Date        | Slug                                                                          | Category       |
| --- | ----------- | ----------------------------------------------------------------------------- | -------------- |
| 1   | 2026-04-21  | `challenger-300-main-entry-corrosion`                                         | Field Insights |
| 2   | 2025-08-18  | `plane-place-aviation-receives-mexico-afac-repair-station-certification`      | Company News   |
| 3   | 2025-07-01  | `now-hiring-ap-mechanic-avionics-technician`                                  | Careers        |
| 4   | 2025-03-01  | `plane-place-aviation-expands-operations-with-move-to-larger-hangar-space`    | Company News   |
| 5   | 2024-09-01  | `plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities`       | Capabilities   |
| 6   | 2024-08-01  | `receives-faa-certification-as-a-part-145-repair-station`                     | Company News   |
| 7   | 2024-04-01  | `plane-place-aviation-taps-into-surging-demand-for-airframe-mro`              | Press          |

> Note: there are 7 unique slugs in `BLOG_POSTS` today (the brief estimated
> 8). Verify against `src/lib/blog-posts.ts` at seed time — if a post has
> been added between spec and execution, include it. The seed script reads
> `BLOG_POSTS` programmatically, so the array is the source of truth.

## Per-row mapping (current TS field → DB column)

| TS field      | DB column      | Notes                                                  |
| ------------- | -------------- | ------------------------------------------------------ |
| `slug`        | `slug`         | unique, used for upsert key                            |
| `title`       | `title`        |                                                        |
| `excerpt`     | `excerpt`      |                                                        |
| `category`    | `category`     |                                                        |
| `date`        | `date`         | YYYY-MM-DD string → date                               |
| `dateDisplay` | `date_display` |                                                        |
| `author`      | `author`       |                                                        |
| `readingTime` | `reading_time` |                                                        |
| `hero.src`    | `hero_src`     |                                                        |
| `hero.alt`    | `hero_alt`     |                                                        |
| `tags`        | `tags`         | text[]                                                 |
| `sections`    | `sections`     | jsonb — pass the array as-is, JSON.stringify           |
| `cta?.headline` | `cta_headline` | nullable — null if `cta` undefined or headline missing |
| `cta?.body`   | `cta_body`     | nullable                                               |
| —             | `published`    | hard-code `true` for the seed                          |
| —             | `published_at` | `date` at midnight UTC (so ordering stays date-based)  |

## Acceptance check

After seeding, this query must return rows in the same order as
`getAllPosts()` returned them pre-migration:

```sql
select slug, date, published
from public.articles
where published = true
order by date desc;
```
