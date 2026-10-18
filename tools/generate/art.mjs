// Sample-data illustrations for the Slopometer page, drawn to match the macOS app's views:
// the large widget's calendar (Shared/WidgetContent.swift), the dashboard grid, columns and
// line (Shared/SlopChart.swift), the quota card (App/MainView.swift + Shared/QuotaMeter.swift)
// and the menu bar panel (App/MenuPanel.swift). Every view shares one sample history.
let s = 7;
const rnd = () => (s = (s * 48271) % 2147483647) / 2147483647;
const ind = "                ";

// 96 days ending today, a Thursday with 42. Weekends are quieter. Nothing else beats 42,
// so today is the busiest visible day in every view.
const N = 96;
const weekday = (i) => (((i - (N - 1) + 4) % 7) + 7) % 7; // 0 = Sunday
const history = [];
for (let i = 0; i < N; i++) {
  const r = rnd();
  const quiet = weekday(i) === 0 || weekday(i) === 6;
  history.push(
    r < (quiet ? 0.45 : 0.1)
      ? 0
      : Math.min(40, Math.round(1 + r * r * (quiet ? 16 : 40))),
  );
}
history[N - 1] = 42;

// SlopTheme.level: GitHub-style levels scaled to the busiest visible day.
const level = (c, max) =>
  c <= 0 || max <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((c / max) * 4)));
const f = (n) => +n.toFixed(1);

// Large widget, grid style: 5 calendar weeks, Sunday-first columns, the current week last.
// Days after today are empty; every earlier day shows its count, zero included.
const cal = history.slice(-33);
const calMax = Math.max(...cal);
export const tiles = Array.from({ length: 35 }, (_, i) => {
  const col = i % 7,
    row = Math.floor(i / 7),
    c = cal[i];
  if (c === undefined)
    return `${ind}<span class="tile future" data-col="${col}" data-row="${row}"></span>`;
  return `${ind}<span class="tile l${level(c, calMax)}${i === 32 ? " today" : ""}" data-col="${col}" data-row="${row}">${c}</span>`;
}).join("\n");

const W = 320,
  H = 180;
const svg = (inner, label) =>
  `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${inner}</svg>`;

// Dashboard grid, 90 days (the default range): Sunday-first week columns, square cells with
// 2pt gaps and 2pt corners, today outlined, days after today left empty. No labels.
const g = history.slice(-90),
  gMax = Math.max(...g);
const CELL = 21,
  GAP = 1.5;
const gx = (W - (14 * CELL + 13 * GAP)) / 2,
  gy = (H - (7 * CELL + 6 * GAP)) / 2;
const lead = weekday(N - 90);
const grid = g
  .map((c, k) => {
    const cell = k + lead;
    return `<rect x="${f(gx + Math.floor(cell / 7) * (CELL + GAP))}" y="${f(gy + (cell % 7) * (CELL + GAP))}" width="${CELL}" height="${CELL}" rx="1.5" class="f${level(c, gMax)}${k === 89 ? " s-today" : ""}"/>`;
  })
  .join("");

// Columns and line, 30 days: Swift Charts with gridlines, y from zero to a rounded 50.
// Axis labels and the legend are left out so the panned art never clips text.
const d = history.slice(-30),
  dMax = Math.max(...d);
const X0 = 4,
  X1 = 316,
  Y0 = 166,
  YT = 14,
  slot = (X1 - X0) / 30;
const y = (v) => Y0 - (v / 50) * (Y0 - YT);
const gridlines =
  [0, 10, 20, 30, 40, 50]
    .map(
      (v) =>
        `<line x1="0" y1="${f(y(v))}" x2="${W}" y2="${f(y(v))}" class="s-grid"/>`,
    )
    .join("") +
  d
    .map((_, i) =>
      weekday(N - 30 + i) === 0
        ? `<line x1="${f(X0 + i * slot)}" y1="${YT}" x2="${f(X0 + i * slot)}" y2="${Y0}" class="s-grid"/>`
        : "",
    )
    .join("");
const bw = slot * 0.7;
const bars = d
  .map((c, i) =>
    c
      ? `<rect x="${f(X0 + i * slot + (slot - bw) / 2)}" y="${f(y(c))}" width="${f(bw)}" height="${f(Y0 - y(c))}" class="f${level(c, dMax)}${i === 29 ? " o-today" : ""}"/>`
      : "",
  )
  .join("");
const cx = (i) => f(X0 + (i + 0.5) * slot);
const daily = d.map((c, i) => `${cx(i)},${f(y(c))}`).join(" ");
// MovingAverage.trailing: the full 7-day window, taken from the history before the range.
const avg = d.map((_, i) => {
  const j = N - 30 + i;
  return history.slice(j - 6, j + 1).reduce((a, b) => a + b, 0) / 7;
});
const average = avg.map((v, i) => `${cx(i)},${f(y(v))}`).join(" ");
const line =
  gridlines +
  `<polyline points="${daily}" fill="none" class="s-accent" stroke-width="2" stroke-linejoin="round"/>` +
  `<polyline points="${average}" fill="none" class="s-trend" stroke-width="2" stroke-dasharray="4 3"/>`;

// Quota card: count over target, title and detail, status, then the meter. A 69 target is
// past the 20-tick limit, so the meter is the continuous capsule track.
const meterW = 248;
const quota =
  `<rect x="22" y="26" width="276" height="126" rx="12" class="f-card"/>` +
  `<text x="36" y="78" class="q-num">67</text><text x="82" y="78" class="q-den">/ 69</text>` +
  `<text x="128" y="78" class="q-title">Daily slop quota</text>` +
  `<text x="128" y="92" class="q-sub">67 of 69 PRs merged today</text>` +
  `<path d="M243 69.5h6M243 78.5h6M243.5 69.5l5 4.5-5 4.5M248.5 69.5l-5 4.5 5 4.5" fill="none" class="s-muted"/>` +
  `<text x="284" y="78" class="q-status">2 to go</text>` +
  `<rect x="36" y="104" width="${meterW}" height="8" rx="4" class="f-track"/>` +
  `<rect x="36" y="104" width="${f((meterW * 67) / 69)}" height="8" rx="4" class="f-accent"/>` +
  `<path d="M37 128.5l3.5 3.5 3.5-3.5" fill="none" class="s-accent" stroke-width="1.4"/>` +
  `<text x="49" y="134" class="q-link">Show the 67 PRs counted</text>`;

// Menu bar: the status item (calendar icon and today's count, highlighted while open) and
// the top of its panel: caption, count, detail, then the last 7 days as numbered tiles.
const calendarIcon = (x, yy, size, cls) =>
  `<rect x="${x}" y="${yy + 1}" width="${size}" height="${size - 1}" rx="1.6" fill="none" class="${cls}"/>` +
  `<path d="M${x} ${yy + size * 0.38}h${size}M${x + size * 0.28} ${yy - 0.6}v2.6M${x + size * 0.72} ${yy - 0.6}v2.6" fill="none" class="${cls}"/>`;
const week = history.slice(-7),
  wMax = Math.max(...week);
const names = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
const TX = 64,
  TW = (212 - 6 * 4) / 7;
const weekRow = week
  .map((c, i) => {
    const x = TX + i * (TW + 4),
      l = level(c, wMax);
    return (
      `<rect x="${f(x)}" y="125" width="${f(TW)}" height="22" rx="4.8" class="f${l}${i === 6 ? " s-today" : ""}"/>` +
      `<text x="${f(x + TW / 2)}" y="140" class="m-tile n${l}">${c}</text>` +
      `<text x="${f(x + TW / 2)}" y="157" class="m-day">${names[i]}</text>`
    );
  })
  .join("");
const menubar =
  `<rect x="-10" y="0" width="340" height="24" class="f-bar"/>` +
  `<rect x="190" y="3" width="42" height="18" rx="5" class="f-hl"/>` +
  calendarIcon(196, 6, 11, "s-ink") +
  `<text x="211" y="16.5" class="m-bar">42</text>` +
  `<rect x="242" y="8" width="17" height="8.5" rx="2.4" fill="none" class="s-ink"/><rect x="244" y="10" width="11" height="4.5" rx="1" class="f-ink"/>` +
  `<text x="288" y="16.5" class="m-bar m-clock">Thu 9:41</text>` +
  `<rect x="48" y="29" width="244" height="190" rx="14" class="f-window"/>` +
  calendarIcon(64, 45, 10, "s-muted") +
  `<text x="78" y="54" class="m-cap">CONTRIBUTIONS</text>` +
  `<text x="63" y="84" class="m-big">42</text>` +
  `<text x="64" y="100" class="m-sub">Contributions today so far</text>` +
  `<text x="64" y="119" class="m-cap m-plain">Last 7 days</text>` +
  weekRow +
  `<line x1="48" y1="172" x2="292" y2="172" class="s-grid"/>`;

export const panels = [
  [
    "Grid",
    "Darker means sloppier.",
    svg(grid, "Contribution grid, sample data"),
  ],
  [
    "Columns",
    "One bar per day.",
    svg(gridlines + bars, "Daily columns, sample data"),
  ],
  [
    "Line + 7-day average",
    "Spiky days, smoothed out.",
    svg(line, "Line chart with moving average, sample data"),
  ],
  [
    "Daily slop quota",
    "Set a daily PR goal.",
    svg(quota, "Daily PR quota, sample data"),
  ],
  [
    "Menu bar",
    "Today's count, always up top.",
    svg(menubar, "Menu bar panel, sample data"),
  ],
]
  .map(
    ([t, desc, art]) => `${ind.slice(4)}<li class="panel">
${ind}<div class="panel-art">${art}</div>
${ind}<h3 data-jelly>${t}</h3>
${ind}<p>${desc}</p>
${ind.slice(4)}</li>`,
  )
  .join("\n");
