import { getCountryByIso } from "../data/countryCodes";

/** Strip to digits only from national number input. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Format national digits as spaced groups, e.g. 525526171 → "52 552 6171". */
export function formatNationalNumber(digits: string): string {
  const d = digitsOnly(digits);
  if (!d) return "";
  if (d.length <= 2) return d;
  const parts = [d.slice(0, 2)];
  let rest = d.slice(2);
  while (rest.length > 0) {
    parts.push(rest.slice(0, 3));
    rest = rest.slice(3);
  }
  return parts.join(" ");
}

/** Normalize any phone string to E.164, e.g. "+971 52 552 6171" → "+971525526171". */
export function normalizeE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

/** Build E.164-style number without spaces, e.g. "+971525526171". */
export function buildE164(countryIso: string, nationalDigits: string): string {
  const country = getCountryByIso(countryIso);
  const dial = country?.dial.replace("+", "") ?? "";
  return `+${dial}${digitsOnly(nationalDigits)}`;
}

/** Display format, e.g. "+971 52 552 6171". */
export function formatPhoneDisplay(countryIso: string, nationalDigits: string): string {
  const country = getCountryByIso(countryIso);
  if (!country) return nationalDigits;
  const national = formatNationalNumber(nationalDigits);
  return national ? `${country.dial} ${national}` : country.dial;
}

/** Validate national mobile number length (7–15 digits after country code). */
export function isValidMobileNumber(countryIso: string, nationalDigits: string): boolean {
  const digits = digitsOnly(nationalDigits);
  if (digits.length < 7 || digits.length > 15) return false;
  const country = getCountryByIso(countryIso);
  if (!country) return false;
  // UAE mobile: 9 digits starting with 5
  if (countryIso === "AE") {
    return /^5\d{8}$/.test(digits);
  }
  return true;
}
