"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { createSession, deleteSession } from "./session";
import { verifyCaptcha } from "./captcha";
import { getCurrentUser } from "./dal";
import { generateUniqueReferralCode } from "./referral";
import { checkRateLimit, getClientIp } from "./rate-limit";

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

export interface AuthFormState {
  error?: string;
}

export async function registerAction(
  _prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const referralCodeInput = String(formData.get("ref") ?? "").trim().toUpperCase();
  const captchaAnswer = String(formData.get("captchaAnswer") ?? "");
  const captchaToken = String(formData.get("captchaToken") ?? "");

  if (!(await checkRateLimit("register", 6, 60 * 60_000))) {
    return { error: "Demasiados intentos de registro. Intenta de nuevo más tarde." };
  }
  if (name.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };
  if (!email.includes("@")) return { error: "Ingresa un correo válido." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (!verifyCaptcha(captchaToken, captchaAnswer)) {
    return { error: "El código de seguridad no es correcto. Intenta de nuevo." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe una cuenta con ese correo." };

  const referrer = referralCodeInput
    ? await prisma.user.findUnique({ where: { referralCode: referralCodeInput } })
    : null;

  const passwordHash = await bcrypt.hash(password, 10);
  const newReferralCode = await generateUniqueReferralCode();
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "user",
      referralCode: newReferralCode,
      referredById: referrer?.id,
    },
  });

  await prisma.contributor.create({
    data: {
      name,
      avatarSeed: user.id,
      joinedAt: new Date().toISOString().slice(0, 10),
      userId: user.id,
    },
  });

  await createSession(user.id, "user");
  redirect("/");
}

export async function loginAction(
  _prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Gated on email+IP (not IP alone) so one bad actor hammering many accounts from a
  // shared IP (office, VPN) doesn't lock out everyone else behind it.
  if (!(await checkRateLimit("login", 10, 5 * 60_000, `${email}:${await getClientIp()}`))) {
    return { error: "Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return { error: "Correo o contraseña incorrectos." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Correo o contraseña incorrectos." };

  await createSession(user.id, user.role as "user" | "admin");
  redirect(user.role === "admin" ? "/admin" : "/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}


// --- Preguntas de seguridad (recuperación de contraseña sin correo) ---

export async function setSecurityQuestionsAction(input: {
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
}): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Debes iniciar sesión." };

  const q1 = input.question1.trim();
  const q2 = input.question2.trim();
  const a1 = normalizeAnswer(input.answer1);
  const a2 = normalizeAnswer(input.answer2);

  if (!q1 || !q2 || !a1 || !a2) {
    return { error: "Completa las dos preguntas y sus respuestas." };
  }
  if (q1 === q2) {
    return { error: "Elige dos preguntas distintas." };
  }

  const [answer1Hash, answer2Hash] = await Promise.all([
    bcrypt.hash(a1, 10),
    bcrypt.hash(a2, 10),
  ]);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      securityQuestion1: q1,
      securityAnswer1Hash: answer1Hash,
      securityQuestion2: q2,
      securityAnswer2Hash: answer2Hash,
    },
  });

  return {};
}

const GENERIC_RECOVERY_ERROR =
  "No encontramos preguntas de seguridad configuradas para ese correo.";

export async function getSecurityQuestionsAction(
  email: string
): Promise<{ error?: string; question1?: string; question2?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !user.securityQuestion1 || !user.securityQuestion2) {
    return { error: GENERIC_RECOVERY_ERROR };
  }

  return { question1: user.securityQuestion1, question2: user.securityQuestion2 };
}

export async function resetPasswordWithAnswersAction(input: {
  email: string;
  answer1: string;
  answer2: string;
  newPassword: string;
}): Promise<{ error?: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (input.newPassword.length < 6) {
    return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !user.securityAnswer1Hash || !user.securityAnswer2Hash) {
    return { error: GENERIC_RECOVERY_ERROR };
  }

  const [valid1, valid2] = await Promise.all([
    bcrypt.compare(normalizeAnswer(input.answer1), user.securityAnswer1Hash),
    bcrypt.compare(normalizeAnswer(input.answer2), user.securityAnswer2Hash),
  ]);

  if (!valid1 || !valid2) {
    return { error: "Una o ambas respuestas son incorrectas." };
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return {};
}
