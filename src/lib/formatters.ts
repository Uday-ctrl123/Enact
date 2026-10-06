/**
 * Localization utilities for dates, numbers, and currency
 */

/**
 * Format date according to locale
 */
export function formatDate(date: Date | string, locale: string = "en-IN"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Format date and time according to locale
 */
export function formatDateTime(date: Date | string, locale: string = "en-IN"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string, locale: string = "en-IN"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second");
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), "year");
  }
}

/**
 * Format number according to locale
 */
export function formatNumber(num: number, locale: string = "en-IN"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format percentage according to locale
 */
export function formatPercent(value: number, locale: string = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Get locale-specific date format pattern
 */
export function getDateFormatPattern(locale: string = "en-IN"): string {
  const patterns: Record<string, string> = {
    "en-IN": "DD/MM/YYYY",
    "en-US": "MM/DD/YYYY",
    te: "DD/MM/YYYY",
    ta: "DD/MM/YYYY",
    hi: "DD/MM/YYYY",
    ml: "DD/MM/YYYY",
  };

  return patterns[locale] || "DD/MM/YYYY";
}

/**
 * Parse date string according to locale
 */
export function parseLocalizedDate(dateStr: string, locale: string = "en-IN"): Date | null {
  try {
    // Try parsing with Intl.DateTimeFormat
    const parts = dateStr.split(/[/\-.]/);
    const pattern = getDateFormatPattern(locale);

    let day, month, year;

    if (pattern === "DD/MM/YYYY") {
      [day, month, year] = parts;
    } else if (pattern === "MM/DD/YYYY") {
      [month, day, year] = parts;
    } else {
      [year, month, day] = parts;
    }

    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } catch {
    return null;
  }
}
