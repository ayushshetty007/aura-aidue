import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrencyCode } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inferCurrencyFromTicker(ticker?: string | null): CurrencyCode {
  if (!ticker) return "INR";
  const t = ticker.trim().toUpperCase();
  if (
    t.endsWith(".NS") ||
    t.endsWith(".BO") ||
    t === "^NSEI" ||
    t === "^BSESN" ||
    t === "NIFTY" ||
    t === "SENSEX" ||
    t === "TATAMOTORS" ||
    t === "MARUTI" ||
    t === "TCS" ||
    t === "RELIANCE" ||
    t === "INFY" ||
    t === "HDFCBANK" ||
    t === "ICICIBANK" ||
    t === "SBIN"
  ) {
    return "INR";
  }
  return "USD";
}

export function getCurrencySymbol(currency: CurrencyCode = "INR"): string {
  return currency === "USD" ? "$" : "₹";
}

export function formatCurrency(
  value: number,
  decimals: number = 2,
  currency: CurrencyCode = "INR"
): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const isNegative = safeValue < 0;
  const abs = Math.abs(safeValue);
  const prefix = isNegative ? "-" : "";
  const symbol = getCurrencySymbol(currency);

  if (currency === "USD") {
    if (abs >= 1e12) return `${prefix}${symbol}${(abs / 1e12).toFixed(decimals)}T`;
    if (abs >= 1e9) return `${prefix}${symbol}${(abs / 1e9).toFixed(decimals)}B`;
    if (abs >= 1e6) return `${prefix}${symbol}${(abs / 1e6).toFixed(decimals)}M`;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(safeValue);
  }

  // INR formatting
  if (abs >= 1e7) {
    // 1 Crore = 10^7
    const crores = abs / 1e7;
    if (crores >= 1000) {
      return `${prefix}₹${(crores / 100000).toFixed(decimals)} Lakh Cr`;
    }
    return `${prefix}₹${crores.toFixed(decimals)} Cr`;
  }
  if (abs >= 1e6) {
    return `${prefix}₹${(abs / 1e6).toFixed(decimals)}M`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeValue);
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  const safe = Number.isFinite(value) ? value : 0;
  const prefix = includeSign && safe > 0 ? "+" : "";
  return `${prefix}${safe.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Number.isFinite(value) ? value : 0);
}
