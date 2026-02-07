import { packAsync } from "free-tex-packer-core";
import { readdir, readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { join, basename, extname, relative } from "node:path";
import { existsSync } from "node:fs";

const ROOT = join(import.meta.dirname, "..", "..");
const ASSETS_DIR = join(ROOT, "..", "Assets");
const OUTPUT_SPRITESHEETS = join(ROOT, "packages", "client", "public", "assets", "spritesheets");
const OUTPUT_MAPS = join(ROOT, "packages", "client", "public", "assets", "maps");
const OUTPUT_SOUNDS = join(ROOT, "packages", "client", "public", "assets", "sounds");

const PLAYER_COLORS = [
  "Red", "Blue", "Green", "Orange", "Yellow",
  "Black", "Brown", "Pink", "Purple", "White",
] as const;

const DIRECTIONS = ["left_walk", "right_walk", "up_walk", "down_walk"] as const;

interface ImageInput {
  path: string;
  contents: Buffer;
}

async function readImagesFromDir(dir: string, prefix: string): Promise<ImageInput[]> {
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  const pngFiles = files
    .filter((f) => /\.(png|PNG|jpg|JPG|jpeg)$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.match(/(\d+)/)?.[1] ?? "0", 10);
      return numA - numB;
    });

  const images: ImageInput[] = [];
  for (const file of pngFiles) {
    const contents = await readFile(join(dir, file));
    const name = basename(file, extname(file));
    images.push({ path: `${prefix}/${name}.png`, contents: Buffer.from(contents) });
  }
  return images;
}

async function readImagesRecursive(dir: string, prefix: string): Promise<ImageInput[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const images: ImageInput[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subImages = await readImagesRecursive(fullPath, `${prefix}/${entry.name}`);
      images.push(...subImages);
    } else if (/\.(png|PNG|jpg|JPG|jpeg)$/i.test(entry.name)) {
      const contents = await readFile(fullPath);
      const name = basename(entry.name, extname(entry.name));
      images.push({ path: `${prefix}/${name}.png`, contents: Buffer.from(contents) });
    }
  }
  return images;
}

async function packSpritesheet(
  images: ImageInput[],
  textureName: string,
  outputDir: string,
): Promise<void> {
  if (images.length === 0) {
    console.log(`  Skipping ${textureName}: no images found`);
    return;
  }

  const result = await packAsync(images, {
    textureName,
    width: 2048,
    height: 2048,
    fixedSize: false,
    allowRotation: false,
    padding: 2,
    exporter: "Pixi",
    allowTrim: true,
    detectIdentical: true,
  });

  await mkdir(outputDir, { recursive: true });

  for (const item of result) {
    const outPath = join(outputDir, item.name);
    await writeFile(outPath, item.buffer);
    console.log(`  Written: ${relative(ROOT, outPath)} (${item.buffer.length} bytes)`);
  }
}

async function packPlayerSprites(): Promise<void> {
  console.log("Packing player spritesheets...");

  for (const color of PLAYER_COLORS) {
    const colorLower = color.toLowerCase();
    const playerDir = join(ASSETS_DIR, "Images", "Player", color);

    if (!existsSync(playerDir)) {
      console.log(`  Skipping ${color}: directory not found`);
      continue;
    }

    const images: ImageInput[] = [];

    // Walk sprites (left, right, up, down)
    for (const dir of DIRECTIONS) {
      const walkDir = join(playerDir, `${colorLower}_${dir}`);
      const walkImages = await readImagesFromDir(walkDir, `${colorLower}_${dir}`);
      images.push(...walkImages);
    }

    // Ghost sprites
    const ghostDir = join(playerDir, `${colorLower}_ghost`);
    const ghostImages = await readImagesFromDir(ghostDir, `${colorLower}_ghost`);
    images.push(...ghostImages);

    // Dead sprite
    const deadDir = join(ASSETS_DIR, "Images", "Player", "Dead");
    const deadVariants = [
      `Dead${colorLower}.png`,
      `Dead${color}.png`,
    ];
    for (const deadFile of deadVariants) {
      const deadPath = join(deadDir, deadFile);
      if (existsSync(deadPath)) {
        const contents = await readFile(deadPath);
        images.push({ path: `dead/${colorLower}.png`, contents: Buffer.from(contents) });
        break;
      }
    }

    console.log(`  ${color}: ${images.length} sprites`);
    await packSpritesheet(images, `player_${colorLower}`, OUTPUT_SPRITESHEETS);
  }

  // Also pack kill animation sprites from Player/Kills
  const killsDir = join(ASSETS_DIR, "Images", "Player", "Kills");
  const killImages = await readImagesFromDir(killsDir, "kills");
  if (killImages.length > 0) {
    console.log(`  Kills: ${killImages.length} sprites`);
    await packSpritesheet(killImages, "player_kills", OUTPUT_SPRITESHEETS);
  }
}

async function packTaskSprites(): Promise<void> {
  console.log("Packing task spritesheets...");
  const tasksDir = join(ASSETS_DIR, "Images", "Tasks");
  if (!existsSync(tasksDir)) return;

  const images = await readImagesRecursive(tasksDir, "tasks");
  console.log(`  Tasks: ${images.length} sprites`);
  await packSpritesheet(images, "tasks", OUTPUT_SPRITESHEETS);
}

async function packUISprites(): Promise<void> {
  console.log("Packing UI spritesheets...");
  const uiDir = join(ASSETS_DIR, "Images", "UI");
  if (!existsSync(uiDir)) return;

  const images = await readImagesFromDir(uiDir, "ui");
  console.log(`  UI: ${images.length} sprites`);
  await packSpritesheet(images, "ui", OUTPUT_SPRITESHEETS);
}

async function packAlertSprites(): Promise<void> {
  console.log("Packing alert spritesheets...");
  const alertsDir = join(ASSETS_DIR, "Images", "Alerts");
  if (!existsSync(alertsDir)) return;

  const images = await readImagesFromDir(alertsDir, "alerts");
  console.log(`  Alerts: ${images.length} sprites`);
  await packSpritesheet(images, "alerts", OUTPUT_SPRITESHEETS);
}

async function packMenuSprites(): Promise<void> {
  console.log("Packing menu spritesheets...");
  const menuDir = join(ASSETS_DIR, "Images", "menu");
  if (!existsSync(menuDir)) return;

  const images = await readImagesFromDir(menuDir, "menu");
  console.log(`  Menu: ${images.length} sprites`);
  await packSpritesheet(images, "menu", OUTPUT_SPRITESHEETS);
}

async function packMiscSprites(): Promise<void> {
  console.log("Packing miscellaneous spritesheets...");

  // Items
  const itemsDir = join(ASSETS_DIR, "Images", "Items");
  const itemImages = await readImagesFromDir(itemsDir, "items");
  if (itemImages.length > 0) {
    console.log(`  Items: ${itemImages.length} sprites`);
    await packSpritesheet(itemImages, "items", OUTPUT_SPRITESHEETS);
  }

  // Meeting
  const meetingDir = join(ASSETS_DIR, "Images", "Meeting");
  const meetingImages = await readImagesFromDir(meetingDir, "meeting");
  if (meetingImages.length > 0) {
    console.log(`  Meeting: ${meetingImages.length} sprites`);
    await packSpritesheet(meetingImages, "meeting", OUTPUT_SPRITESHEETS);
  }

  // Environment (light masks etc.)
  const envDir = join(ASSETS_DIR, "Images", "Environment");
  const envImages = await readImagesFromDir(envDir, "environment");
  if (envImages.length > 0) {
    console.log(`  Environment: ${envImages.length} sprites`);
    await packSpritesheet(envImages, "environment", OUTPUT_SPRITESHEETS);
  }

  // Help screens
  const helpDir = join(ASSETS_DIR, "Images", "help");
  const helpImages = await readImagesFromDir(helpDir, "help");
  if (helpImages.length > 0) {
    console.log(`  Help: ${helpImages.length} sprites`);
    await packSpritesheet(helpImages, "help", OUTPUT_SPRITESHEETS);
  }
}

async function copyMapFiles(): Promise<void> {
  console.log("Copying map files...");
  const mapsDir = join(ASSETS_DIR, "Maps");
  if (!existsSync(mapsDir)) return;

  await mkdir(OUTPUT_MAPS, { recursive: true });
  const files = await readdir(mapsDir);
  for (const file of files) {
    const src = join(mapsDir, file);
    const dest = join(OUTPUT_MAPS, file);
    await copyFile(src, dest);
    console.log(`  Copied: ${file}`);
  }
}

async function copySoundFiles(): Promise<void> {
  console.log("Copying sound files...");
  const soundsDir = join(ASSETS_DIR, "Sounds");
  if (!existsSync(soundsDir)) return;

  const entries = await readdir(soundsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    // Sanitize directory name (replace spaces with underscores)
    const sanitizedDirName = entry.name.replace(/\s+/g, "_");
    const subDir = join(OUTPUT_SOUNDS, sanitizedDirName);
    await mkdir(subDir, { recursive: true });

    const srcDir = join(soundsDir, entry.name);
    const files = await readdir(srcDir);
    for (const file of files) {
      if (!/\.(wav|mp3|ogg)$/i.test(file)) continue;
      // Sanitize file name too
      const sanitizedFileName = file.replace(/\s+/g, "_");
      await copyFile(join(srcDir, file), join(subDir, sanitizedFileName));
      console.log(`  Copied: ${sanitizedDirName}/${sanitizedFileName}`);
    }
  }
}

async function main(): Promise<void> {
  console.log("=== Among Us Web Spritesheet Packer ===");
  console.log(`Assets source: ${ASSETS_DIR}`);
  console.log(`Output root: ${join(ROOT, "packages", "client", "public", "assets")}`);
  console.log("");

  await mkdir(OUTPUT_SPRITESHEETS, { recursive: true });
  await mkdir(OUTPUT_MAPS, { recursive: true });
  await mkdir(OUTPUT_SOUNDS, { recursive: true });

  await packPlayerSprites();
  await packTaskSprites();
  await packUISprites();
  await packAlertSprites();
  await packMenuSprites();
  await packMiscSprites();
  await copyMapFiles();
  await copySoundFiles();

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Packing failed:", err);
  process.exit(1);
});
