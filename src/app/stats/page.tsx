import Link from "next/link";
import { getStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await getStats();

  const tiles = [
    { label: "Entries", value: stats.entryCount },
    { label: "Photos", value: stats.photoCount },
    { label: "Months posted", value: stats.monthCount },
    { label: "Streak", value: `${stats.streak} mo` },
    { label: "Places", value: stats.uniqueLocations },
    {
      label: "Top tag",
      value: stats.mostUsedTag ? `#${stats.mostUsedTag.tag}` : "—",
    },
  ];

  return (
    <div className="site-shell py-14">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">The quiet metrics</p>
      <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">Stats</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Totals and streaks across the archive.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="border-b border-[var(--line)] pb-4 pt-2"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted">{tile.label}</p>
            <p className="display mt-2 text-4xl text-ink">{tile.value}</p>
          </div>
        ))}
      </div>

      {stats.tags.length > 0 && (
        <section className="mt-16">
          <h2 className="display text-3xl text-ink">All themes</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {stats.tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-sm text-ink-soft hover:border-accent hover:text-accent"
              >
                #{tag} <span className="text-muted">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
