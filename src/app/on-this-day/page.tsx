import { Timeline } from "@/components/Timeline";
import { getOnThisDay } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OnThisDayPage() {
  const today = new Date();
  const entries = await getOnThisDay(today);
  const label = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="site-shell py-14">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Throwback</p>
      <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">On this day · {label}</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Entries from the same month and day in past years — a quiet look backward.
      </p>
      <div className="mt-12">
        {entries.length === 0 ? (
          <p className="rounded-sm border border-dashed border-[var(--line)] px-6 py-12 text-center text-ink-soft">
            Nothing landed on this calendar day yet.
          </p>
        ) : (
          <Timeline entries={entries} />
        )}
      </div>
    </div>
  );
}
