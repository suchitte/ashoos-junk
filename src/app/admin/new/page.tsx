import Link from "next/link";
import { redirect } from "next/navigation";
import { EntryForm } from "@/components/admin/EntryForm";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEntryPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="site-shell max-w-3xl py-14">
      <Link href="/admin" className="text-sm text-muted hover:text-accent">
        ← Back
      </Link>
      <h1 className="display mt-4 text-4xl text-ink">New entry</h1>
      <p className="mt-2 text-ink-soft">Date, photos, a short note. Publish when ready.</p>
      <div className="mt-8">
        <EntryForm />
      </div>
    </div>
  );
}
