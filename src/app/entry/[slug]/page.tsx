import Link from "next/link";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { PrintButton } from "@/components/PrintButton";
import { UnlockForm } from "@/components/UnlockForm";
import { canViewPrivateEntry } from "@/lib/auth";
import { formatFullDate, mapsUrl, parseTags } from "@/lib/entries";
import { getEntryBySlug, getPublicEntries } from "@/lib/queries";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  if (entry.isPrivate) {
    const allowed = await canViewPrivateEntry(entry.id);
    if (!allowed) {
      return (
        <div className="site-shell max-w-xl py-20">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Private entry</p>
          <h1 className="display mt-3 text-4xl text-ink">{entry.title}</h1>
          <p className="mt-3 text-ink-soft">
            This page is locked. Enter the entry password to view it.
          </p>
          <div className="mt-8">
            <UnlockForm entryId={entry.id} />
          </div>
        </div>
      );
    }
  }

  const tags = parseTags(entry.tags);
  const all = await getPublicEntries();
  const sameMonthPast = all.filter((e) => {
    if (e.id === entry.id) return false;
    const a = new Date(e.takenAt);
    const b = new Date(entry.takenAt);
    return a.getMonth() === b.getMonth() && a.getFullYear() < b.getFullYear();
  });

  return (
    <article className="site-shell py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {formatFullDate(new Date(entry.takenAt))}
        </p>
        <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">{entry.title}</h1>
        {entry.caption && (
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{entry.caption}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {entry.location && (
            <a
              href={mapsUrl(entry.location, entry.locationUrl)}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent-soft"
            >
              {entry.location} ↗
            </a>
          )}
          {entry.mood && <span>Mood · {entry.mood}</span>}
          {entry.song && <span>Song · {entry.song}</span>}
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-ink-soft hover:border-accent hover:text-accent"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <PhotoLightbox
          photos={entry.photos}
          metadata={{ camera: entry.camera, lens: entry.lens, film: entry.film }}
        />
      </div>

      <div className="no-print mt-10 flex flex-wrap gap-3">
        <PrintButton />
        <Link
          href="/"
          className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          Back to archive
        </Link>
      </div>

      {sameMonthPast.length > 0 && (
        <section className="mt-16 border-t border-[var(--line)] pt-10">
          <h2 className="display text-3xl text-ink">Same month, other years</h2>
          <ul className="mt-4 space-y-2">
            {sameMonthPast.map((e) => (
              <li key={e.id}>
                <Link href={`/entry/${e.slug}`} className="text-accent hover:text-accent-soft">
                  {e.title}
                  <span className="ml-2 text-sm text-muted">
                    {new Date(e.takenAt).getFullYear()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
