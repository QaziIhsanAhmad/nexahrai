export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
];

export function formatCurrency(amount: number, currency: string): string {
  const cur = CURRENCIES.find((c) => c.code === currency);
  return `${cur?.symbol ?? currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
