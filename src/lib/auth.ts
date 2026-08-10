import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "journal_admin";
const ENTRY_COOKIE_PREFIX = "entry_unlock_";

function getSecret() {
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function makeToken(payload: string) {
  const body = Buffer.from(payload).toString("base64url");
  return `${body}.${sign(body)}`;
}

function readToken(token: string | undefined) {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    return Buffer.from(body, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return readToken(jar.get(COOKIE_NAME)?.value) === "admin";
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, makeToken("admin"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "changeme";
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function unlockEntry(entryId: string) {
  const jar = await cookies();
  jar.set(`${ENTRY_COOKIE_PREFIX}${entryId}`, makeToken(entryId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function isEntryUnlocked(entryId: string) {
  const jar = await cookies();
  return readToken(jar.get(`${ENTRY_COOKIE_PREFIX}${entryId}`)?.value) === entryId;
}

export async function canViewPrivateEntry(entryId: string) {
  if (await isAdminAuthenticated()) return true;
  return isEntryUnlocked(entryId);
}
