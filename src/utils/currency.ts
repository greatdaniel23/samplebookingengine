/**
 * Currency Formatting Utility
 * Centralized currency display for the booking engine.
 * Default currency: IDR (Indonesian Rupiah)
 */

export const DEFAULT_CURRENCY = 'IDR';
export const CURRENCY_SYMBOL = 'Rp';
export const CURRENCY_LOCALE = 'id-ID';

/**
 * Format a number as currency
 * @param amount - The numeric amount
 * @param currency - Currency code (default: IDR)
 * @returns Formatted string like "Rp 1.500.000"
 */
export function formatCurrency(amount: number | string, currency: string = DEFAULT_CURRENCY): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return `${CURRENCY_SYMBOL} 0`;
    }

    // Use Intl.NumberFormat for proper locale formatting
    const formatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return formatter.format(numAmount);
}

/**
 * Format currency with explicit symbol (for simpler displays)
 * @param amount - The numeric amount
 * @returns "Rp 1.500.000"
 */
export function formatRupiah(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
        return 'Rp 0';
    }

    // Format number with thousand separators (Indonesian style uses dots)
    const formatted = new Intl.NumberFormat('id-ID').format(Math.round(numAmount));
    return `Rp ${formatted}`;
}

/**
 * Get currency code used in API/database
 */
export function getCurrencyCode(): string {
    return DEFAULT_CURRENCY;
}

export default {
    formatCurrency,
    formatRupiah,
    getCurrencyCode,
    DEFAULT_CURRENCY,
    CURRENCY_SYMBOL,
};
