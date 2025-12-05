import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIRR(amount: number): string {
  if (!isFinite(amount)) return '۰ ریال';
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('fa-IR').format(rounded) + ' ریال';
}

export function formatToman(amount: number): string {
  if (!isFinite(amount)) return '۰ تومان';
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('fa-IR').format(rounded) + ' تومان';
}

export function formatTimeDistancePersian(date: Date | string): string {
  const createdDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'هم اکنون';
  } else if (diffMins < 60) {
    if (diffMins === 1) return '۱ دقیقه پیش';
    return `${formatPersianNumber(diffMins)} دقیقه پیش`;
  } else if (diffHours < 24) {
    if (diffHours === 1) return '۱ ساعت پیش';
    return `${formatPersianNumber(diffHours)} ساعت پیش`;
  } else if (diffDays < 7) {
    if (diffDays === 1) return 'دیروز';
    return `${formatPersianNumber(diffDays)} روز پیش`;
  } else {
    return createdDate.toLocaleDateString('fa-IR');
  }
}

export function formatPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).split('').map(digit => persianDigits[parseInt(digit)] || digit).join('');
}
