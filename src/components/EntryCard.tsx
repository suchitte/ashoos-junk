import Image from "next/image";
import Link from "next/link";
import type { EntryWithPhotos } from "@/lib/queries";
import { parseTags } from "@/lib/entries";
import { formatMonthYear } from "@/lib/entries";

export function EntryCard({ entry }: { entry: EntryWithPhotos }) {
  const cover = entry.photos[0];
  const tags = parseTags(entry.tags).slice(0, 3);

  return (
    <Link
      href={`/entry/${entry.slug}`}
      className="group block overflow-hidden rounded-sm outline-none transition-transform duration-500 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || entry.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No photo yet
          </div>
        )}
        {entry.isPrivate && (
          <span className="absolute left-3 top-3 rounded-full bg-[rgba(26,34,28,0.72)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-paper">
            Private
          </span>
        )}
      </div>
      <div className="pt-3">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">
          {formatMonthYear(new Date(entry.takenAt))}
        </p>
        <h3 className="display mt-1 text-2xl text-ink transition-colors group-hover:text-accent">
          {entry.title}
        </h3>
        {entry.caption && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{entry.caption}</p>
        )}
        {tags.length > 0 && (
          <p className="mt-2 text-xs text-muted">{tags.map((t) => `#${t}`).join("  ")}</p>
        )}
      </div>
    </Link>
  );
}
