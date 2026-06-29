import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import {
  getResendCooldownRemaining,
  OTP_DIGIT_COUNT,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
} from "../services/whatsappOtp";

type Props = {
  phoneE164: string;
  phoneDisplay: string;
  initialDisplayCode?: string;
  initialDeliveredViaWhatsApp?: boolean;
  onVerified: () => void;
  onBack: () => void;
};

export function OtpVerification({
  phoneE164,
  phoneDisplay,
  initialDisplayCode,
  initialDeliveredViaWhatsApp = false,
  onVerified,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");
  const [displayCode, setDisplayCode] = useState(initialDisplayCode);
  const [deliveredViaWhatsApp, setDeliveredViaWhatsApp] = useState(initialDeliveredViaWhatsApp);

  useEffect(() => {
    const tick = () => setResendIn(Math.ceil(getResendCooldownRemaining(phoneE164) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phoneE164]);

  const handleVerify = async () => {
    if (otp.length !== OTP_DIGIT_COUNT) {
      setError(t("auth.otpIncomplete"));
      return;
    }
    setVerifying(true);
    setError("");
    const result = verifyWhatsAppOtp(phoneE164, otp);
    setVerifying(false);
    if (result.valid) {
      toast.success(t("auth.otpVerified"));
      onVerified();
      return;
    }
    if (result.reason === "expired") {
      setError(t("auth.otpExpired"));
    } else {
      setError(t("auth.otpInvalid"));
    }
    setOtp("");
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    const result = await sendWhatsAppOtp(phoneE164);
    if (!result.success) {
      toast.error(t("auth.otpResendWait"));
      return;
    }
    setDeliveredViaWhatsApp(result.deliveredViaWhatsApp);
    setDisplayCode(result.displayCode);
    if (result.deliveredViaWhatsApp) {
      toast.success(t("auth.otpSentWhatsApp"));
    } else {
      toast.info(t("auth.otpSentOnScreen"));
    }
    setResendIn(30);
    setOtp("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="size-4" /> {t("auth.backToForm")}
      </button>

      <div className="text-center space-y-2">
        <div className="mx-auto size-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
          <MessageCircle className="size-7 text-emerald-600" />
        </div>
        <h3 className="tracking-tight text-lg">{t("auth.verifyWhatsApp")}</h3>
        <p className="text-slate-500 text-sm">
          {deliveredViaWhatsApp ? t("auth.otpSentTo") : t("auth.otpUseCodeBelow")}{" "}
          <span className="font-medium text-slate-700 dark:text-slate-200">{phoneDisplay}</span>
        </p>
      </div>

      {displayCode && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 text-center space-y-1">
          <p className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide">
            {t("auth.yourVerificationCode")}
          </p>
          <p className="text-3xl font-mono font-bold tracking-[0.3em] text-amber-900 dark:text-amber-100">
            {displayCode}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">{t("auth.otpOnScreenHint")}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={OTP_DIGIT_COUNT}
          value={otp}
          onChange={setOtp}
          onComplete={handleVerify}
        >
          <InputOTPGroup>
            {Array.from({ length: OTP_DIGIT_COUNT }, (_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="size-11 rounded-lg border-slate-200 dark:border-slate-700 text-lg"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={verifying || otp.length !== OTP_DIGIT_COUNT}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:opacity-95 disabled:opacity-60"
      >
        {verifying ? t("auth.verifying") : t("auth.verifyAndCreate")}
      </button>

      <p className="text-center text-sm text-slate-500">
        {t("auth.noCode")}{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendIn > 0}
          className="text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
        >
          {resendIn > 0 ? t("auth.resendIn", { seconds: resendIn }) : t("auth.resendOtp")}
        </button>
      </p>
    </div>
  );
}
