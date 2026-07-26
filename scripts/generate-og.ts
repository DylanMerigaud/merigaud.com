// Standalone CLI: screenshots the /og poster route into public/og.jpg, so the
// social card is always the current headline rendered by the real hero engine
// (Mona Sans, ink shader, bloom) and never a stale export.
//
// Usage: pnpm dev, then `pnpm og:generate` (or `pnpm og:generate --url ...`).
//
// WebGL note: the shot runs in headed Chromium so the scene gets a real GPU.
// Headless falls back to SwiftShader, which renders the bloom pass noticeably
// duller than what a visitor sees.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

import { OG_HEIGHT, OG_SCALE, OG_SETTLE_MS, OG_WIDTH } from "@/lib/og";

const OUT_FILE = path.join(import.meta.dirname, "..", "public", "og.jpg");

const readUrl = (): string => {
  const flag = process.argv.indexOf("--url");
  if (flag !== -1) {
    const value = process.argv[flag + 1];
    if (value === undefined) throw new Error("--url needs a value");
    return value;
  }
  return "http://localhost:3000/og";
};

const main = async () => {
  const url = readUrl();
  const browser = await chromium.launch({ headless: false });
  try {
    const page = await browser.newPage({
      viewport: { width: OG_WIDTH, height: OG_HEIGHT },
      deviceScaleFactor: OG_SCALE,
      // The poster is a still; a scene that respected the runner's OS setting
      // would produce different pixels on different machines.
      reducedMotion: "no-preference",
    });

    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (response === null || !response.ok()) {
      throw new Error(`${url} did not load (${String(response?.status())})`);
    }

    // The dev server paints its build-status badge over the bottom-left corner
    // of the viewport, which is inside the crop.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    const poster = page.locator("[data-og-poster]");
    await poster.waitFor({ state: "visible", timeout: 15_000 });
    await page.waitForFunction(() => document.fonts.status === "loaded");
    // Let the graph ink itself in and the camera damp to rest.
    await page.waitForTimeout(OG_SETTLE_MS);

    await poster.screenshot({ path: OUT_FILE, type: "jpeg", quality: 90 });
  } finally {
    await browser.close();
  }

  const { size } = fs.statSync(OUT_FILE);
  console.log(
    `og.jpg written: ${String(OG_WIDTH * OG_SCALE)}x${String(OG_HEIGHT * OG_SCALE)}, ${String(Math.round(size / 1024))} kB`
  );
};

await main();
