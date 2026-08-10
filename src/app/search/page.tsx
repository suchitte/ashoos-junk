import { Suspense } from "react";
import { SearchClient } from "@/components/SearchClient";
import { searchEntries } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await searchEntries(q);

  return (
    <div className="site-shell py-14">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Find a moment</p>
      <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">Search</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
          <SearchClient
            initialQuery={q}
            results={results.map((r) => ({
              slug: r.slug,
              title: r.title,
              caption: r.caption,
              takenAt: r.takenAt.toISOString(),
            }))}
          />
        </Suspense>
      </div>
    </div>
  );
}
