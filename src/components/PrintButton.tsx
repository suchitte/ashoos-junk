"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent"
    >
      Print / export PDF
    </button>
  );
}
