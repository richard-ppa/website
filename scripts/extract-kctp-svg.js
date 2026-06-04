// One-off helper: read the reference map-svg.js and emit a typed TS module
// containing the airport SVG inner content for use in our React components.
const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, '..', 'design_handoff_kctp_facility_map', '_reference', 'map-svg.js');
const targetPath = path.resolve(__dirname, '..', 'src', 'components', 'location', 'kctp-map-svg.ts');

const content = fs.readFileSync(sourcePath, 'utf8');
const fakeWindow = {};
const fn = new Function('window', content);
fn(fakeWindow);
const svg = fakeWindow.KCTP_MAP_SVG;

if (typeof svg !== 'string' || !svg.length) {
  throw new Error('Failed to extract KCTP_MAP_SVG');
}

// Escape for a TS template literal: backslash, backtick, and ${.
const escaped = svg
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const out =
  '// Auto-generated from design_handoff_kctp_facility_map/_reference/map-svg.js\n' +
  '// Inner contents of the airport SVG (without the <svg> wrapper).\n' +
  '\n' +
  'export const KCTP_MAP_SVG: string = `' +
  escaped +
  '`;\n';

fs.writeFileSync(targetPath, out, 'utf8');
console.log(`Wrote ${out.length} chars to ${targetPath}`);
