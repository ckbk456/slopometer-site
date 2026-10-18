import "./theme.js";
import "./style.css";

// Pointer effects only run with a fine pointer and without a reduced-motion preference.
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const fancy = !calm && finePointer;
const random = (min, max) => Math.random() * (max - min) + min;

// Cursor blob trails the pointer.
const blob = document.querySelector(".blob");
if (fancy) {
  document.documentElement.classList.add("has-pointer");
  window.addEventListener("pointermove", ({ clientX, clientY }) => {
    blob.animate(
      { transform: `translate(${clientX}px, ${clientY}px)` },
      { duration: 3000, fill: "forwards" },
    );
  });
}

// Sparkle tagline: wrap the text in a gradient and pop stars around it.
const sparkle = document.querySelector(".sparkle-text");
if (sparkle) {
  const text = sparkle.textContent;
  sparkle.textContent = "";
  const gradient = document.createElement("span");
  gradient.className = "grad";
  gradient.textContent = text;
  sparkle.append(gradient);
  if (!calm) {
    const starPath =
      "M256 0c10 108 40 146 148 156-108 10-138 48-148 156-10-108-40-146-148-156C216 146 246 108 256 0z";
    const popStar = () => {
      const star = document.createElement("span");
      star.className = "star";
      star.setAttribute("aria-hidden", "true");
      star.innerHTML = `<svg viewBox="96 0 320 312"><path d="${starPath}"/></svg>`;
      star.style.setProperty("left", `${random(-6, 106)}%`);
      star.style.setProperty("top", `${random(-40, 120)}%`);
      sparkle.append(star);
      setTimeout(() => star.remove(), 1000);
    };
    setInterval(popStar, 420);
  }
}

// Magnetic download button: it leans toward the pointer from anywhere on the page,
// pulling harder the closer the pointer gets. Splat on click.
const download = document.querySelector(".download");
if (download && fancy) {
  let frame = 0;
  window.addEventListener("pointermove", ({ clientX, clientY }) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = download.getBoundingClientRect();
      const dx = clientX - (box.left + box.width / 2);
      const dy = clientY - (box.top + box.height / 2);
      const pull = 0.16 / (1 + Math.hypot(dx, dy) / 260);
      const clamp = (value, limit) => Math.min(Math.max(value, -limit), limit);
      download.style.setProperty("--mx", `${clamp(dx * pull, 16)}px`);
      download.style.setProperty("--my", `${clamp(dy * pull, 10)}px`);
    });
  });
}
download?.addEventListener("click", (event) => {
  if (calm) return;
  // Theme variables, so the splat follows the selected color preset.
  const colors = ["var(--slop)", "var(--goo)", "var(--gum)", "var(--ink)"];
  for (let i = 0; i < 18; i += 1) {
    const drop = document.createElement("span");
    drop.className = "splat";
    const angle = random(0, Math.PI * 2);
    const distance = random(60, 190);
    drop.style.setProperty("left", `${event.clientX}px`);
    drop.style.setProperty("top", `${event.clientY}px`);
    drop.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    drop.style.setProperty("--dy", `${Math.sin(angle) * distance + 40}px`);
    drop.style.setProperty("--size", `${random(10, 30)}px`);
    drop.style.setProperty("--c", colors[i % colors.length]);
    document.body.append(drop);
    setTimeout(() => drop.remove(), 900);
  }
});

// Gauge: a 0-69 speedometer reading 42. Each tap adds slop. Past 69 the needle pins
// and the glass over-revs: it shakes harder, heats up and puffs steam with every tap,
// and each tap adds more. At 420 it bursts and the count runs away with random digits
// until it is wider than the screen. CSS reads --v, --angle and --heat.
const glass = document.querySelector(".gauge-glass");
const caption = document.querySelector(".gauge figcaption");
const countText = document.querySelector("[data-count]");
const countLabel = document.querySelector("[data-count-label]");
const warpMap = document.querySelector("#warp-map");
// The warp noise animates via SMIL; keep it paused unless the gauge is revving.
const warpSvg = warpMap?.ownerSVGElement;
warpSvg?.pauseAnimations();
if (glass && caption && countText && countLabel) {
  const max = 69;
  const blowAt = 420;
  let count = 42;
  const label = (value) => {
    if (value < max) return "contributions today";
    if (value === 67) return "contributions today. Six seven.";
    if (value === max) return "contributions today. Nice.";
    if (value < 160) return "contributions today. Uh oh.";
    if (value < 300) return "Slop pressure critical.";
    return "IT'S GONNA BLOW";
  };
  const show = (value) => {
    const heat = Math.min(Math.max((value - max) / (blowAt - max), 0), 1);
    glass.style.setProperty("--v", Math.min(value, max));
    glass.style.setProperty("--heat", heat);
    glass.style.setProperty(
      "--angle",
      `${value > max ? 90 + heat * 10 : -90 + (180 * value) / max}deg`,
    );
    caption.style.setProperty("--heat", heat);
    // The glass bulges and ripples under pressure; the filter only applies while
    // revving, so the resting gauge stays crisp.
    warpMap?.setAttribute("scale", String(Math.round(heat * 38)));
    glass.classList.toggle("overrev", value > max);
    if (value > max) warpSvg?.unpauseAnimations();
    countText.textContent = value;
    countLabel.textContent = label(value);
  };
  // Particles thrown out of the glass: steam puffs while revving, shards on burst.
  const spray = (amount, kind, spread) => {
    if (calm) return;
    const box = glass.getBoundingClientRect();
    for (let i = 0; i < amount; i += 1) {
      const bit = document.createElement("span");
      bit.className = kind;
      const angle = random(Math.PI * 1.05, Math.PI * 1.95);
      const distance = random(spread * 0.4, spread);
      bit.style.setProperty(
        "left",
        `${random(box.left + 40, box.right - 40)}px`,
      );
      bit.style.setProperty(
        "top",
        `${box.top + random(10, box.height * 0.5)}px`,
      );
      bit.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      bit.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      bit.style.setProperty("--size", `${random(14, 40)}px`);
      bit.style.setProperty("--spin", `${random(-540, 540)}deg`);
      document.body.append(bit);
      setTimeout(() => bit.remove(), 1400);
    }
  };
  const burst = () => {
    glass.disabled = true;
    glass.classList.remove("overrev");
    glass.classList.add("burst");
    warpMap?.setAttribute("scale", "0");
    warpSvg?.pauseAnimations();
    caption.classList.add("runaway");
    caption.removeAttribute("aria-live");
    caption.setAttribute("aria-label", "Way too many contributions");
    spray(36, "shard", 420);
    spray(14, "puff", 260);
    countLabel.textContent = "contributions today";
    // Not a real count: each digit is its own span, scattered off the number's
    // line and rerolled. The leading digits stay big and tame; craziness ramps up
    // toward the tail. Kept cheap: ~7 fps on requestAnimationFrame, a fixed digit
    // budget instead of measuring layout, one transform write per touched digit,
    // and only some digits touched per frame.
    countText.textContent = "";
    const digits = [];
    const addDigit = () => {
      const digit = document.createElement("span");
      digit.textContent = Math.floor(Math.random() * 10);
      countText.append(digit);
      digits.push(digit);
    };
    for (const _ of String(blowAt)) addDigit();
    // Each digit is about 0.6em wide at 44px scaled 1.6x: aim for ~2 screens, and
    // only animate the digits that can actually be on screen.
    const budget = Math.ceil((window.innerWidth * 2) / 42);
    const onScreen = Math.ceil(window.innerWidth / 42);
    const wildness = (index) =>
      Math.min(1, Math.max(0, (index - 4) / 36)) ** 1.4;
    const jitter = (digit, index) => {
      const wild = wildness(index);
      // The first two digits are a real counter (set in tick); the rest reroll.
      if (index > 1 && Math.random() < 0.08 + wild * 0.5) {
        digit.textContent = Math.floor(Math.random() * 10);
      }
      const x = random(-1, 1) * (1 + wild * 9);
      const y = random(-1, 1) * (1.5 + wild * 30);
      const r = random(-1, 1) * (2 + wild * 50);
      const s = 1.15 - wild * 0.3 + random(-0.35, 0.35) * wild;
      digit.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${s.toFixed(2)})`;
    };
    let last = 0;
    let head = 42;
    const tick = (now) => {
      requestAnimationFrame(tick);
      if (now - last < 150) return;
      last = now;
      // The leading pair counts up steadily: 42, 43, ... 99, then 10 again as the
      // number grows another digit.
      head = head >= 99 ? 10 : head + 1;
      digits[0].textContent = Math.floor(head / 10);
      digits[1].textContent = head % 10;
      if (digits.length < budget) {
        const extra = Math.min(
          budget - digits.length,
          Math.ceil(digits.length / 6),
        );
        for (let i = 0; i < extra; i += 1) {
          addDigit();
          // Scatter new digits once, so the frozen tail still looks wrecked.
          jitter(digits.at(-1), digits.length - 1);
        }
      }
      // Always the tame head, plus a random share of the rest.
      for (let i = 0; i < Math.min(6, digits.length); i += 1)
        jitter(digits[i], i);
      // Only the first ~30 digits get rerolled and jiggled; the tail just sits.
      const visible = Math.min(digits.length, onScreen, 30);
      for (let n = 0; n < 24; n += 1) {
        const i = 6 + Math.floor(Math.random() * Math.max(1, visible - 6));
        if (digits[i]) jitter(digits[i], i);
      }
    };
    requestAnimationFrame(tick);
  };
  // Swing in from zero on load.
  show(0);
  setTimeout(() => show(count), 300);
  glass.addEventListener("click", () => {
    if (count >= max) {
      const heat = (count - max) / (blowAt - max);
      count += Math.round(random(8, 18) * (1 + heat));
      spray(4 + Math.round(heat * 10), "puff", 120 + heat * 160);
    } else {
      // 1-3 per tap, but always stop on 67 and 69.
      const next = count + Math.round(random(1, 3));
      count = count < 67 ? Math.min(next, 67) : Math.min(next, max);
    }
    glass.classList.remove("tapped");
    void glass.offsetWidth;
    glass.classList.add("tapped");
    if (count >= blowAt) {
      count = blowAt;
      show(count);
      burst();
      return;
    }
    show(count);
  });
  glass.addEventListener("animationend", (event) => {
    if (event.animationName === "glass-bump") glass.classList.remove("tapped");
  });
}

// Slop-o-meter: at the very bottom of the page the tube bursts and sprays slop
// sideways like a broken pipe, with a puddle collecting underneath.
const tube = document.querySelector(".slop-tube");
const tubeGlass = document.querySelector(".tube-glass");
if (tube && tubeGlass && !calm) {
  const puddle = document.createElement("div");
  puddle.className = "slop-puddle";
  puddle.setAttribute("aria-hidden", "true");
  document.body.append(puddle);
  let spewing = null;
  const gush = () => {
    const box = tubeGlass.getBoundingClientRect();
    for (let i = 0; i < 3; i += 1) {
      const drop = document.createElement("span");
      drop.className = "spew";
      const vx = -random(2, 11);
      let vy = -random(3, 11);
      const frames = [];
      let x = 0;
      let y = 0;
      for (let step = 0; step <= 24; step += 1) {
        frames.push({ transform: `translate(${x}px, ${y}px)` });
        x += vx * 2.2;
        y += vy * 2.2;
        vy += 1.3;
      }
      frames.at(-1).opacity = 0.6;
      drop.style.setProperty("left", `${box.left + box.width / 2}px`);
      drop.style.setProperty("top", `${box.top + 4}px`);
      drop.style.setProperty("--size", `${random(8, 22)}px`);
      document.body.append(drop);
      drop
        .animate(frames, { duration: random(900, 1400), easing: "linear" })
        .finished.then(() => drop.remove());
    }
  };
  const check = () => {
    const atBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 40;
    const visible = getComputedStyle(tube).display !== "none";
    if (atBottom && visible && !spewing) {
      tube.classList.add("bursting");
      puddle.classList.add("filling");
      spewing = setInterval(gush, 60);
    } else if ((!atBottom || !visible) && spewing) {
      clearInterval(spewing);
      spewing = null;
      tube.classList.remove("bursting");
      puddle.classList.remove("filling");
    }
  };
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
}

// 3D tilt and moving shine on the widget. It follows the pointer anywhere on the
// page: the tilt leans toward wherever the pointer is relative to the widget.
const widget = document.querySelector(".widget");
if (widget && fancy) {
  let frame = 0;
  window.addEventListener("pointermove", ({ clientX, clientY }) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = widget.getBoundingClientRect();
      const clamp = (value) => Math.min(Math.max(value, -1), 1);
      const x = clamp(
        (clientX - (box.left + box.width / 2)) / (window.innerWidth / 2),
      );
      const y = clamp(
        (clientY - (box.top + box.height / 2)) / (window.innerHeight / 2),
      );
      widget.style.setProperty("--ry", `${x * 18}deg`);
      widget.style.setProperty("--rx", `${-y * 18}deg`);
      widget.style.setProperty("--sx", `${50 + x * 50}%`);
      widget.style.setProperty("--sy", `${50 + y * 50}%`);
    });
  });
}

// Ripple: clicking a day sends a wave across the grid, timed by distance.
const tiles = [...document.querySelectorAll(".tile")];
tiles.forEach((origin) => {
  origin.addEventListener("click", () => {
    if (calm) return;
    const col = Number(origin.dataset.col);
    const row = Number(origin.dataset.row);
    tiles.forEach((tile) => {
      const distance = Math.hypot(
        Number(tile.dataset.col) - col,
        Number(tile.dataset.row) - row,
      );
      tile.classList.remove("ripple");
      void tile.offsetWidth;
      tile.style.setProperty("--delay", `${distance * 55}ms`);
      tile.classList.add("ripple");
    });
  });
});

// Image track (after camillemormal.com, via Hyperplexed): pressing anywhere on the
// section drops an invisible slider under the pointer. Dragging half the window width
// moves the track from one end to the other; the next drag continues from where the
// last one stopped. Each chart pans inside its frame against the motion (parallax), and
// every update is a 1.2s animate() so the track glides to its target instead of snapping.
const track = document.querySelector(".track");
const views = track?.closest(".views");
if (track && views) {
  let downAt = null;
  // Start centered, so charts sit on both sides and either drag direction works.
  let percent = -50;
  let lastPercent = -50;
  const clamp = (value) => Math.min(Math.max(value, -100), 0);
  const render = (duration = calm ? 0 : 1200) => {
    const travel = Math.max(0, track.scrollWidth - views.clientWidth);
    const timing = { duration, fill: "forwards", easing: "ease-out" };
    track.animate(
      { transform: `translateX(${(percent / 100) * travel}px)` },
      timing,
    );
    for (const art of track.querySelectorAll(".panel-art svg")) {
      // From showing the art's right edge (start) to its left edge (end).
      // Narrower art (the labeled charts) drifts the same way, inside the padding.
      const spare =
        Math.abs(art.clientWidth - art.parentElement.clientWidth) / 2;
      const shift = spare * (-1 - (2 * percent) / 100);
      art.animate({ transform: `translateX(${shift}px)` }, timing);
    }
  };
  views.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    downAt = event.clientX;
    views.classList.add("dragging");
  });
  window.addEventListener("pointermove", (event) => {
    if (downAt === null) return;
    const delta = downAt - event.clientX;
    percent = clamp(lastPercent - (delta / (window.innerWidth / 2)) * 100);
    render();
  });
  const release = () => {
    if (downAt === null) return;
    downAt = null;
    lastPercent = percent;
    views.classList.remove("dragging");
  };
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  // Trackpad sideways swipes and arrow keys move the same slider.
  views.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      percent = lastPercent = clamp(
        percent - (event.deltaX / window.innerWidth) * 100,
      );
      render();
    },
    { passive: false },
  );
  track.addEventListener("keydown", (event) => {
    const step = { ArrowLeft: 15, ArrowRight: -15, Home: 100, End: -100 }[
      event.key
    ];
    if (step === undefined) return;
    event.preventDefault();
    percent = lastPercent = clamp(percent + step);
    render();
  });
  window.addEventListener("resize", () => render(0));
  render(0);
}

// Jelly letters: each letter boings when the pointer passes over it. Words stay
// unbroken; the element keeps its text as an aria-label and the spans are hidden.
// Panel titles come from the generator, so they are matched by class as well.
for (const jelly of document.querySelectorAll("[data-jelly], .panel h3")) {
  const text = jelly.textContent.trim();
  jelly.setAttribute("aria-label", text);
  jelly.classList.add("jelly");
  jelly.textContent = "";
  text.split(/\s+/).forEach((word, index) => {
    if (index > 0) jelly.append(" ");
    const wordSpan = document.createElement("span");
    wordSpan.setAttribute("aria-hidden", "true");
    wordSpan.className = "word";
    for (const letter of word) {
      const span = document.createElement("span");
      span.className = "ch";
      span.textContent = letter;
      span.addEventListener("pointerenter", () => {
        if (calm) return;
        span.classList.add("boing");
      });
      span.addEventListener("animationend", () =>
        span.classList.remove("boing"),
      );
      wordSpan.append(span);
    }
    jelly.append(wordSpan);
  });
}
