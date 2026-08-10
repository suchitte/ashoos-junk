import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { unlink } from "fs/promises";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeTags, slugify } from "@/lib/entries";
import { saveUploadedImage } from "@/lib/uploads";

async function uniqueSlug(base: string, excludeId: string) {
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.entry.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const form = await request.formData();
  const title = readField(form, "title");
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const takenAt = new Date(readField(form, "takenAt") || existing.takenAt.toISOString());
  const isPrivate = readField(form, "isPrivate") === "true";
  const password = readField(form, "password");
  const tags = serializeTags(
    readField(form, "tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  );

  let passwordHash = existing.passwordHash;
  if (!isPrivate) {
    passwordHash = null;
  } else if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  } else if (!passwordHash) {
    return NextResponse.json({ error: "Private entries need a password" }, { status: 400 });
  }

  const photos = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const startOrder = existing.photos.length;
  const saved = [];
  for (let i = 0; i < photos.length; i++) {
    const uploaded = await saveUploadedImage(photos[i]);
    saved.push({ ...uploaded, sortOrder: startOrder + i, alt: title });
  }

  const slug =
    title !== existing.title ? await uniqueSlug(title, id) : existing.slug;

  const entry = await prisma.entry.update({
    where: { id },
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
      photos:
        saved.length > 0
          ? {
              create: saved.map((p) => ({
                url: p.url,
                filename: p.filename,
                width: p.width,
                height: p.height,
                alt: p.alt,
                sortOrder: p.sortOrder,
              })),
            }
          : undefined,
    },
  });

  return NextResponse.json({ id: entry.id, slug: entry.slug });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  for (const photo of entry.photos) {
    if (photo.url.startsWith("/media/")) {
      const name = photo.url.replace("/media/", "");
      const { resolveUploadPath } = await import("@/lib/uploads");
      const filepath = resolveUploadPath(name);
      try {
        await unlink(filepath);
      } catch {
        // ignore missing files
      }
    }
  }

  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
