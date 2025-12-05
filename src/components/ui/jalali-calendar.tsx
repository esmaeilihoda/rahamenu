import React from 'react';
import { isoToJalaliValue, jalaliValueToIso } from '@/lib/jalali';

type ViewMode = 'day' | 'month' | 'year';

export function JalaliCalendarPicker({
  valueIso,
  onChangeIso,
  accentColor = '#2563eb',
  hoverColor = '#93c5fd',
  textColor = '#111827',
  isDark = false,
}: {
  valueIso?: string;
  onChangeIso: (iso: string) => void;
  accentColor?: string;
  hoverColor?: string;
  textColor?: string;
  isDark?: boolean;
}) {
  const init = valueIso ? isoToJalaliValue(valueIso) : isoToJalaliValue(new Date().toISOString().slice(0, 10));
  const [mode, setMode] = React.useState<ViewMode>('day');
  const [year, setYear] = React.useState<number>(init.year);
  const [month, setMonth] = React.useState<number>(init.month);
  const [day, setDay] = React.useState<number>(init.day);
  const monthNamesFa = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];

  function daysInMonth(jy: number, jm: number) {
    // Jalali months: 1-6:31, 7-11:30, 12: 29
    if (jm >= 1 && jm <= 6) return 31;
    if (jm >= 7 && jm <= 11) return 30;
    return 29; // Esfand simplified
  }

  function applySelection(y: number, m: number, d: number) {
    const iso = jalaliValueToIso({ year: y, month: m, day: d });
    onChangeIso(iso);
  }

  const headerLabel = mode === 'day' ? `${year} / ${monthNamesFa[month-1]}` : mode === 'month' ? `${year}` : `${year - 6} - ${year + 6}`;

  const effectiveAccent = '#3b82f6';
  const effectiveHover = '#374151';
  const effectiveText = '#f3f4f6';
  const cardBg = '#1f2937';
  const borderClr = '#6b7280';

  const containerStyle: React.CSSProperties = {
    color: effectiveText,
  };

  const itemBase = 'rounded-lg cursor-pointer select-none flex items-center justify-center transition-colors duration-150';

  return (
    <div className="w-[300px] p-3 shadow-md rounded-xl border" style={{...containerStyle, backgroundColor: cardBg, borderColor: borderClr}}>
      <div className="flex items-center justify-between mb-3">
        <button
          className="px-3 py-2 rounded-lg border font-medium"
          onClick={() => setMode(mode === 'day' ? 'month' : mode === 'month' ? 'year' : 'year')}
          style={{ borderColor: borderClr, color: effectiveText, backgroundColor: '#111827' }}
        >
          {headerLabel}
        </button>
        {mode !== 'year' && (
          <div className="flex gap-1">
            <button
              className="px-2 py-1 rounded-lg border"
              onClick={() => {
                if (mode === 'day') {
                  const m = month === 1 ? 12 : month - 1;
                  const y = month === 1 ? year - 1 : year;
                  setMonth(m);
                  setYear(y);
                } else if (mode === 'month') {
                  setYear(year - 1);
                }
              }}
              style={{ borderColor: borderClr, color: effectiveText, backgroundColor: '#111827' }}
            >
              ‹
            </button>
            <button
              className="px-2 py-1 rounded-lg border"
              onClick={() => {
                if (mode === 'day') {
                  const m = month === 12 ? 1 : month + 1;
                  const y = month === 12 ? year + 1 : year;
                  setMonth(m);
                  setYear(y);
                } else if (mode === 'month') {
                  setYear(year + 1);
                }
              }}
              style={{ borderColor: borderClr, color: effectiveText, backgroundColor: '#111827' }}
            >
              ›
            </button>
          </div>
        )}
        <button
          className="px-3 py-2 rounded-lg border font-medium"
          style={{ borderColor: borderClr, color: effectiveText, backgroundColor: '#111827' }}
          title="امروز"
          onClick={() => {
            const todayIso = new Date().toISOString().slice(0,10);
            const j = isoToJalaliValue(todayIso);
            setYear(j.year); setMonth(j.month); setDay(j.day); setMode('day');
            onChangeIso(todayIso);
          }}
        >
          امروز
        </button>
      </div>

      {/* Weekday labels (Farsi) */}
      {mode === 'day' && (
        <div className="grid grid-cols-7 gap-2 mb-2 text-xs" style={{ color: '#9ca3af' }}>
          {['ش','ی','د','س','چ','پ','ج'].map((w) => (
            <div key={w} className="text-center">
              {w}
            </div>
          ))}
        </div>
      )}

      {mode === 'year' && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 13 }, (_, i) => year - 6 + i).map((y) => (
            <div
              key={y}
              className={`${itemBase} h-11 border hover:shadow-sm`}
              onClick={() => {
                setYear(y);
                setMode('month');
              }}
              style={{ borderColor: borderClr, backgroundColor: '#111827', color: effectiveText }}
              title={`سال ${y}`}
              onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = effectiveHover))}
              onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = '#111827'))}
            >
              {y}
            </div>
          ))}
        </div>
      )}

      {mode === 'month' && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <div
              key={m}
              className={`${itemBase} h-11 border hover:shadow-sm`}
              onClick={() => {
                setMonth(m);
                const d = Math.min(day, daysInMonth(year, m));
                setDay(d);
                setMode('day');
              }}
              style={{ borderColor: borderClr, backgroundColor: '#111827', color: effectiveText }}
              title={`ماه ${monthNamesFa[m-1]}`}
              onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = effectiveHover))}
              onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = '#111827'))}
            >
              {monthNamesFa[m-1]}
            </div>
          ))}
        </div>
      )}

      {mode === 'day' && (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1).map((d) => {
            const selected = d === day && year === init.year && month === init.month;
            return (
              <div
                key={d}
                className={`${itemBase} h-9 border ${selected ? 'ring-2 ring-offset-1' : ''}`}
                onClick={() => {
                  setDay(d);
                  applySelection(year, month, d);
                }}
                style={{
                  borderColor: borderClr,
                  backgroundColor: selected ? effectiveAccent : '#111827',
                  color: selected ? '#ffffff' : effectiveText,
                }}
                title={`روز ${d}`}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.backgroundColor = effectiveHover;
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.backgroundColor = '#111827';
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
