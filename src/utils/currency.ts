import { Currency, CurrencyInfo } from '@/types';

// NOTE: All monetary values in the application are stored in USD
// The formatCurrency function automatically converts from USD to the display currency

// Currency information with symbols and locales
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'ur-PK' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'hi-IN' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
};

// Approximate exchange rates (in a real app, you'd fetch these from an API)
// All rates are relative to USD
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  PKR: 278.50, // 1 USD = 278.50 PKR (approximate)
  EUR: 0.92,   // 1 USD = 0.92 EUR
  GBP: 0.79,   // 1 USD = 0.79 GBP
  CAD: 1.36,   // 1 USD = 1.36 CAD
  AUD: 1.52,   // 1 USD = 1.52 AUD
  INR: 83.25,  // 1 USD = 83.25 INR
  JPY: 149.50, // 1 USD = 149.50 JPY
  CNY: 7.24,   // 1 USD = 7.24 CNY
};

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
  return usdAmount * EXCHANGE_RATES[toCurrency];
}

/**
 * Format currency value with proper locale and currency symbol
 * Converts from USD to the target currency and formats it
 */
export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  // Convert from USD to target currency
  const convertedAmount = convertCurrency(amount, 'USD', currency);
  
  const currencyInfo = CURRENCIES[currency];
  
  // Special formatting for currencies with different decimal places
  const minimumFractionDigits = currency === 'JPY' ? 0 : 2;
  const maximumFractionDigits = currency === 'JPY' ? 0 : 4;
  
  try {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(convertedAmount);
  } catch (error) {
    // Fallback formatting if locale is not supported
    return `${currencyInfo.symbol}${convertedAmount.toFixed(minimumFractionDigits === 0 ? 0 : 2)}`;
  }
}

/**
 * Format currency value without conversion (for when the amount is already in the target currency)
 */
export function formatCurrencyWithoutConversion(amount: number, currency: Currency = 'USD'): string {
  const currencyInfo = CURRENCIES[currency];
  
  // Special formatting for currencies with different decimal places
  const minimumFractionDigits = currency === 'JPY' ? 0 : 2;
  const maximumFractionDigits = currency === 'JPY' ? 0 : 4;
  
  try {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if locale is not supported
    return `${currencyInfo.symbol}${amount.toFixed(minimumFractionDigits === 0 ? 0 : 2)}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: Currency): string {
  return CURRENCIES[currency].name;
}

/**
 * Get all available currencies as options
 */
export function getCurrencyOptions(): Array<{ value: Currency; label: string; symbol: string }> {
  return Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.name} (${currency.symbol})`,
    symbol: currency.symbol,
  }));
} 