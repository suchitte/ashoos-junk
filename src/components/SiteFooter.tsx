import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-[var(--line)] py-10">
      <div className="site-shell flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>from akka and bava with ❤️</p>
        <Link href="/admin" className="hover:text-accent">
          Add an entry
        </Link>
      </div>
    </footer>
  );
}
