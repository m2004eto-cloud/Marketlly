import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { COUNTRY_DIAL_CODES, DEFAULT_COUNTRY_ISO, isoToFlag } from "../data/countryCodes";
import { formatNationalNumber, digitsOnly } from "../utils/phone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  countryIso: string;
  nationalNumber: string;
  onCountryChange: (iso: string) => void;
  onNumberChange: (formatted: string) => void;
  error?: string;
  disabled?: boolean;
};

export function PhoneInput({
  countryIso,
  nationalNumber,
  onCountryChange,
  onNumberChange,
  error,
  disabled,
}: Props) {
  const { t } = useTranslation();
  const selected = COUNTRY_DIAL_CODES.find((c) => c.iso === countryIso);

  const handleNumberInput = (raw: string) => {
    onNumberChange(formatNationalNumber(digitsOnly(raw)));
  };

  return (
    <div>
      <label className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 block">
        {t("auth.mobile")} <span className="text-red-500">*</span>
      </label>
      <div
        className={`flex rounded-xl border bg-white dark:bg-slate-950 overflow-hidden ${error ? "border-red-500" : "border-slate-200 dark:border-slate-700 focus-within:border-blue-600"}`}
      >
        <Select value={countryIso} onValueChange={onCountryChange} disabled={disabled}>
          <SelectTrigger
            aria-label={t("auth.countryCode")}
            className="w-[130px] shrink-0 rounded-none border-0 border-e border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 h-auto py-3 px-2 shadow-none focus:ring-0"
          >
            <SelectValue>
              {selected && (
                <span className="flex items-center gap-1.5 text-sm">
                  <span>{isoToFlag(selected.iso)}</span>
                  <span>{selected.dial}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {COUNTRY_DIAL_CODES.map((c) => (
              <SelectItem key={`${c.iso}-${c.dial}`} value={c.iso}>
                <span className="flex items-center gap-2">
                  <span>{isoToFlag(c.iso)}</span>
                  <span className="text-slate-500 w-12">{c.dial}</span>
                  <span className="truncate">{c.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Phone className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            disabled={disabled}
            aria-invalid={!!error}
            value={nationalNumber}
            onChange={(e) => handleNumberInput(e.target.value)}
            placeholder={t("auth.mobilePh")}
            className="w-full ps-10 pe-3 py-3 bg-transparent outline-none disabled:opacity-60"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mt-1 ms-1">{error}</p>}
      {nationalNumber && selected && !error && (
        <p className="text-xs text-slate-400 mt-1 ms-1">
          {selected.dial} {nationalNumber}
        </p>
      )}
    </div>
  );
}

export { DEFAULT_COUNTRY_ISO };
