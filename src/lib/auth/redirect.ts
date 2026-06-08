const LOCALE_PATH_PATTERN = /^\/(en|he)(?:\/|$)/;
const SUPPORTED_LOCALES = ["en", "he"];

export function isSafeLocalizedPath(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return false;

  return LOCALE_PATH_PATTERN.test(value);
}

export function resolveSafeNextPath(value: string | null | undefined, locale: string): string {
  const fallbackLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "en";

  if (typeof value === "string") {
    if (isSafeLocalizedPath(value)) {
      return value;
    }
    if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
      if (!LOCALE_PATH_PATTERN.test(value)) {
        return `/${fallbackLocale}${value}`;
      }
    }
  }

  return `/${fallbackLocale}`;
}

export function stripLocalePrefix(value: string): string {
  return value.replace(/^\/(?:en|he)(?:\/|$)/, "/");
}
