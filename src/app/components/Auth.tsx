import { useState } from "react";
import {
  ArrowLeft, Mail, Lock, User, Building2, ShieldCheck, FileText, Receipt, Eye, EyeOff,
  Phone, MapPin, IdCard, Calendar, Landmark,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { defaultPlanForRole, type BillingCycle, type PlanId } from "@marketly/core";
import { HeaderControls } from "./HeaderControls";
import { Editable } from "./Editable";
import { PlanPicker } from "./SubscriptionPlans";
import { LEGAL_VERSION } from "../legal/uaePolicies";

type SignupRole = "customer" | "dealer";
type Props = {
  onBack: () => void;
  onSignIn: (input: { email: string; password: string }) => Promise<{ ok: boolean; error?: string; role?: string }>;
  onSignUp: (input: {
    email: string;
    password: string;
    name: string;
    role: SignupRole;
    planId: PlanId;
    billingCycle?: BillingCycle;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    acceptSellerPolicies?: boolean;
    marketingConsent?: boolean;
    kyc?: {
      companyLegalName: string;
      tradeName: string;
      tradeLicenseNumber: string;
      licenseIssuingAuthority: string;
      licenseExpiry: string;
      vatTrn?: string;
      authorizedSignatoryName: string;
      emiratesIdOrPassport: string;
      phone: string;
      businessEmirate: string;
      businessAddress: string;
      declaredAccurate: boolean;
    };
  }) => Promise<{ ok: boolean; error?: string; role?: string }>;
  onOpenLegal?: (doc: "terms" | "privacy" | "seller-policies") => void;
};

const EMIRATES = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain",
];
const LICENSE_AUTHORITIES = [
  "Dubai DET / DED",
  "Abu Dhabi DED",
  "Sharjah DED",
  "Ajman DED",
  "RAK DED",
  "Fujairah DED",
  "UAQ DED",
  "Dubai Free Zone (specify in address)",
  "Other UAE Free Zone",
];

const baseSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  // Dealer KYC
  companyLegalName: z.string().optional(),
  tradeName: z.string().optional(),
  tradeLicenseNumber: z.string().optional(),
  licenseIssuingAuthority: z.string().optional(),
  licenseExpiry: z.string().optional(),
  vatTrn: z.string().optional(),
  authorizedSignatoryName: z.string().optional(),
  emiratesIdOrPassport: z.string().optional(),
  phone: z.string().optional(),
  businessEmirate: z.string().optional(),
  businessAddress: z.string().optional(),
  declaredAccurate: z.boolean().optional(),
  acceptTerms: z.boolean().optional(),
  acceptPrivacy: z.boolean().optional(),
  acceptSellerPolicies: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
});

const makeSchema = (mode: "signin" | "signup", role: SignupRole) =>
  baseSchema.superRefine((data, ctx) => {
    if (mode !== "signup") return;
    if (!data.name || data.name.trim().length < 2) {
      ctx.addIssue({ code: "custom", path: ["name"], message: "Name must be at least 2 characters" });
    }
    if (!data.acceptTerms) {
      ctx.addIssue({ code: "custom", path: ["acceptTerms"], message: "You must accept the Terms & Conditions" });
    }
    if (!data.acceptPrivacy) {
      ctx.addIssue({ code: "custom", path: ["acceptPrivacy"], message: "You must accept the Privacy Policy" });
    }
    if (role === "dealer") {
      if (!data.acceptSellerPolicies) {
        ctx.addIssue({
          code: "custom",
          path: ["acceptSellerPolicies"],
          message: "Dealers must accept Seller Policies & KYC Procedures",
        });
      }
      const req: Array<[keyof typeof data, string]> = [
        ["companyLegalName", "Company legal name is required"],
        ["tradeName", "Trade name is required"],
        ["tradeLicenseNumber", "Trade licence number is required"],
        ["licenseIssuingAuthority", "Issuing authority is required"],
        ["licenseExpiry", "Licence expiry is required"],
        ["authorizedSignatoryName", "Authorised signatory is required"],
        ["emiratesIdOrPassport", "Emirates ID or passport is required"],
        ["phone", "UAE mobile number is required"],
        ["businessEmirate", "Business emirate is required"],
        ["businessAddress", "Business address is required"],
      ];
      for (const [key, msg] of req) {
        const v = data[key];
        if (typeof v !== "string" || !v.trim()) {
          ctx.addIssue({ code: "custom", path: [key], message: msg });
        }
      }
      if (data.vatTrn?.trim() && !/^\d{15}$/.test(data.vatTrn.trim())) {
        ctx.addIssue({ code: "custom", path: ["vatTrn"], message: "VAT TRN must be exactly 15 digits" });
      }
      if (!data.declaredAccurate) {
        ctx.addIssue({
          code: "custom",
          path: ["declaredAccurate"],
          message: "Confirm that KYC information is true and accurate",
        });
      }
    }
  });

type FormValues = z.infer<typeof baseSchema>;

export function Auth({ onBack, onSignIn, onSignUp, onOpenLegal }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<SignupRole>("customer");
  const [planId, setPlanId] = useState<PlanId>(defaultPlanForRole("customer"));
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(makeSchema(mode, role)),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      name: "",
      companyLegalName: "",
      tradeName: "",
      tradeLicenseNumber: "",
      licenseIssuingAuthority: "",
      licenseExpiry: "",
      vatTrn: "",
      authorizedSignatoryName: "",
      emiratesIdOrPassport: "",
      phone: "",
      businessEmirate: "Dubai",
      businessAddress: "",
      declaredAccurate: false,
      acceptTerms: false,
      acceptPrivacy: false,
      acceptSellerPolicies: false,
      marketingConsent: false,
    },
  });

  const openLegal = (doc: "terms" | "privacy" | "seller-policies") => {
    if (onOpenLegal) onOpenLegal(doc);
    else window.open(`/legal/${doc}`, "_blank", "noopener,noreferrer");
  };

  const onSubmit = handleSubmit(async (data) => {
    if (mode === "signin") {
      const res = await onSignIn({ email: data.email, password: data.password });
      if (!res.ok) {
        toast.error(res.error || "Sign in failed");
        return;
      }
      toast.success(`Welcome back${res.role ? ` (${res.role})` : ""}`);
      return;
    }

    if (!planId) {
      toast.error("Please select a subscription plan");
      return;
    }

    const res = await onSignUp({
      email: data.email,
      password: data.password,
      name: (data.name || "").trim(),
      role,
      planId,
      billingCycle,
      acceptTerms: Boolean(data.acceptTerms),
      acceptPrivacy: Boolean(data.acceptPrivacy),
      acceptSellerPolicies: role === "dealer" ? Boolean(data.acceptSellerPolicies) : undefined,
      marketingConsent: Boolean(data.marketingConsent),
      kyc:
        role === "dealer"
          ? {
              companyLegalName: (data.companyLegalName || "").trim(),
              tradeName: (data.tradeName || "").trim(),
              tradeLicenseNumber: (data.tradeLicenseNumber || "").trim(),
              licenseIssuingAuthority: (data.licenseIssuingAuthority || "").trim(),
              licenseExpiry: (data.licenseExpiry || "").trim(),
              vatTrn: (data.vatTrn || "").trim() || undefined,
              authorizedSignatoryName: (data.authorizedSignatoryName || "").trim(),
              emiratesIdOrPassport: (data.emiratesIdOrPassport || "").trim(),
              phone: (data.phone || "").trim(),
              businessEmirate: (data.businessEmirate || "").trim(),
              businessAddress: (data.businessAddress || "").trim(),
              declaredAccurate: Boolean(data.declaredAccurate),
            }
          : undefined,
    });
    if (!res.ok) {
      toast.error(res.error || "Could not create account");
      return;
    }
    toast.success(
      role === "dealer"
        ? "Dealer account created — KYC submitted for review (pending verification)"
        : "Account created",
    );
  });

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setRole("customer");
    setPlanId(defaultPlanForRole("customer"));
    setBillingCycle("monthly");
    setShowPassword(false);
    reset();
  };

  const selectRole = (r: SignupRole) => {
    setRole(r);
    setPlanId(defaultPlanForRole(r));
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-600 mt-1 ms-1">{msg}</p> : null;

  const inputCls = (err?: boolean) =>
    `w-full ps-10 pe-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${
      err ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"
    }`;

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
          <div className="space-y-2 text-white/70 text-sm">
            <p>{t("auth.f1")}</p>
            <p>{t("auth.f2")}</p>
            <p>{t("auth.f3")}</p>
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50 space-y-1">
              <p>Policies v{LEGAL_VERSION} · UAE Consumer Protection · PDPL · Digital Commerce</p>
              <p>Demo admin: admin@marketly.ae / admin123</p>
              <p>Demo dealer: ahmed@example.ae / dealer123</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
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
          <p className="text-slate-500 mb-6 text-sm">
            {mode === "signin"
              ? "Sign in with your email. Your role and permissions are applied automatically."
              : "Create a customer or dealer account. Acceptance of UAE-aligned Terms is mandatory. Dealers must complete KYC."}
          </p>

          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-2 mb-5">
              {([
                { id: "customer" as const, icon: User },
                { id: "dealer" as const, icon: Building2 },
              ]).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRole(r.id)}
                  className={`p-3 rounded-xl border text-start transition ${role === r.id ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-slate-200 dark:border-slate-700"}`}
                >
                  <r.icon className={`size-5 mb-2 ${role === r.id ? "text-blue-600" : "text-slate-500"}`} />
                  <p>{t(`auth.${r.id}`)}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t(`auth.${r.id}D`)}</p>
                </button>
              ))}
            </div>
          )}

          {mode === "signup" && (
            <div className="mb-5 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <PlanPicker
                role={role}
                selectedPlanId={planId}
                billingCycle={billingCycle}
                onSelectPlan={setPlanId}
                onCycleChange={setBillingCycle}
                title="Select your subscription plan"
              />
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
                    placeholder={role === "dealer" ? "Contact person full name *" : t("auth.name")}
                    className={inputCls(!!errors.name)}
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
                  className={inputCls(!!errors.email)}
                />
              </div>
              <FieldError msg={errors.email?.message} />
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  aria-invalid={!!errors.password}
                  placeholder={t("auth.password")}
                  className={`w-full ps-10 pe-11 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none ${errors.password ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError msg={errors.password?.message} />
            </div>

            {mode === "signup" && role === "dealer" && (
              <div className="space-y-3 p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="size-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Dealer KYC Form (mandatory)</p>
                    <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                      Required under Marketly Seller Policies aligned with UAE trade-licence, VAT, and AML onboarding practice.
                      Status after signup: <strong>pending review</strong>.
                    </p>
                  </div>
                </div>

                {(
                  [
                    { key: "companyLegalName" as const, icon: Landmark, ph: "Company legal name *" },
                    { key: "tradeName" as const, icon: Building2, ph: "Trade / brand name *" },
                    { key: "tradeLicenseNumber" as const, icon: FileText, ph: "Trade licence number *" },
                  ] as const
                ).map((f) => (
                  <div key={f.key}>
                    <div className="relative">
                      <f.icon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input {...register(f.key)} placeholder={f.ph} className={inputCls(!!errors[f.key])} />
                    </div>
                    <FieldError msg={errors[f.key]?.message} />
                  </div>
                ))}

                <div>
                  <div className="relative">
                    <Landmark className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10" />
                    <select {...register("licenseIssuingAuthority")} className={inputCls(!!errors.licenseIssuingAuthority) + " appearance-none"}>
                      <option value="">Licence issuing authority *</option>
                      {LICENSE_AUTHORITIES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <FieldError msg={errors.licenseIssuingAuthority?.message} />
                </div>

                <div>
                  <div className="relative">
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      {...register("licenseExpiry")}
                      type="date"
                      className={inputCls(!!errors.licenseExpiry)}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 ms-1">Trade licence expiry date *</p>
                  <FieldError msg={errors.licenseExpiry?.message} />
                </div>

                <div>
                  <div className="relative">
                    <Receipt className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      {...register("vatTrn")}
                      inputMode="numeric"
                      maxLength={15}
                      placeholder="VAT TRN (15 digits — required if FTA-registered)"
                      className={inputCls(!!errors.vatTrn)}
                    />
                  </div>
                  <FieldError msg={errors.vatTrn?.message} />
                </div>

                {(
                  [
                    { key: "authorizedSignatoryName" as const, icon: User, ph: "Authorised signatory full name *" },
                    { key: "emiratesIdOrPassport" as const, icon: IdCard, ph: "Emirates ID or passport number *" },
                    { key: "phone" as const, icon: Phone, ph: "UAE mobile (+971…) *" },
                  ] as const
                ).map((f) => (
                  <div key={f.key}>
                    <div className="relative">
                      <f.icon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input {...register(f.key)} placeholder={f.ph} className={inputCls(!!errors[f.key])} />
                    </div>
                    <FieldError msg={errors[f.key]?.message} />
                  </div>
                ))}

                <div>
                  <div className="relative">
                    <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10" />
                    <select {...register("businessEmirate")} className={inputCls(!!errors.businessEmirate) + " appearance-none"}>
                      {EMIRATES.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                  <FieldError msg={errors.businessEmirate?.message} />
                </div>

                <div>
                  <div className="relative">
                    <MapPin className="absolute start-3 top-3 size-4 text-slate-400" />
                    <textarea
                      {...register("businessAddress")}
                      rows={2}
                      placeholder="Business address / office location *"
                      className={`w-full ps-10 pe-3 py-3 rounded-xl border bg-white dark:bg-slate-950 outline-none resize-none ${
                        errors.businessAddress ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-600"
                      }`}
                    />
                  </div>
                  <FieldError msg={errors.businessAddress?.message} />
                </div>

                <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" {...register("declaredAccurate")} className="mt-0.5 accent-blue-600" />
                  <span>
                    I declare that all KYC information is true, complete, and not misleading, and I authorise Marketly
                    to verify it for compliance with UAE marketplace and AML expectations. *
                  </span>
                </label>
                <FieldError msg={errors.declaredAccurate?.message} />
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Mandatory legal acceptance (UAE-aligned) · v{LEGAL_VERSION}
                </p>
                <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" {...register("acceptTerms")} className="mt-0.5 accent-blue-600" />
                  <span>
                    I have read and agree to the{" "}
                    <button type="button" onClick={() => openLegal("terms")} className="text-blue-600 hover:underline font-medium">
                      Terms &amp; Conditions
                    </button>{" "}
                    *
                  </span>
                </label>
                <FieldError msg={errors.acceptTerms?.message} />

                <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" {...register("acceptPrivacy")} className="mt-0.5 accent-blue-600" />
                  <span>
                    I have read and agree to the{" "}
                    <button type="button" onClick={() => openLegal("privacy")} className="text-blue-600 hover:underline font-medium">
                      Privacy Policy
                    </button>{" "}
                    (PDPL) *
                  </span>
                </label>
                <FieldError msg={errors.acceptPrivacy?.message} />

                {role === "dealer" && (
                  <>
                    <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" {...register("acceptSellerPolicies")} className="mt-0.5 accent-blue-600" />
                      <span>
                        I have read and agree to the{" "}
                        <button
                          type="button"
                          onClick={() => openLegal("seller-policies")}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Seller Policies &amp; KYC Procedures
                        </button>{" "}
                        *
                      </span>
                    </label>
                    <FieldError msg={errors.acceptSellerPolicies?.message} />
                  </>
                )}

                <label className="flex items-start gap-2 text-xs text-slate-500 cursor-pointer">
                  <input type="checkbox" {...register("marketingConsent")} className="mt-0.5 accent-blue-600" />
                  <span>Optional: I consent to receive marketing updates from Marketly (withdraw anytime).</span>
                </label>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-95 disabled:opacity-60">
              {mode === "signin" ? t("auth.signin") || "Sign in" : t("auth.create")}
            </button>
          </form>

          {mode === "signup" && (
            <p className="text-slate-400 text-center mt-4 text-xs">
              Creating an account without accepting the required policies is not permitted.
              {watch("acceptTerms") && watch("acceptPrivacy") ? "" : " Check the mandatory boxes above to continue."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
