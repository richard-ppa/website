"""Generate CLOUDFLARE-REDIRECTS.xlsx from the migration redirect ruleset.

Run: python scripts/generate-redirects-xlsx.py
Outputs: CLOUDFLARE-REDIRECTS.xlsx (3 sheets — Redirects, Verification, Checklist)
"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

OLD = "https://planeplaceaviation.com"
NEW = "https://ppa.aero"

# (section, source, target, status, match_type, notes)
RULES = [
    # 1. Apex catchall
    ("Apex catchall", f"{OLD}/*", f"{NEW}/$1", 301, "Wildcard",
     "Catchall apex. Configure as Bulk Redirect with subpath_matching=true OR as a Redirect Rule with path wildcard."),
    ("Apex catchall", "https://www.planeplaceaviation.com/*", f"{NEW}/$1", 301, "Wildcard",
     "WWW variant catchall."),

    # 2. Static pages
    ("Static page", f"{OLD}/services/", f"{NEW}/services", 301, "Exact", ""),
    ("Static page", f"{OLD}/about/", f"{NEW}/about", 301, "Exact", ""),
    ("Static page", f"{OLD}/contact/", f"{NEW}/contact", 301, "Exact", ""),

    # 3. Capabilities (1:1)
    ("Capabilities", f"{OLD}/capabilities/", f"{NEW}/capabilities", 301, "Exact",
     "Highest-value redirect. Old page ranks #4 for citation 650 aircraft maintenance and other cross-airframe queries. "
     "New /capabilities page mirrors topical scope with body prose preserving factory-trained Challenger 300/350 technicians "
     "and extensive Hawker parts inventory."),

    # 3a. Internal /aircraft → /capabilities (ppa.aero zone, short-lived)
    ("Internal /aircraft cleanup", f"{NEW}/aircraft", f"{NEW}/capabilities", 301, "Exact",
     "ppa.aero zone (NOT planeplaceaviation.com). Add for ~30 days then remove. Site briefly used /aircraft URLs before "
     "renaming to /capabilities."),
    ("Internal /aircraft cleanup", f"{NEW}/aircraft/hawker", f"{NEW}/capabilities/hawker", 301, "Exact", "ppa.aero zone."),
    ("Internal /aircraft cleanup", f"{NEW}/aircraft/citation", f"{NEW}/capabilities/citation", 301, "Exact", "ppa.aero zone."),
    ("Internal /aircraft cleanup", f"{NEW}/aircraft/challenger", f"{NEW}/capabilities/challenger", 301, "Exact", "ppa.aero zone."),

    # 4. Gallery
    ("Gallery", f"{OLD}/gallery/", f"{NEW}/gallery", 301, "Exact",
     "Old /gallery had 4,422 imp at pos 4.4 (mostly image search). New /gallery page has 36 photos + ImageGallery JSON-LD."),

    # 5. News index
    ("News index", f"{OLD}/news/", f"{NEW}/blog", 301, "Exact", "Watch GSC for soft-404 reports."),

    # 6. News posts → recreated blog entries
    ("News post", f"{OLD}/aog-mrt/", f"{NEW}/services#aog-response", 301, "Exact",
     "Brief AOG announcement. No dedicated equivalent."),
    ("News post", f"{OLD}/plane-place-aviation-boosts-mx-offering-in-texas-oklahoma/", f"{NEW}/services#aog-response", 301, "Exact",
     "AOG/MRT companion announcement."),
    ("News post", f"{OLD}/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/",
     f"{NEW}/blog/plane-place-aviation-taps-into-surging-demand-for-airframe-mro", 301, "Exact",
     "AIN trade-press article. 5,081 imp / 28 clicks. Highest backlink value."),
    ("News post", f"{OLD}/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities/",
     f"{NEW}/blog/plane-place-aviation-adds-new-challenger-604-605-and-650-capabilities", 301, "Exact",
     "Challenger 604/605/650 capability announcement. 2,410 imp pos 15."),
    ("News post", f"{OLD}/receives-faa-certification-as-a-part-145-repair-station/",
     f"{NEW}/blog/receives-faa-certification-as-a-part-145-repair-station", 301, "Exact",
     "FAA Part 145 cert post. 8,338 imp. Ranks for entire Part 145 query cluster (5,000+ imp combined)."),
    ("News post", f"{OLD}/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space/",
     f"{NEW}/blog/plane-place-aviation-expands-operations-with-move-to-larger-hangar-space", 301, "Exact",
     "Hangar expansion. Carries the 40,000 sq ft fact."),
    ("News post", f"{OLD}/now-hiring-ap-mechanic-avionics-technician/",
     f"{NEW}/blog/now-hiring-ap-mechanic-avionics-technician", 301, "Exact",
     "Careers post. 51 clicks / 1,479 imp / 3.5% CTR. Highest CTR on the site."),
    ("News post", f"{OLD}/plane-place-aviation-receives-mexico-afac-repair-station-certification/",
     f"{NEW}/blog/plane-place-aviation-receives-mexico-afac-repair-station-certification", 301, "Exact",
     "Mexico AFAC cert. 791 imp pos 7.8."),

    # 7. PDFs (decision pending)
    ("PDF (decision pending)", f"{OLD}/wp-content/uploads/2025/05/PP-Capabilities-Sell-Sheet-R3-LR.pdf",
     f"{NEW}/about", 301, "Exact",
     "DECISION NEEDED. Default: 301 to /about. Alternative: 410 Gone if sell sheets are stale and not migrated."),
    ("PDF (decision pending)", f"{OLD}/wp-content/uploads/2025/05/PP-Hawker-Sell-Sheet-R3-LR.pdf",
     f"{NEW}/capabilities/hawker", 301, "Exact", "DECISION NEEDED. 301 OR 410."),
    ("PDF (decision pending)", f"{OLD}/wp-content/uploads/2025/05/PP-Citation-Sell-Sheet-R4-LR.pdf",
     f"{NEW}/capabilities/citation", 301, "Exact", "DECISION NEEDED. 301 OR 410."),
    ("PDF (decision pending)", f"{OLD}/wp-content/uploads/2025/05/PP-Challenger-Sell-Sheet-R3-LR.pdf",
     f"{NEW}/capabilities/challenger", 301, "Exact", "DECISION NEEDED. 301 OR 410."),

    # 8. WordPress junk
    ("WordPress junk (404)", f"{OLD}/wp-admin/*", "(no redirect — return 404)", 404, "Wildcard",
     "Security hygiene. Do not redirect."),
    ("WordPress junk (404)", f"{OLD}/wp-login.php", "(no redirect — return 404)", 404, "Exact", "Security hygiene."),
    ("WordPress junk (404)", f"{OLD}/wp-includes/*", "(no redirect — return 404)", 404, "Wildcard", ""),
    ("WordPress junk (410)", f"{OLD}/feed/", "(return 410 Gone)", 410, "Exact", "RSS feed. No equivalent."),
    ("WordPress junk (410)", f"{OLD}/comments/feed/", "(return 410 Gone)", 410, "Exact", ""),
    ("WordPress junk (301)", f"{OLD}/category/uncategorized/", f"{NEW}/blog", 301, "Exact", "Single category page."),
    ("WordPress junk (301)", f"{OLD}/author/adecce15_admin/", f"{NEW}/about", 301, "Exact",
     "Author archive. 533 imp historical."),
]

VERIFICATIONS = [
    ("curl -sI https://planeplaceaviation.com/", "301 -> https://ppa.aero/", "Apex redirect."),
    ("curl -sI https://planeplaceaviation.com/services/", "301 -> https://ppa.aero/services", ""),
    ("curl -sI https://planeplaceaviation.com/capabilities/", "301 -> https://ppa.aero/capabilities", "Highest-value redirect."),
    ("curl -sI https://planeplaceaviation.com/gallery/", "301 -> https://ppa.aero/gallery", "Image-search rank preservation."),
    ("curl -sI https://planeplaceaviation.com/about/", "301 -> https://ppa.aero/about", ""),
    ("curl -sI https://planeplaceaviation.com/contact/", "301 -> https://ppa.aero/contact", ""),
    ("curl -sI https://planeplaceaviation.com/news/", "301 -> https://ppa.aero/blog", ""),
    ("curl -sI https://planeplaceaviation.com/receives-faa-certification-as-a-part-145-repair-station/",
     "301 -> https://ppa.aero/blog/receives-faa-certification-as-a-part-145-repair-station",
     "Highest-impression individual page (8,338 imp)."),
    ("curl -sI https://planeplaceaviation.com/plane-place-aviation-taps-into-surging-demand-for-airframe-mro/",
     "301 -> https://ppa.aero/blog/plane-place-aviation-taps-into-surging-demand-for-airframe-mro",
     "AIN article (5,081 imp / 28 clicks)."),
    ("curl -sI https://planeplaceaviation.com/now-hiring-ap-mechanic-avionics-technician/",
     "301 -> https://ppa.aero/blog/now-hiring-ap-mechanic-avionics-technician",
     "Careers post (highest CTR, 3.5%)."),
    ("curl -sI https://planeplaceaviation.com/wp-admin/", "404 (no Location header)", "Security hygiene. No redirect."),
]

CHECKLIST = [
    ("ppa.aero fully built and deployed with all migration SEO content", "DONE",
     "Citation 650 restored, factory-trained / 96-192-month / Hawker parts inventory prose, /capabilities hub, "
     "/gallery, breadcrumbs site-wide, 6 blog posts."),
    ("noindex meta REMOVED from src/app/layout.tsx and redeployed", "DONE", "Commit e4e052d, 2026-05-05."),
    ("curl -s https://ppa.aero/ | grep robots returns nothing", "DONE",
     "Verified. No robots meta tag in production HTML."),
    ("https://ppa.aero/sitemap.xml returns full sitemap", "DONE",
     "Includes /capabilities, /capabilities/[slug], /gallery, /blog, /blog/[slug]."),
    ("All recreated blog posts return 200 OK", "DONE",
     "FAA cert, AIN, Mexico AFAC, hangar, careers, Challenger 604/605/650."),
    ("Submit https://ppa.aero/sitemap.xml in GSC (ppa.aero property)", "TODO",
     "Manual step in Google Search Console."),
    ("Stage redirect rules at Cloudflare (planeplaceaviation.com zone)", "TODO",
     "Use Redirects sheet of this workbook for the full list."),
    ("Apply rules and run verification curls", "TODO", "See Verification sheet."),
    ("In GSC: cancel any active URL Removal requests on ppa.aero", "TODO",
     "If any were submitted earlier."),
    ("Wait 48h with stable redirects, then submit GSC Change of Address", "TODO",
     "From planeplaceaviation.com -> ppa.aero. Consolidates domain authority."),
    ("Decide: PDF sell sheets — migrate or 410?", "DECISION NEEDED",
     "4 PDFs in section 7 of Redirects sheet."),
]


def styled_header(cell):
    cell.fill = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")
    cell.font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)


def add_border(cell):
    cell.border = Border(
        left=Side(style="thin", color="D1D5DB"),
        right=Side(style="thin", color="D1D5DB"),
        top=Side(style="thin", color="D1D5DB"),
        bottom=Side(style="thin", color="D1D5DB"),
    )


def main():
    wb = openpyxl.Workbook()

    # Sheet 1: Redirects
    ws = wb.active
    ws.title = "Redirects"
    headers = ["#", "Section", "Source URL", "Target URL", "Status", "Match Type", "Notes"]
    for col, h in enumerate(headers, start=1):
        c = ws.cell(row=1, column=col, value=h)
        styled_header(c)
        add_border(c)

    for i, rule in enumerate(RULES, start=1):
        section, src, tgt, status, match, notes = rule
        row = i + 1
        ws.cell(row=row, column=1, value=i)
        ws.cell(row=row, column=2, value=section)
        ws.cell(row=row, column=3, value=src)
        ws.cell(row=row, column=4, value=tgt)
        ws.cell(row=row, column=5, value=status)
        ws.cell(row=row, column=6, value=match)
        ws.cell(row=row, column=7, value=notes)
        for col in range(1, 8):
            cc = ws.cell(row=row, column=col)
            cc.alignment = Alignment(vertical="top", wrap_text=True)
            add_border(cc)

    widths = [5, 26, 70, 70, 8, 12, 60]
    for col, w in enumerate(widths, start=1):
        ws.column_dimensions[chr(64 + col)].width = w
    ws.freeze_panes = "A2"

    # Sheet 2: Verification
    ws2 = wb.create_sheet("Verification")
    for col, h in enumerate(["Test command", "Expected result", "Notes"], start=1):
        c = ws2.cell(row=1, column=col, value=h)
        styled_header(c)
        add_border(c)
    for i, v in enumerate(VERIFICATIONS, start=2):
        for col, val in enumerate(v, start=1):
            cc = ws2.cell(row=i, column=col, value=val)
            cc.alignment = Alignment(vertical="top", wrap_text=True)
            add_border(cc)
    ws2.column_dimensions["A"].width = 80
    ws2.column_dimensions["B"].width = 70
    ws2.column_dimensions["C"].width = 50
    ws2.freeze_panes = "A2"

    # Sheet 3: Checklist
    ws3 = wb.create_sheet("Checklist")
    for col, h in enumerate(["Step", "Status", "Notes"], start=1):
        c = ws3.cell(row=1, column=col, value=h)
        styled_header(c)
        add_border(c)
    status_colors = {
        "DONE": "DCFCE7",
        "TODO": "FEF3C7",
        "DECISION NEEDED": "FEE2E2",
    }
    for i, item in enumerate(CHECKLIST, start=2):
        for col, val in enumerate(item, start=1):
            cc = ws3.cell(row=i, column=col, value=val)
            cc.alignment = Alignment(vertical="top", wrap_text=True)
            add_border(cc)
            if col == 2 and val in status_colors:
                cc.fill = PatternFill(start_color=status_colors[val], end_color=status_colors[val], fill_type="solid")
    ws3.column_dimensions["A"].width = 70
    ws3.column_dimensions["B"].width = 18
    ws3.column_dimensions["C"].width = 60
    ws3.freeze_panes = "A2"

    try:
        wb.save("CLOUDFLARE-REDIRECTS.xlsx")
        print(f"Created CLOUDFLARE-REDIRECTS.xlsx with {len(RULES)} redirect rules across 3 sheets")
    except PermissionError:
        print("Skipped CLOUDFLARE-REDIRECTS.xlsx (file is open in Excel — close it to regenerate)")

    # WordPress import CSV — Redirection plugin format
    # Columns: source, target, regex, code
    # Source = path only (no domain), since WordPress IS planeplaceaviation.com
    #
    # SAFETY: the catchall /(.*) and /wp-admin/, /wp-login.php, /wp-includes/, /wp-content/*
    # rules are EXCLUDED from the WordPress CSV. Reasons:
    #   - /wp-admin/ → 404 would lock you out of WP admin
    #   - /wp-login.php → 404 same
    #   - /wp-includes/ → 404 breaks WP core file loading
    #   - Apex /(.*) catchall would match /wp-admin/ too, redirecting admin to ppa.aero
    # These rules are appropriate at the Cloudflare level AFTER WordPress is decommissioned,
    # but dangerous while WP is still serving the site.
    #
    # URLs not in the explicit list will continue to render WordPress's normal response
    # (typically 404 for unknown paths, which is fine during migration).
    SKIP_FOR_WORDPRESS = {
        "/wp-admin/(.*)",
        "/wp-login.php",
        "/wp-includes/(.*)",
        "/(.*)",  # apex catchall
    }

    import csv
    seen_sources = set()
    specific = []
    for section, src, tgt, status, match, _notes in RULES:
        # Skip internal ppa.aero zone rules (Cloudflare for new domain handles those)
        if "ppa.aero/aircraft" in src:
            continue
        # Convert source from full URL to path
        if src.startswith(OLD):
            src_path = src[len(OLD):]
        elif src.startswith("https://www.planeplaceaviation.com"):
            # Skip WWW catchall — WordPress canonicalizes www to apex anyway
            continue
        else:
            continue
        tgt_clean = tgt if tgt.startswith("http") else ""
        is_regex = "1" if match == "Wildcard" else "0"
        if is_regex == "1":
            src_path = src_path.replace("/*", "/(.*)")
        # Skip dangerous rules for WordPress context
        if src_path in SKIP_FOR_WORDPRESS:
            continue
        key = (src_path, tgt_clean, is_regex, status)
        if key in seen_sources:
            continue
        seen_sources.add(key)
        specific.append([src_path, tgt_clean, is_regex, status])

    with open("wordpress-redirects.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["source", "target", "regex", "code"])
        for row in specific:
            w.writerow(row)
    print(f"Created wordpress-redirects.csv ({len(specific)} rules — WordPress-safe, no catchall/wp-admin)")


if __name__ == "__main__":
    main()
