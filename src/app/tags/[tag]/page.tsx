import { Timeline } from "@/components/Timeline";
import { parseTags } from "@/lib/entries";
import { getPublicEntries } from "@/lib/queries";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const entries = (await getPublicEntries()).filter((e) =>
    parseTags(e.tags).some((t) => t.toLowerCase() === tag.toLowerCase()),
  );

  if (entries.length === 0) notFound();

  return (
    <div className="site-shell py-14">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Theme</p>
      <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">#{tag}</h1>
      <p className="mt-3 text-ink-soft">
        {entries.length} {entries.length === 1 ? "entry" : "entries"}
      </p>
      <div className="mt-12">
        <Timeline entries={entries} />
      </div>
    </div>
  );
}
