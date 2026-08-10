import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { unlockEntry } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const entryId = String(body.entryId || "");
  const password = String(body.password || "");

  const entry = await prisma.entry.findUnique({ where: { id: entryId } });
  if (!entry?.isPrivate || !entry.passwordHash) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ok = await bcrypt.compare(password, entry.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  await unlockEntry(entryId);
  return NextResponse.json({ ok: true });
}
