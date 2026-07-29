import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * CountdownTimer — Reusable real-time countdown for any deadline.
 *
 * Props:
 *   deadline  {Date|string}  — The target deadline datetime.
 *   label     {string}       — Short label shown above the digits (e.g. "Registration closes in").
 *   size      {'sm'|'md'|'lg'} — Controls text sizing. Default: 'md'.
 *   showDays  {boolean}      — Whether to show the days unit. Default: true.
 *   className {string}       — Extra Tailwind classes for the wrapper.
 */
const CountdownTimer = ({
  deadline,
  label = 'Closes in',
  size = 'md',
  showDays = true,
  className = '',
}) => {
  const calcTimeLeft = () => {
    const diff = new Date(deadline) - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      totalMs: diff,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!deadline) return;

    // Tick immediately, then every second
    setTimeLeft(calcTimeLeft());
    intervalRef.current = setInterval(() => {
      const t = calcTimeLeft();
      setTimeLeft(t);
      if (!t) clearInterval(intervalRef.current);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [deadline]);

  // ── Styling helpers ───────────────────────────────────────────────────────
  const isExpired = !timeLeft;
  const isUrgent = timeLeft && timeLeft.totalMs < 3 * 3600000;        // < 3 hours — red
  const isWarning = timeLeft && timeLeft.totalMs < 24 * 3600000 && !isUrgent; // < 24 hrs — amber

  const sizes = {
    sm: { digit: 'text-sm font-extrabold', unit: 'text-[9px]', label: 'text-[10px]', sep: 'text-xs' },
    md: { digit: 'text-base font-extrabold', unit: 'text-[10px]', label: 'text-xs', sep: 'text-sm' },
    lg: { digit: 'text-xl font-extrabold', unit: 'text-[11px]', label: 'text-xs', sep: 'text-lg' },
  };
  const s = sizes[size] || sizes.md;

  const wrapperColor = isExpired
    ? 'border-slate-800 bg-slate-900/40 text-slate-500'
    : isUrgent
    ? 'border-rose-500/30 bg-rose-500/5'
    : isWarning
    ? 'border-amber-500/30 bg-amber-500/5'
    : 'border-indigo-500/20 bg-indigo-500/5';

  const digitColor = isExpired
    ? 'text-slate-500'
    : isUrgent
    ? 'text-rose-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-indigo-300';

  const unitColor = isExpired
    ? 'text-slate-600'
    : isUrgent
    ? 'text-rose-500/70'
    : isWarning
    ? 'text-amber-500/70'
    : 'text-indigo-500/70';

  const pad = (n) => String(n).padStart(2, '0');

  // ── Render ────────────────────────────────────────────────────────────────
  if (isExpired) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/50 ${className}`}>
        <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Deadline Passed
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border px-3 py-2 ${wrapperColor} ${className}`}>
      {/* Label row */}
      <div className="flex items-center gap-1 mb-1.5">
        {isUrgent ? (
          <AlertTriangle className={`h-3 w-3 text-rose-400 flex-shrink-0 animate-pulse`} />
        ) : (
          <Clock className={`h-3 w-3 ${isWarning ? 'text-amber-400' : 'text-indigo-400'} flex-shrink-0`} />
        )}
        <span className={`${s.label} font-bold uppercase tracking-wider ${isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-indigo-400'}`}>
          {label}
        </span>
      </div>

      {/* Digit row */}
      <div className="flex items-end gap-1">
        {showDays && (
          <>
            <Digit value={pad(timeLeft.days)} unit="d" s={s} digitColor={digitColor} unitColor={unitColor} />
            <Separator s={s} digitColor={digitColor} />
          </>
        )}
        <Digit value={pad(timeLeft.hours)} unit="h" s={s} digitColor={digitColor} unitColor={unitColor} />
        <Separator s={s} digitColor={digitColor} />
        <Digit value={pad(timeLeft.minutes)} unit="m" s={s} digitColor={digitColor} unitColor={unitColor} />
        <Separator s={s} digitColor={digitColor} />
        <Digit value={pad(timeLeft.seconds)} unit="s" s={s} digitColor={digitColor} unitColor={unitColor} />
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const Digit = ({ value, unit, s, digitColor, unitColor }) => (
  <div className="flex flex-col items-center min-w-[1.8rem]">
    <span className={`${s.digit} leading-none tabular-nums ${digitColor} transition-all`}>
      {value}
    </span>
    <span className={`${s.unit} font-bold uppercase tracking-widest ${unitColor} mt-0.5`}>
      {unit}
    </span>
  </div>
);

const Separator = ({ s, digitColor }) => (
  <span className={`${s.sep} font-bold pb-3 opacity-40 ${digitColor} leading-none select-none`}>:</span>
);

export default CountdownTimer;
