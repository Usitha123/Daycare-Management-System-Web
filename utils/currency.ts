/**
 * Currency configuration for the Daycare Management System.
 *
 * Change CURRENCY_SYMBOL to switch currencies across the entire app.
 * Examples: "Rs. ", "$ ", "£ ", "€ ", "¥ "
 */

export const CURRENCY = {
  /** The currency symbol/prefix displayed before amounts, e.g. "Rs. " */
  symbol: "Rs. ",
  /** Locale used for number formatting (adds thousand separators) */
  locale: "en-US",
} as const;

/**
 * Format a numeric amount with the configured currency symbol and locale-aware
 * thousand separators (e.g. "Rs. 1,234.00").
 *
 * @param amount  The numeric value to format.
 * @param options Override the default min/max fraction digits.
 */
export function formatAmount(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options ?? {};
  return `${CURRENCY.symbol}${amount.toLocaleString(CURRENCY.locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}

/**
 * Format a number using only the locale-aware thousand separators
 * (no currency symbol). Useful inside charts, tooltips, etc.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString(CURRENCY.locale);
}

/**
 * Format a percentage value.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
