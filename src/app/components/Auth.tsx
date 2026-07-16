import { useState } from "react";
import { ArrowLeft, Mail, Lock, User, Building2, ShieldCheck, FileText, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HeaderControls } from "./HeaderControls";
import { Editable } from "./Editable";

type Role = "customer" | "dealer" | "admin";
type Props = {
  onBack: () => void;
  onLogin: (user: { name: string; role: Role }) => void;
};

const baseSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  tradeLicense: z.string().optional(),
  vatTrn: z.string().optional(),
});

const makeSchema = (mode: "signin" | "signup", role: Role) =>
  baseSchema.superRefine((data, ctx) => {
    if (mode === "signup") {
      if (!data.name || data.name.trim().length < 2) {
        ctx.addIssue({ code: "custom", path: ["name"], message: "Name must be at least 2 characters" });
      }
      if (role === "dealer") {
        if (!data.tradeLicense || !data.tradeLicense.trim()) {
          ctx.addIssue({ code: "custom", path: ["tradeLicense"], message: "Trade License Number is required" });
        }
        if (data.vatTrn && data.vatTrn.trim() && !/^\d{15}$/.test(data.vatTrn.trim())) {
          ctx.addIssue({ code: "custom", path: ["vatTrn"], message: "VAT TRN must be exactly 15 digits" });
        }
      }
    }
  });

type FormValues = z.infer<typeof baseSchema>;

export function Auth({ onBack, onLogin }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<Role>("customer");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(makeSchema(mode, role)),
    mode: "onBlur",
    defaultValues: { email: "", password: "", name: "", tradeLicense: "", vatTrn: "" },
  });

  const onSubmit = handleSubmit((data) => {
    const fallback = data.email.split("@")[0] || "Guest";
    const display = (data.name || fallback).trim();
    onLogin({ name: display.charAt(0).toUpperCase() + display.slice(1), role });
    toast.success(mode === "signin" ? `Welcome back, ${role}` : "Account created");
  });

  const switchMode = (m: "signin" | "signup") => { setMode(m); reset(); };

  const roles: { id: Role; icon: typeof User }[] = [
    { id: "customer", icon: User },
    { id: "dealer", icon: Building2 },
    { id: "admin", icon: ShieldCheck },
  ];

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-600 mt-1 ms-1">{msg}</p> : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
              <ArrowLeft className="size-4" /> {t("auth.back")}
            </button>
            <HeaderControls />
          </div>
          <div>
            <div className="size-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-6">M</div>
            <h2 className="tracking-tight mb-3" style={{ fontSize: "2rem", lineHeight: 1.1 }}>
              <Editable id="auth.welcome" page="Auth" label="Welcome Heading" defaultValue={t("auth.welcome")} />
            </h2>
            <p className="text-white/70">
              <Editable id="auth.intro" page="Auth" label="Welcome Intro" multiline defaultValue={t("auth.intro")} />
            </p>
          </div>
          <div className="space-y-2 text-white/70">
            <p>{t("auth.f1")}</p><p>{t("auth.f2")}</p><p>{t("auth.f3")}</p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="flex md:hidden mb-4 items-center justify-between">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ArrowLeft className="size-4" /> {t("post.back")}
            </button>
            <HeaderControls />
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 mb-6">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => switchMode(m)} className={`flex-1 py-2 rounded-md transition ${mode === m ? "bg-white dark:bg-slate-950 shadow-sm" : "text-slate-500"}`}>
                {t(`auth.${m}`)}
              </button>
            ))}
          </div>

          <h3 className="tracking-tight mb-1">{mode === "signin" ? t("auth.welcomeBack") : t("auth.join")}</h3>
          <p className="text-slate-500 mb-6">{mode === "signin" ? t("auth.subSignin") : t("auth.subSignup")}</p>

          {mode === "signup" && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {roles.map((r) => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)} className={`p-3 rounded-xl border text-start transition ${role === r.id ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700"}`}>
                  <r.icon className={`size-5 mb-2 ${role === r.id ? "text-blue-600" : "text-slate-500"}`} />
                  <p>{t(`auth.${r.id}`)}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t(`auth.${r.id}D`)}</p>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    placeholder={t("auth.name")}
                    className={`w-full ps-10 pe-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${errors.name ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                  />
                </div>
                <FieldError msg={errors.name?.message} />
              </div>
            )}
            <div>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  {...register("email")}
                  type="email"
                  aria-invalid={!!errors.email}
                  placeholder={t("auth.email")}
                  className={`w-full ps-10 pe-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                />
              </div>
              <FieldError msg={errors.email?.message} />
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  {...register("password")}
                  type="password"
                  aria-invalid={!!errors.password}
                  placeholder={t("auth.password")}
                  className={`w-full ps-10 pe-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${errors.password ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                />
              </div>
              <FieldError msg={errors.password?.message} />
            </div>

            {mode === "signup" && role === "dealer" && (
              <div className="space-y-3 p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <ShieldCheck className="size-3.5" /> UAE Dealer Verification
                </p>
                <div>
                  <div className="relative">
                    <FileText className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      {...register("tradeLicense")}
                      aria-invalid={!!errors.tradeLicense}
                      placeholder="Trade License Number *"
                      className={`w-full ps-10 pe-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${errors.tradeLicense ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                    />
                  </div>
                  <FieldError msg={errors.tradeLicense?.message} />
                </div>
                <div>
                  <div className="relative">
                    <Receipt className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      {...register("vatTrn")}
                      inputMode="numeric"
                      maxLength={15}
                      aria-invalid={!!errors.vatTrn}
                      placeholder="VAT TRN (15 digits, optional)"
                      className={`w-full ps-10 pe-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${errors.vatTrn ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                    />
                  </div>
                  <FieldError msg={errors.vatTrn?.message} />
                </div>
                <p className="text-xs text-slate-500">
                  As per UAE regulations, dealers must provide a valid Trade License. VAT TRN is optional unless your annual revenue exceeds AED 375,000.
                </p>
              </div>
            )}

            {mode === "signin" && (
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)} className={`py-2 rounded-lg border transition text-sm ${role === r.id ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
                    {t(`auth.${r.id}`)}
                  </button>
                ))}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-95 disabled:opacity-60">
              {mode === "signin" ? `${t("auth.signinAs")} ${t(`auth.${role}`)}` : t("auth.create")}
            </button>
          </form>

          <p className="text-slate-400 text-center mt-6">
            <Editable id="auth.terms" page="Auth" label="Terms Notice" multiline defaultValue={t("auth.terms")} />
          </p>
        </div>
      </div>
    </div>
  );
}
