import { prisma } from "@/lib/db";
import { parseTags } from "@/lib/entries";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Entry, Photo } from "@prisma/client";

export type EntryWithPhotos = Entry & { photos: Photo[] };

export async function getPublicEntries(): Promise<EntryWithPhotos[]> {
  const admin = await isAdminAuthenticated();
  return prisma.entry.findMany({
    where: admin ? undefined : { isPrivate: false },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { takenAt: "desc" },
  });
}

export async function getEntryBySlug(slug: string) {
  return prisma.entry.findUnique({
    where: { slug },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const entries = await getPublicEntries();
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of parseTags(entry.tags)) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function groupByYearMonth(entries: EntryWithPhotos[]) {
  const groups: {
    year: number;
    month: number;
    label: string;
    entries: EntryWithPhotos[];
  }[] = [];

  for (const entry of entries) {
    const d = new Date(entry.takenAt);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const existing = groups.find((g) => g.year === year && g.month === month);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.push({ year, month, label, entries: [entry] });
    }
  }

  return groups;
}

export async function getOnThisDay(reference = new Date()) {
  const month = reference.getMonth() + 1;
  const day = reference.getDate();
  const entries = await getPublicEntries();
  return entries.filter((e) => {
    const d = new Date(e.takenAt);
    return d.getMonth() + 1 === month && d.getDate() === day;
  });
}

export async function getStats() {
  const entries = await getPublicEntries();
  const photoCount = entries.reduce((n, e) => n + e.photos.length, 0);
  const tags = await getAllTags();
  const mostUsedTag = tags[0] ?? null;

  const months = new Set(
    entries.map((e) => {
      const d = new Date(e.takenAt);
      return `${d.getFullYear()}-${d.getMonth() + 1}`;
    }),
  );

  // Consecutive months streak ending at latest entry month
  let streak = 0;
  if (entries.length > 0) {
    const latest = new Date(entries[0].takenAt);
    let cursor = new Date(latest.getFullYear(), latest.getMonth(), 1);
    while (true) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`;
      if (!months.has(key)) break;
      streak += 1;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    }
  }

  const locations = entries
    .map((e) => e.location)
    .filter((l): l is string => Boolean(l));
  const uniqueLocations = new Set(locations).size;

  return {
    entryCount: entries.length,
    photoCount,
    mostUsedTag,
    tagCount: tags.length,
    monthCount: months.size,
    streak,
    uniqueLocations,
    tags,
  };
}

export async function searchEntries(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const entries = await getPublicEntries();
  return entries.filter((e) => {
    const hay = [
      e.title,
      e.caption,
      e.location ?? "",
      e.mood ?? "",
      e.song ?? "",
      e.camera ?? "",
      e.lens ?? "",
      e.film ?? "",
      ...parseTags(e.tags),
      new Date(e.takenAt).toISOString(),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
