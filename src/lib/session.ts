import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET ?? "butakia-dev-secret-change-in-production";
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  role: "user" | "admin";
  profileId?: string;
  [key: string]: unknown;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: "user" | "admin", profileId?: string) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, profileId });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    // NODE_ENV === "production" only means "optimized build", not "served over HTTPS" —
    // this app is commonly self-hosted over plain HTTP (e.g. a LAN IP), where a Secure
    // cookie is silently dropped by the browser, breaking sessions right after login.
    // Only opt into Secure when the deployer confirms TLS is actually in front of it.
    secure: process.env.COOKIE_SECURE === "true",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function setActiveProfileInSession(
  userId: string,
  role: "user" | "admin",
  profileId: string | null
) {
  await createSession(userId, role, profileId ?? undefined);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
