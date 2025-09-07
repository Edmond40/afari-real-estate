// Centralized currency formatting utility
// Usage: formatCurrency(123456.78) => $123,456.78
// Optionally override currency and locale: formatCurrency(1000, 'EUR', 'de-DE')
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  const value = typeof amount === 'number' ? amount : parseFloat(amount || 0) || 0;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    // Fallback if Intl or currency code fails
    return `$${value.toLocaleString()}`;
  }
}
