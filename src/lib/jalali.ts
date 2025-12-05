import { toJalaali, toGregorian } from 'jalaali-js';

// Convert Gregorian ISO (YYYY-MM-DD) to Jalali value for react-modern-calendar-datepicker
export function isoToJalaliValue(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const j = toJalaali(y, m, d);
  return { year: j.jy, month: j.jm, day: j.jd };
}

// Convert Jalali value to Gregorian ISO (YYYY-MM-DD)
export function jalaliValueToIso(val: { year: number; month: number; day: number }) {
  const g = toGregorian(val.year, val.month, val.day);
  const y = String(g.gy).padStart(4, '0');
  const m = String(g.gm).padStart(2, '0');
  const d = String(g.gd).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
