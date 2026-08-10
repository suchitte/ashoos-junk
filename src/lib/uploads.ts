import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

function uploadRoot() {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads");
}

export async function saveUploadedImage(file: File) {
  const dir = uploadRoot();
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  const base = randomUUID();
  const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  const filename = `${base}${ext}`;
  const filepath = path.join(/*turbopackIgnore: true*/ dir, filename);

  // Keep full-resolution original on disk
  await writeFile(filepath, bytes);

  let width: number | undefined;
  let height: number | undefined;
  try {
    const meta = await sharp(bytes).metadata();
    width = meta.width;
    height = meta.height;
  } catch {
    // Non-image or unsupported — still store the file
  }

  return {
    url: `/media/${filename}`,
    filename: originalName,
    width: width ?? null,
    height: height ?? null,
  };
}

export function resolveUploadPath(filename: string) {
  const safe = path.basename(filename);
  return path.join(/*turbopackIgnore: true*/ uploadRoot(), safe);
}
