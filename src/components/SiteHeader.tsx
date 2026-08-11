import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/lib/site";

const links = [
  { href: "/", label: "Archive" },
  { href: "/on-this-day", label: "On this day" },
  { href: "/stats", label: "Stats" },
  { href: "/search", label: "Search" },
];

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface-strong)] backdrop-blur-md">
      <div className="site-shell flex items-center justify-between gap-4 py-4">
        <Link href="/" className="display text-xl tracking-tight text-ink sm:text-2xl">
          {siteConfig.name}
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-ink-soft">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href="/admin"
            className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
