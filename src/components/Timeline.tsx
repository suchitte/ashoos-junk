import { EntryCard } from "@/components/EntryCard";
import type { EntryWithPhotos } from "@/lib/queries";
import { groupByYearMonth } from "@/lib/queries";

export function Timeline({ entries }: { entries: EntryWithPhotos[] }) {
  const groups = groupByYearMonth(entries);

  if (groups.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-[var(--line)] px-6 py-16 text-center">
        <p className="display text-3xl text-ink">The album is empty</p>
        <p className="mt-3 text-ink-soft">
          Sign in to Admin and add the first entry — a date, a few photos, a short note.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {groups.map((group) => (
        <section key={`${group.year}-${group.month}`} id={`${group.year}-${group.month}`}>
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-3">
            <h2 className="display text-3xl text-ink sm:text-4xl">{group.label}</h2>
            <p className="text-sm text-muted">
              {group.entries.length} {group.entries.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {group.entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
