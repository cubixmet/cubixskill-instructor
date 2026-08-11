export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_CURRENCY_SYMBOL = '₹';

export const formatCurrency = (
  value: number,
  currency = DEFAULT_CURRENCY,
  locale = 'en-IN'
): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return currency === 'INR' ? '₹0' : '$0';
  }

  // Format without trailing .00 if integer for clean display e.g. ₹500 or ₹1,000
  const hasDecimals = value % 1 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDiscount = (
  discountType: 'percentage' | 'fixed',
  value: number,
  currency = DEFAULT_CURRENCY
): string => {
  if (discountType === 'percentage') {
    return `${value}% OFF`;
  }
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${value} OFF`;
};
