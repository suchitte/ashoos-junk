import Link from "next/link";
import { Timeline } from "@/components/Timeline";
import { getAllTags, getPublicEntries } from "@/lib/queries";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [entries, tags] = await Promise.all([getPublicEntries(), getAllTags()]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="hero-wash pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full" />
        <div className="site-shell relative grid min-h-[72vh] items-end gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <div>
            <p className="fade-up text-xs uppercase tracking-[0.22em] text-accent">
              {siteConfig.tagline}
            </p>
            <h1 className="fade-up-delay display mt-4 max-w-3xl text-5xl text-ink sm:text-6xl lg:text-7xl">
              {siteConfig.name}
            </h1>
            <p className="fade-up-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              A little corner for the days that mattered!
            </p>
            <div className="fade-up-delay-2 mt-8 flex flex-wrap gap-3">
              <a
                href="#archive"
                className="rounded-full bg-accent px-5 py-2.5 text-sm text-paper transition-colors hover:bg-accent-soft"
              >
                Browse archive
              </a>
              <Link
                href="/on-this-day"
                className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                On this day
              </Link>
            </div>
          </div>
          <aside className="fade-up-delay-2 self-end rounded-sm border border-[var(--line)] bg-[var(--surface)] p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Themes</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.length === 0 && (
                <span className="text-sm text-ink-soft">Tags appear once you add entries.</span>
              )}
              {tags.slice(0, 12).map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
                >
                  {tag}
                  <span className="ml-2 text-xs text-muted">{count}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section id="archive" className="site-shell py-16">
        <Timeline entries={entries} />
      </section>
    </>
  );
}
