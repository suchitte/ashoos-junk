import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-[var(--line)] py-10">
      <div className="site-shell flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {siteConfig.name}
          <span className="mx-2 text-[var(--line)]">·</span>
          kept offline from the feed
        </p>
        <Link href="/admin" className="hover:text-accent">
          Add an entry
        </Link>
      </div>
    </footer>
  );
}
