import "./theme.css";

// Color presets mirrored from the Slopometer app (Sources/SlopometerCore/ThemePreset.swift,
// light appearance only) and the color math from SlopTheme.swift (WCAG contrast, OKLab
// mixing, `readable`). The chosen preset sets six CSS variables on <html>; the rest of the
// page reads them. Everything above the DOM section is pure so it can be tested in Node.

const PAPER = "#fbfdf5";
// SlopTheme.lightBackground: the app's light window background.
const APP_LIGHT_BACKGROUND = "#f5f5f5";
const INK = "#2a1636";
const STORAGE_KEY = "slopometer-theme";
const LEVEL_OPACITIES = [0.35, 0.55, 0.75, 1.0];

// --- sRGB, WCAG contrast, OKLab -------------------------------------------------------

const hexToRgb = (hex) => {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(
    (c) => c / 255,
  );
};

const clamp01 = (c) => Math.min(Math.max(c, 0), 1);

export const rgbToHex = (rgb) =>
  "#" +
  rgb
    .map((c) =>
      Math.round(clamp01(c) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gamma = (c) => {
  const v = clamp01(c);
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
};

const luminance = (rgb) => {
  const [r, g, b] = rgb.map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRgb = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** WCAG 2 contrast ratio of two hex colors, 1 to 21. */
export const contrast = (a, b) => contrastRgb(hexToRgb(a), hexToRgb(b));

const toOklab = (rgb) => {
  const [r, g, b] = rgb.map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const oklabToLinear = ([L, A, B]) => {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186168 * m + 1.707614701 * s,
  ];
};

const fromOklab = (lab) => oklabToLinear(lab).map(gamma);

const inGamut = (lab) =>
  oklabToLinear(lab).every((c) => c >= -1e-4 && c <= 1 + 1e-4);

/** `ThemeColor.mixed(with:by:)`: `t` of the way from `a` to `b` in OKLab. */
const mix = (a, b, t) => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const [x, y] = [toOklab(a), toOklab(b)];
  return fromOklab(x.map((v, i) => v + (y[i] - v) * t));
};

/** `ThemeColor.blended(over:opacity:)`: an opacity fill in sRGB. */
const blend = (color, background, opacity) =>
  color.map((c, i) => c * opacity + background[i] * (1 - opacity));

const prefersLightText = (rgb) =>
  contrastRgb(rgb, [1, 1, 1]) >= contrastRgb(rgb, [0, 0, 0]);

/** `ThemeColor.readable(on:ratio:)`: move only toward black or white until `ratio` holds. */
const readable = (color, background, ratio) => {
  if (contrastRgb(color, background) >= ratio) return color;
  const target = prefersLightText(background) ? [1, 1, 1] : [0, 0, 0];
  let [low, high] = [0, 1];
  for (let i = 0; i < 24; i += 1) {
    const middle = (low + high) / 2;
    if (contrastRgb(mix(color, target, middle), background) >= ratio)
      high = middle;
    else low = middle;
  }
  return mix(color, target, high);
};

/**
 * Like `readable`, but brightens a color for dark backgrounds while keeping its hue and as
 * much chroma as the sRGB gamut allows, so the bright accent stays vivid instead of washing
 * out toward white. Falls back to `readable` toward white if that still is not enough.
 */
const brightened = (color, backgrounds, ratio) => {
  const passes = (rgb) =>
    backgrounds.every((bg) => contrastRgb(rgb, bg) >= ratio);
  if (passes(color)) return color;
  const [L, A, B] = toOklab(color);
  const atLightness = (l) => {
    // Largest chroma scale (<= 1) that stays in gamut at this lightness.
    let [lo, hi] = [0, 1];
    if (inGamut([l, A, B])) return fromOklab([l, A, B]);
    for (let i = 0; i < 20; i += 1) {
      const k = (lo + hi) / 2;
      if (inGamut([l, A * k, B * k])) lo = k;
      else hi = k;
    }
    return fromOklab([l, A * lo, B * lo]);
  };
  if (!passes(atLightness(1))) {
    return backgrounds.reduce((c, bg) => readable(c, bg, ratio), color);
  }
  let [lo, hi] = [L, 1];
  for (let i = 0; i < 24; i += 1) {
    const middle = (lo + hi) / 2;
    if (passes(atLightness(middle))) hi = middle;
    else lo = middle;
  }
  return atLightness(hi);
};

const chroma = (rgb) => {
  const [, a, b] = toOklab(rgb);
  return Math.hypot(a, b);
};

// --- Presets: names, order, and light gradients exactly as in the app ------------------

export const PRESETS = [
  {
    id: "slop-green",
    name: "Slop Green",
    // #116329 at the level opacities over the app's light background, as in the app.
    gradient: LEVEL_OPACITIES.map((o) =>
      rgbToHex(blend(hexToRgb("#116329"), hexToRgb(APP_LIGHT_BACKGROUND), o)),
    ),
    accent: "#116329",
    goo: "#7bc96f",
  },
  {
    id: "github",
    name: "GitHub",
    gradient: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
  },
  {
    id: "electric",
    name: "Electric",
    gradient: ["#7dd3fc", "#38bdf8", "#6366f1", "#7c3aed"],
  },
  {
    id: "vibe-coded",
    name: "Vibe Coded",
    gradient: ["#c4b5fd", "#a855f7", "#d946ef", "#db2777"],
  },
  {
    id: "rainbow",
    name: "Rainbow",
    gradient: [
      "#e5484d",
      "#f76b15",
      "#ffc53d",
      "#46a758",
      "#0090ff",
      "#3e63dd",
      "#8e4ec6",
    ],
    smooth: true,
  },
  {
    id: "sunset",
    name: "Sunset",
    gradient: ["#ffd166", "#f4845f", "#e0457b", "#9d2b6b"],
  },
  {
    id: "ocean",
    name: "Ocean",
    gradient: ["#99e2e0", "#2ea8c9", "#1f6fb5", "#1b3f8b"],
  },
  {
    id: "halloween",
    name: "Halloween",
    gradient: ["#ffee4a", "#ffc501", "#fe9600", "#631c03"],
  },
  {
    id: "mono",
    name: "Mono",
    colorblindSafe: true,
    gradient: ["#c4c4c4", "#8e8e8e", "#5a5a5a", "#2b2b2b"],
  },
  {
    id: "viridis",
    name: "Viridis",
    colorblindSafe: true,
    gradient: ["#fde725", "#35b779", "#31688e", "#440154"],
  },
  {
    id: "cividis",
    name: "Cividis",
    colorblindSafe: true,
    gradient: ["#ffea46", "#a69d75", "#575c6d", "#00204d"],
  },
];

export const DEFAULT_PRESET = "slop-green";

/** `SlopTheme.Appearance.color(at:)`: position `t` along the gradient, OKLab between stops. */
const colorAt = (gradient, t) => {
  const scaled = clamp01(t) * (gradient.length - 1);
  const index = Math.min(Math.floor(scaled), gradient.length - 2);
  return mix(gradient[index], gradient[index + 1], scaled - index);
};

/** `fill(level:)`: levels 1-4 sampled evenly from the gradient. */
export const levelColors = (preset) => {
  const gradient = preset.gradient.map(hexToRgb);
  return [0, 1, 2, 3].map((i) => rgbToHex(colorAt(gradient, i / 3)));
};

/**
 * The six page variables for a preset:
 * --l1..--l4 the app's level fills; --l0 a light neutral leaning toward --l1's hue;
 * --slop the app's accent default (gradient color with the most contrast on the background)
 * made readable for paper text at 4.5:1; --goo the most vivid gradient color brightened to
 * 3:1 on both --slop and ink.
 */
export const deriveTheme = (preset) => {
  const paper = hexToRgb(PAPER);
  const ink = hexToRgb(INK);
  const levels = levelColors(preset);
  const gradient = preset.gradient.map(hexToRgb);

  // Empty day: a light neutral with a whisper of --l1's hue (#dfe8cf-like for green). When
  // --l1 is itself very light (the yellow starts of Halloween, Viridis, Cividis) the tint
  // drops so the empty tile stays gray and level 1 still reads by its color.
  const [L1, a1, b1] = toOklab(hexToRgb(levels[0]));
  const c1 = Math.hypot(a1, b1);
  const lightLevel = Math.min(Math.max((0.95 - L1) / 0.12, 0.25), 1);
  const tint = c1 > 1e-4 ? (Math.min(0.034, c1 * 0.6) * lightLevel) / c1 : 0;
  const l0 = fromOklab([0.918, a1 * tint, b1 * tint]);

  const strongest = gradient.reduce((best, c) =>
    contrastRgb(c, paper) > contrastRgb(best, paper) ? c : best,
  );
  const accent = preset.accent ? hexToRgb(preset.accent) : strongest;
  // A hair above 4.5 so rounding to hex never drops below it.
  const slop = readable(accent, paper, 4.6);

  // Brighten every gradient color and keep the one that stays most colorful; for a gray
  // gradient (Mono) keep the lightest.
  const candidates = gradient.map((c) => brightened(c, [slop, ink], 3.1));
  const gray = candidates.every((c) => chroma(c) < 0.03);
  const score = (c) => (gray ? toOklab(c)[0] : chroma(c));
  const goo = preset.goo
    ? hexToRgb(preset.goo)
    : candidates.reduce((best, c) => (score(c) > score(best) ? c : best));

  return {
    "--l0": rgbToHex(l0),
    "--l1": levels[0],
    "--l2": levels[1],
    "--l3": levels[2],
    "--l4": levels[3],
    "--slop": rgbToHex(slop),
    "--goo": rgbToHex(goo),
  };
};

// --- DOM ------------------------------------------------------------------------------

const presetById = (id) => PRESETS.find((p) => p.id === id);

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const store = (id) => {
  try {
    if (id === DEFAULT_PRESET) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Private mode or storage disabled: the choice lasts for this visit only.
  }
};

const applyTheme = (root, preset) => {
  for (const [name, value] of Object.entries(deriveTheme(preset))) {
    root.style.setProperty(name, value);
  }
  root.dataset.slopTheme = preset.id;
};

const buildPicker = (container, current, onPick) => {
  const label = document.createElement("p");
  label.className = "theme-picker-label";
  label.id = "theme-picker-label";
  label.textContent = "Pick a flavor";

  const group = document.createElement("div");
  group.className = "theme-picker-group";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-labelledby", label.id);

  const buttons = PRESETS.map((preset) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-swatch";
    button.dataset.preset = preset.id;
    button.setAttribute("role", "radio");
    const safe = preset.colorblindSafe ? ", colorblind-safe" : "";
    button.setAttribute("aria-label", `${preset.name}${safe}`);
    button.title = preset.colorblindSafe
      ? `${preset.name}: colorblind-safe`
      : preset.smooth
        ? `${preset.name}: smooth gradient in the app`
        : preset.name;

    const strip = document.createElement("span");
    strip.className = "theme-swatch-strip";
    strip.setAttribute("aria-hidden", "true");
    levelColors(preset).forEach((color, i) => {
      const tile = document.createElement("span");
      tile.style.setProperty("--swatch", color);
      tile.style.setProperty("--i", String(i));
      strip.append(tile);
    });

    const name = document.createElement("span");
    name.className = "theme-swatch-name";
    name.setAttribute("aria-hidden", "true");
    name.textContent = preset.name;

    button.append(strip, name);
    if (preset.colorblindSafe) {
      const badge = document.createElement("span");
      badge.className = "theme-swatch-badge";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = "CB";
      button.append(badge);
    }
    return button;
  });

  const select = (id, focus) => {
    buttons.forEach((button) => {
      const on = button.dataset.preset === id;
      button.setAttribute("aria-checked", String(on));
      button.tabIndex = on ? 0 : -1;
      if (on && focus) button.focus();
    });
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      select(button.dataset.preset, false);
      onPick(button.dataset.preset);
    });
    button.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
        event.key
      ];
      let next = null;
      if (step) next = (index + step + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      if (next === null) return;
      event.preventDefault();
      const id = buttons[next].dataset.preset;
      select(id, true);
      onPick(id);
    });
  });

  group.append(...buttons);

  const caption = document.createElement("p");
  caption.className = "theme-picker-caption";
  caption.textContent = "Same themes as the app.";

  container.replaceChildren(label, group, caption);
  select(current, false);
};

if (typeof document !== "undefined") {
  const root = document.documentElement;
  let current = presetById(readStored()) ?? presetById(DEFAULT_PRESET);
  // Apply before enabling the transition so a saved preset does not animate in on load.
  if (current.id !== DEFAULT_PRESET) applyTheme(root, current);

  const pick = (id) => {
    const preset = presetById(id);
    if (!preset || preset.id === current.id) return;
    current = preset;
    root.classList.add("theme-animating");
    applyTheme(root, preset);
    store(preset.id);
    document.dispatchEvent(
      new CustomEvent("slopometer:themechange", { detail: { id } }),
    );
  };

  const container = document.querySelector("[data-theme-picker]");
  if (container) buildPicker(container, current.id, pick);
}
