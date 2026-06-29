import { normalizeE164 } from "../utils/phone";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_LENGTH = 6;

type PendingOtp = {
  phone: string;
  code: string;
  expiresAt: number;
  sentAt: number;
  deliveredViaWhatsApp: boolean;
};

let pending: PendingOtp | null = null;

function generateCode(): string {
  return String(Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1)));
}

/** Attempt delivery via WhatsApp Business Cloud API when env credentials are set. */
async function deliverViaWhatsAppApi(e164: string, code: string): Promise<boolean> {
  const token = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN as string | undefined;
  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID as string | undefined;
  const templateName = (import.meta.env.VITE_WHATSAPP_OTP_TEMPLATE as string | undefined) ?? "authentication_code";

  if (!token?.trim() || !phoneNumberId?.trim()) return false;

  const to = e164.replace(/^\+/, "");

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: code }],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: code }],
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      console.warn("[WhatsApp OTP] API error:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[WhatsApp OTP] Network error:", err);
    return false;
  }
}

export type OtpSendResult = {
  success: boolean;
  deliveredViaWhatsApp: boolean;
  /** Shown on-screen when WhatsApp delivery is unavailable (dev / missing API config). */
  displayCode?: string;
};

/**
 * Sends a one-time password via WhatsApp.
 * Uses WhatsApp Business Cloud API when VITE_WHATSAPP_* env vars are configured.
 */
export async function sendWhatsAppOtp(phone: string): Promise<OtpSendResult> {
  const e164 = normalizeE164(phone);

  if (pending && pending.phone === e164 && Date.now() - pending.sentAt < RESEND_COOLDOWN_MS) {
    return { success: false, deliveredViaWhatsApp: pending.deliveredViaWhatsApp };
  }

  const code = generateCode();
  const deliveredViaWhatsApp = await deliverViaWhatsAppApi(e164, code);

  pending = {
    phone: e164,
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    sentAt: Date.now(),
    deliveredViaWhatsApp,
  };

  return {
    success: true,
    deliveredViaWhatsApp,
    displayCode: deliveredViaWhatsApp ? undefined : code,
  };
}

export function verifyWhatsAppOtp(
  phone: string,
  code: string,
): { valid: boolean; reason?: "expired" | "invalid" | "missing" } {
  const e164 = normalizeE164(phone);

  if (!pending || pending.phone !== e164) {
    return { valid: false, reason: "missing" };
  }
  if (Date.now() > pending.expiresAt) {
    pending = null;
    return { valid: false, reason: "expired" };
  }
  if (pending.code !== code.trim()) {
    return { valid: false, reason: "invalid" };
  }
  pending = null;
  return { valid: true };
}

export function getResendCooldownRemaining(phone: string): number {
  const e164 = normalizeE164(phone);
  if (!pending || pending.phone !== e164) return 0;
  const elapsed = Date.now() - pending.sentAt;
  return Math.max(0, RESEND_COOLDOWN_MS - elapsed);
}

export const OTP_DIGIT_COUNT = OTP_LENGTH;
