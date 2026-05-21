import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string, currency = "INR") {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(isFinite(n) ? n : 0);
}

export function formatCompact(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function pct(num: number, denom: number) {
  if (!denom) return 0;
  return Math.round((num / denom) * 100);
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi);
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function daysInMonth(d = new Date()) {
  return endOfMonth(d).getDate();
}

export function toNumber(x: any): number {
  if (x == null) return 0;
  if (typeof x === "number") return x;
  if (typeof x === "string") return parseFloat(x) || 0;
  if (typeof x.toNumber === "function") return x.toNumber();
  return Number(x) || 0;
}
