import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeTags, slugify } from "@/lib/entries";
import { saveUploadedImage } from "@/lib/uploads";

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base);
  let i = 1;
  while (true) {
    const existing = await prisma.entry.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${slugify(base)}-${i++}`;
  }
}

function readField(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const title = readField(form, "title");
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const takenAtRaw = readField(form, "takenAt") || new Date().toISOString();
  const takenAt = new Date(takenAtRaw);
  const isPrivate = readField(form, "isPrivate") === "true";
  const password = readField(form, "password");
  const tags = serializeTags(
    readField(form, "tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  );

  let passwordHash: string | null = null;
  if (isPrivate) {
    if (!password) {
      return NextResponse.json({ error: "Private entries need a password" }, { status: 400 });
    }
    passwordHash = await bcrypt.hash(password, 10);
  }

  const photos = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const saved = [];
  for (let i = 0; i < photos.length; i++) {
    const uploaded = await saveUploadedImage(photos[i]);
    saved.push({ ...uploaded, sortOrder: i, alt: title });
  }

  const slug = await uniqueSlug(title);
  const entry = await prisma.entry.create({
    data: {
      slug,
      title,
      caption: readField(form, "caption"),
      takenAt,
      location: readField(form, "location") || null,
      locationUrl: readField(form, "locationUrl") || null,
      mood: readField(form, "mood") || null,
      song: readField(form, "song") || null,
      tags,
      isPrivate,
      passwordHash,
      camera: readField(form, "camera") || null,
      lens: readField(form, "lens") || null,
      film: readField(form, "film") || null,
      photos: {
        create: saved.map((p) => ({
          url: p.url,
          filename: p.filename,
          width: p.width,
          height: p.height,
          alt: p.alt,
          sortOrder: p.sortOrder,
        })),
      },
    },
  });

  return NextResponse.json({ id: entry.id, slug: entry.slug });
}
