// Builds index.html from template.html: fills in the gauge ticks plus the widget tiles and
// chart panels drawn in art.mjs, then formats the result with Prettier.
//   node tools/generate/build.mjs          write index.html
//   node tools/generate/build.mjs --check  exit 1 if index.html is out of date
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import { tiles, panels } from "./art.mjs";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
const output = here("../../index.html");

// The download button links to this release's own disk image. Each release gets a new URL,
// so no browser or proxy can hand out an older installer from cache. Bump on every release.
const release = "1.0.4";
const dmg = `Slopometer-${release}.dmg`;

// Gauge ticks 0..69 on a 180° dial: 15 steps, labels at 0, 23, 46, 69.
let ticks = "";
for (let k = 0; k <= 15; k++) {
  const v = (k * 69) / 15;
  const a = Math.PI * (1 - k / 15);
  const R = 150;
  const r = k % 5 ? 136 : 124;
  const x1 = 200 + R * Math.cos(a);
  const y1 = 200 - R * Math.sin(a);
  const x2 = 200 + r * Math.cos(a);
  const y2 = 200 - r * Math.sin(a);
  ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"${k % 5 ? "" : ' class="major"'}/>`;
  if (k % 5 === 0) {
    const tx = 200 + 104 * Math.cos(a);
    const ty = 200 - 104 * Math.sin(a) + 8;
    ticks += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}">${v}</text>`;
  }
}

const html = readFileSync(here("template.html"), "utf8")
  .replace("%%TILES%%", tiles)
  .replace("%%PANELS%%", panels)
  .replace("%%TICKS%%", ticks)
  .replaceAll("%%DMG%%", dmg);
const formatted = await format(html, { parser: "html" });

if (process.argv.includes("--check")) {
  if (readFileSync(output, "utf8") !== formatted) {
    console.error("index.html is out of date. Run: npm run generate");
    process.exit(1);
  }
  console.log("index.html matches the generator.");
} else {
  writeFileSync(output, formatted);
  console.log("Wrote index.html");
}
