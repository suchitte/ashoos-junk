import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="site-shell flex min-h-[70vh] items-center py-14">
      <div className="mx-auto w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Admin</p>
        <h1 className="display mt-3 text-4xl text-ink">Sign in</h1>
        <p className="mt-3 text-ink-soft">
          One password for regular uploads. Change it in your environment variables.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
