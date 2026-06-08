const LOCALE_PATH_PATTERN = /^\/(en|he)(?:\/|$)/;
const SUPPORTED_LOCALES = ["en", "he"];

export function isSafeLocalizedPath(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return false;

  return LOCALE_PATH_PATTERN.test(value);
}

export function resolveSafeNextPath(value: string | null | undefined, locale: string): string {
  if (isSafeLocalizedPath(value)) {
    return value;
  }

  const fallbackLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "en";
  return `/${fallbackLocale}`;
}
