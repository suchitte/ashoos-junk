"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Result = {
  slug: string;
  title: string;
  caption: string;
  takenAt: string;
};

export function SearchClient({ initialQuery, results }: { initialQuery: string; results: Result[] }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search dates, tags, places, captions…"
          className="w-full rounded-sm border border-[var(--line)] bg-white/50 px-4 py-3 text-ink outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm text-paper hover:bg-accent-soft"
        >
          Search
        </button>
      </form>

      <div className="mt-10 space-y-4">
        {!initialQuery && (
          <p className="text-ink-soft">Type a word and look across the whole archive.</p>
        )}
        {initialQuery && results.length === 0 && (
          <p className="text-ink-soft">No matches for “{initialQuery}”.</p>
        )}
        {results.map((r) => (
          <Link
            key={r.slug}
            href={`/entry/${r.slug}`}
            className="block border-b border-[var(--line)] pb-4 transition-colors hover:text-accent"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              {new Date(r.takenAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h2 className="display mt-1 text-2xl">{r.title}</h2>
            {r.caption && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{r.caption}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
