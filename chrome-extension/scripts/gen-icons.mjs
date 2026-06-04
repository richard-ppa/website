// One-off icon generator: renders the PP-only mark (extracted from
// public/images/logo.svg) into 16/48/128 px PNGs for the Chrome
// extension toolbar.
//
// Resolves `sharp` from the parent ppa-website node_modules so this
// script has no extra install step. Run from chrome-extension/ with:
//   node scripts/gen-icons.mjs

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(__dirname, '../../package.json'));
const sharp = require('sharp');

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="14 22 180 172">
  <g>
    <polygon fill="#00aeef" fill-rule="evenodd" points="84.01 143.17 97.45 166.45 57.16 166.45 43.3 190.45 17.31 190.45 72.31 95.19 85.31 117.7 70.6 143.17 84.01 143.17"/>
    <path fill="#273b81" fill-rule="evenodd" d="M188.47,72.36c0-26-21.27-47.27-47.27-47.27h-56.98c-1.43,0-2.84.06-4.24.19l13.3,23.04h47.92c13.22,0,24.04,10.82,24.04,24.04,0,11.85-8.69,21.76-20,23.69-8.13-14.38-23.57-24.16-41.18-24.16h-56.98c-1.43,0-2.84.06-4.24.19l13.3,23.04h47.92c13.22,0,24.04,10.82,24.04,24.04s-10.82,24.04-24.04,24.04h-3.58l12.88,22.31c21.59-4.35,37.97-23.53,37.97-46.35,0-.22-.01-.43-.02-.64,21.18-4.67,37.16-23.63,37.16-46.17Z"/>
  </g>
</svg>`;

const outDir = path.resolve(__dirname, '../icons');
const sizes = [16, 48, 128];

for (const size of sizes) {
  await sharp(Buffer.from(iconSvg))
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`icon-${size}.png written`);
}
