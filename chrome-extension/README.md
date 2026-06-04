# PPA Estimate Cover — Chrome Extension

A Chrome Manifest V3 extension that opens a self-contained React tool for
generating and merging cover pages onto customer estimate PDFs. The
extension is fully self-contained: once installed, it works offline with
no network dependencies.

## How to build

```bash
cd chrome-extension
npm install
npm run build
```

The build emits a Chrome-loadable extension into `chrome-extension/dist/`.

## How to install in Chrome (developer mode)

1. Build the extension (see above) — confirm `chrome-extension/dist/`
   exists and contains `manifest.json`, `background.js`, `index.html`,
   and an `assets/` folder.
2. Open Chrome and navigate to `chrome://extensions`.
3. Toggle **Developer mode** on (top-right).
4. Click **Load unpacked**.
5. Select the `chrome-extension/dist` directory.
6. The PPA Estimate Cover icon will appear in the toolbar. Click it to
   open the tool in a 1200×900 popup window.

After making code changes, rerun `npm run build` and click the reload
icon on the extension card in `chrome://extensions`.

## Offline behavior

The extension bundles every dependency it needs (`pdf-lib`,
`html2canvas-pro`, React) directly into `dist/`. There are no CDN
references, no remote fonts, and no `host_permissions` — MV3's strict
CSP requires bundled assets, and we comply. Once installed, the tool
runs entirely on the user's machine.

## Distribution

This scaffold is configured for **sideloading via developer mode** only.
Publishing to the Chrome Web Store (private / unlisted listing for
internal distribution) is a separate step that requires:

- A Chrome Web Store developer account (one-time $5 fee).
- A zipped build of `dist/`.
- Store listing assets (screenshots, promotional images, privacy
  disclosures).
- Setting visibility to **Unlisted** or **Private** so the listing is
  only available to people with the direct link / specific accounts.

That process is intentionally out of scope for the initial build.

## Project layout

```
chrome-extension/
├── manifest.json         # MV3 manifest (copied as-is into dist/ by Vite? see note)
├── index.html            # Popup window entry — mounts React
├── package.json
├── tsconfig.json
├── vite.config.ts
├── icons/                # 16/48/128 px PNGs referenced by manifest.json
└── src/
    ├── background.ts     # MV3 service worker — opens the popup window
    ├── main.tsx          # React 18 entry
    └── CoverTool.tsx     # Main app (currently a stub)
```

A small Vite plugin in `vite.config.ts` automatically copies
`manifest.json` and the `icons/` folder into `dist/` during the build,
so the output directory is directly loadable as an unpacked extension
with no manual steps.
