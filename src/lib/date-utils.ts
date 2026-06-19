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
  if (!match) return new Date(localStr).getTime();
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
