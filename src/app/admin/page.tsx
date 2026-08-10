import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatFullDate, parseTags } from "@/lib/entries";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const entries = await prisma.entry.findMany({
    include: { photos: true },
    orderBy: { takenAt: "desc" },
  });

  return (
    <div className="site-shell py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Admin</p>
          <h1 className="display mt-3 text-4xl text-ink">Your archive desk</h1>
          <p className="mt-2 text-ink-soft">
            Add a dated entry, drop in photos, write a short note. That&apos;s the whole loop.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/new"
            className="rounded-full bg-accent px-5 py-2.5 text-sm text-paper hover:bg-accent-soft"
          >
            New entry
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-12 space-y-3">
        {entries.length === 0 && (
          <p className="rounded-sm border border-dashed border-[var(--line)] px-6 py-12 text-center text-ink-soft">
            No entries yet. Create the first one.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-3 border-b border-[var(--line)] py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">
                {formatFullDate(new Date(entry.takenAt))}
                {entry.isPrivate ? " · Private" : ""}
              </p>
              <h2 className="display text-2xl text-ink">{entry.title}</h2>
              <p className="text-sm text-muted">
                {entry.photos.length} photos
                {parseTags(entry.tags).length > 0
                  ? ` · ${parseTags(entry.tags)
                      .map((t) => `#${t}`)
                      .join(" ")}`
                  : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/entry/${entry.slug}`}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-ink-soft"
              >
                View
              </Link>
              <Link
                href={`/admin/edit/${entry.id}`}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-ink-soft"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
