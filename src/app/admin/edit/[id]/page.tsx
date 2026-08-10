import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EntryForm } from "@/components/admin/EntryForm";
import { isAdminAuthenticated } from "@/lib/auth";
import { parseTags } from "@/lib/entries";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!entry) notFound();

  return (
    <div className="site-shell max-w-3xl py-14">
      <Link href="/admin" className="text-sm text-muted hover:text-accent">
        ← Back
      </Link>
      <h1 className="display mt-4 text-4xl text-ink">Edit entry</h1>
      <div className="mt-8">
        <EntryForm
          initial={{
            id: entry.id,
            title: entry.title,
            caption: entry.caption,
            takenAt: new Date(entry.takenAt).toISOString().slice(0, 10),
            location: entry.location || "",
            locationUrl: entry.locationUrl || "",
            mood: entry.mood || "",
            song: entry.song || "",
            tags: parseTags(entry.tags).join(", "),
            isPrivate: entry.isPrivate,
            password: "",
            camera: entry.camera || "",
            lens: entry.lens || "",
            film: entry.film || "",
            existingPhotos: entry.photos.map((p) => ({
              id: p.id,
              url: p.url,
              filename: p.filename,
            })),
          }}
        />
      </div>
    </div>
  );
}
