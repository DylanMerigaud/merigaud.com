import { fal } from "@fal-ai/client";
// Standalone CLI: generates the hero loop (still via nano-banana-pro, motion via
// veo3.1 image-to-video), then downloads the raw clip to scripts/out/.
// ffmpeg post (loop + compress + poster) is a separate manual step, documented
// in scripts/hero-prompts.json next to the prompts that produced the final take.
//
// Usage: FAL_KEY=... pnpm hero:generate [--stills-only | --video-only <still-path>]
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const OUT_DIR = path.join(import.meta.dirname, "out");
const PROMPTS_FILE = path.join(import.meta.dirname, "hero-prompts.json");

const promptsSchema = z.object({
  stills: z.record(z.string(), z.string()),
  motion: z.string(),
  negative: z.string(),
});

const imageEntrySchema = z.object({ url: z.string() });

const imageResultSchema = z.object({
  images: z.array(imageEntrySchema).min(1),
});

const videoResultSchema = z.object({
  video: z.object({ url: z.string() }),
});

const readPrompts = () => {
  const raw: unknown = JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf8"));
  return promptsSchema.parse(raw);
};

const transient = /(5\d\d|timeout|ECONNRESET|fetch failed)/i;

const falRun = async <T>(
  modelId: string,
  input: Record<string, unknown>,
  schema: z.ZodType<T>
): Promise<T> => {
  try {
    const result = await fal.subscribe(modelId, { input, logs: false });
    return schema.parse(result.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!transient.test(message)) throw error;
    console.log(`retrying ${modelId} after transient error: ${message}`);
    const result = await fal.subscribe(modelId, { input, logs: false });
    return schema.parse(result.data);
  }
};

const downloadTo = async (url: string, destPath: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  return destPath;
};

const generateStill = async (name: string, prompt: string): Promise<string> => {
  console.log(`still [${name}] ...`);
  const data = await falRun(
    "fal-ai/nano-banana-pro",
    { prompt, aspect_ratio: "16:9", resolution: "2K", num_images: 1 },
    imageResultSchema
  );
  const url = data.images[0]?.url;
  if (url === undefined) throw new Error(`still [${name}]: no image in response`);
  const dest = await downloadTo(url, path.join(OUT_DIR, `still-${name}.png`));
  console.log(`still [${name}] -> ${dest}`);
  return dest;
};

const generateVideo = async (stillPath: string, take: string): Promise<string> => {
  const prompts = readPrompts();
  console.log(`video [${take}] from ${path.basename(stillPath)} ...`);
  const stillBuf = fs.readFileSync(stillPath);
  const imageUrl = await fal.storage.upload(new Blob([stillBuf], { type: "image/png" }));
  const input = {
    image_url: imageUrl,
    prompt: prompts.motion,
    duration: "8s",
    resolution: "1080p",
    aspect_ratio: "16:9",
    generate_audio: false,
    negative_prompt: prompts.negative,
  };
  let data: z.infer<typeof videoResultSchema>;
  try {
    data = await falRun("fal-ai/veo3.1/fast/image-to-video", input, videoResultSchema);
  } catch (error) {
    console.log(`1080p failed (${String(error)}), retrying at 720p`);
    data = await falRun(
      "fal-ai/veo3.1/fast/image-to-video",
      { ...input, resolution: "720p" },
      videoResultSchema
    );
  }
  const dest = await downloadTo(data.video.url, path.join(OUT_DIR, `hero-${take}.mp4`));
  console.log(`video [${take}] -> ${dest}`);
  return dest;
};

const main = async () => {
  const falKey = process.env.FAL_KEY;
  if (falKey === undefined || falKey === "") {
    console.error("FAL_KEY missing");
    process.exit(1);
  }
  fal.config({ credentials: falKey });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const [mode, arg] = process.argv.slice(2);

  if (mode === "--video-only") {
    if (arg === undefined) {
      console.error("--video-only needs a still path");
      process.exit(1);
    }
    await generateVideo(arg, `take-${Date.now()}`);
    return;
  }

  const prompts = readPrompts();
  const stills = await Promise.all(
    Object.entries(prompts.stills).map(([name, prompt]) => generateStill(name, prompt))
  );

  if (mode === "--stills-only") return;

  for (const still of stills) {
    const name = path.basename(still, ".png").replace("still-", "");
    await generateVideo(still, name);
  }
};

await main();
