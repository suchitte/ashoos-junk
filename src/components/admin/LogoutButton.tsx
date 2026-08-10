"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-ink-soft hover:border-accent hover:text-accent"
    >
      Log out
    </button>
  );
}
