# Installing the redirects on WordPress

While `planeplaceaviation.com` is still running on WordPress, you can apply the migration redirects directly there using the [Redirection plugin](https://wordpress.org/plugins/redirection/). The CSV file `wordpress-redirects.csv` in this repo is ready to import.

## Step-by-step

### 1. Install the Redirection plugin

WordPress admin → Plugins → Add New → search "Redirection" (by John Godley) → Install → Activate.

### 2. Initial setup

After activating, the plugin will run a quick setup wizard. Accept the defaults — monitor 404s and store IP info.

### 3. Import the CSV

Tools → Redirection → Import/Export tab → Import.

- Choose file: `wordpress-redirects.csv`
- Group: leave as default ("Redirections") or create a new group called "PPA Migration"
- Click Upload
- Confirm

You should see "22 redirects added."

### 4. Test a few

Open these in incognito to verify:

| URL on WordPress | Should land on |
|---|---|
| `https://planeplaceaviation.com/services/` | `https://ppa.aero/services` |
| `https://planeplaceaviation.com/capabilities/` | `https://ppa.aero/capabilities` |
| `https://planeplaceaviation.com/receives-faa-certification-as-a-part-145-repair-station/` | `https://ppa.aero/blog/receives-faa-certification-as-a-part-145-repair-station` |

### 5. Watch the 404 log

In Tools → Redirection → 404s tab, you'll see any old URLs that aren't in the redirect list but are still being requested. If you see anything important (a URL with traffic that we missed), add a redirect for it.

## What's NOT in the WordPress CSV (and why)

The full Cloudflare ruleset has a few things excluded from the WordPress version because they'd break the WordPress site:

- **Apex catchall `/(.*)` → ppa.aero**: Would also match `/wp-admin/` and lock you out of WP admin
- **`/wp-admin/*` → 404**: Same — needed for admin access
- **`/wp-login.php` → 404**: Needed for admin login
- **`/wp-includes/*` → 404**: Needed by WordPress core

These rules are appropriate at the **Cloudflare level after WordPress is decommissioned**, but dangerous while WP is live.

The trade-off: any URL not in the explicit redirect list will continue rendering whatever WordPress would normally serve (typically a 404 page from your theme). That's acceptable during the migration window — most traffic hits the indexed pages we covered.

## When to switch to Cloudflare redirects

WordPress redirects work but are slower (PHP layer). Once you're ready to fully decommission WordPress — typically after the migration is stable for 30 days — switch to the **full** Cloudflare ruleset (`CLOUDFLARE-REDIRECTS.xlsx`). That version includes the catchall and WP-junk blocks, since at that point WordPress is gone and there's no admin to protect.

Order of operations:
1. WordPress redirects active (using `wordpress-redirects.csv`)
2. Migration stable for 30+ days, GSC Change of Address complete
3. Move DNS for `planeplaceaviation.com` to Cloudflare
4. Configure full Cloudflare ruleset (`CLOUDFLARE-REDIRECTS.xlsx`)
5. Decommission WordPress hosting

## Regenerating the CSV

If the redirect plan changes, regenerate from the script:

```bash
python scripts/generate-redirects-xlsx.py
```

This regenerates both `CLOUDFLARE-REDIRECTS.xlsx` and `wordpress-redirects.csv`.
