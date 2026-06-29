import i18n from "./i18n";

export function formatCurrency(amount: number, currency: string = "AED") {
  const locale = i18n.language === "ar" ? "ar-AE" : "en-AE";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatCompact(amount: number) {
  const locale = i18n.language === "ar" ? "ar-AE" : "en-AE";
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return amount.toLocaleString();
  }
}

export function formatDate(ts: number | string | Date) {
  const locale = i18n.language === "ar" ? "ar-AE" : "en-AE";
  const d = typeof ts === "number" || typeof ts === "string" ? new Date(ts) : ts;
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(ts);
}
