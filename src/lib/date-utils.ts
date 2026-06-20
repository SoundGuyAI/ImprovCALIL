/**
 * Utility functions for timezone-independent date and time operations,
 * locking all user inputs and displays to the 'Asia/Jerusalem' timezone.
 */

/**
 * Converts a "YYYY-MM-DDTHH:MM" local datetime string representing Israel (Jerusalem) time
 * into a UTC Unix timestamp (milliseconds).
 */
export function convertJerusalemLocalToUtc(localStr: string): number {
  if (!localStr) return 0;
  const match = localStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    const fallback = new Date(localStr).getTime();
    return isNaN(fallback) ? 0 : fallback;
  }
  const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Start with a candidate UTC timestamp: the target local time as if it were UTC.
  let candidateTime = Date.UTC(year, month, day, hour, minute);

  // Format this candidate timestamp in Asia/Jerusalem timezone to see how far off it is.
  for (let iter = 0; iter < 3; iter++) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jerusalem",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date(candidateTime));
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";

    const fYear = parseInt(getPart("year"), 10);
    const fMonth = parseInt(getPart("month"), 10) - 1;
    const fDay = parseInt(getPart("day"), 10);
    const fHour = parseInt(getPart("hour"), 10);
    const fMinute = parseInt(getPart("minute"), 10);

    const formattedUtc = Date.UTC(fYear, fMonth, fDay, fHour, fMinute);
    const diff = formattedUtc - Date.UTC(year, month, day, hour, minute);

    if (diff === 0) {
      return candidateTime;
    }
    candidateTime -= diff;
  }
  return candidateTime;
}

/**
 * Formats a UTC Unix timestamp (milliseconds) into a "YYYY-MM-DDTHH:MM" string
 * representing the local time in the 'Asia/Jerusalem' timezone.
 */
export function convertUtcToJerusalemLocal(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";

  const year = getPart("year");
  const month = getPart("month").padStart(2, "0");
  const day = getPart("day").padStart(2, "0");
  const hour = getPart("hour").padStart(2, "0");
  const minute = getPart("minute").padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Formats a UTC Unix timestamp into a datetime-local input value using the
 * browser's local timezone (for <input type="datetime-local"> display).
 */
export function convertUtcToBrowserDatetimeLocal(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Parses a datetime-local input value (browser local wall time) into UTC ms.
 */
export function convertBrowserDatetimeLocalToUtc(localStr: string): number {
  if (!localStr) return 0;
  const match = localStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    const fallback = new Date(localStr).getTime();
    return isNaN(fallback) ? 0 : fallback;
  }
  const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = match;
  const time = new Date(
    parseInt(yearStr, 10),
    parseInt(monthStr, 10) - 1,
    parseInt(dayStr, 10),
    parseInt(hourStr, 10),
    parseInt(minuteStr, 10)
  ).getTime();
  return isNaN(time) ? 0 : time;
}

/** Converts a datetime-local picker value to a Jerusalem wall-clock string. */
export function browserDatetimeLocalToJerusalemLocal(browserStr: string): string {
  if (!browserStr) return "";
  const utc = convertBrowserDatetimeLocalToUtc(browserStr);
  if (!utc) return "";
  return convertUtcToJerusalemLocal(utc);
}

/** Converts a Jerusalem wall-clock string to a datetime-local picker value. */
export function jerusalemLocalToBrowserDatetimeLocal(jerusalemStr: string): string {
  if (!jerusalemStr) return "";
  const utc = convertJerusalemLocalToUtc(jerusalemStr);
  if (!utc) return "";
  return convertUtcToBrowserDatetimeLocal(utc);
}
