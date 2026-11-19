import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, decimals: number = 2): string {
  const isNegative = value < 0;
  const abs = Math.abs(value);
  const prefix = isNegative ? "-" : "";

  if (abs >= 1e9) {
    return `${prefix}₹${(abs / 1e9).toFixed(decimals)}B`;
  }
  if (abs >= 1e6) {
    return `${prefix}₹${(abs / 1e6).toFixed(decimals)}M`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  const prefix = includeSign && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
