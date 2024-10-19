"use server";

import { NextRequest } from "next/server";
import crypto from "node:crypto";

const GITHUB_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const ENCRYPTION_KEY = process.env.GITHUB_WEBHOOK_SECRET!;
const IV_LENGTH = 16;

export async function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export async function decrypt(text: string) {
  const textParts = text.split(":");
  const msgIv = textParts.shift() || "";
  const iv = Buffer.from(msgIv, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString();
}

// Validação da assinatura do GitHub (opcional, mas recomendado)
export async function validateSignature(req: NextRequest, payload: string) {
  const signature = req.headers.get("x-hub-signature-256")!;
  const hmac = crypto.createHmac("sha256", GITHUB_SECRET!);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
