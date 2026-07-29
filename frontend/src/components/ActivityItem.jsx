import React from 'react';

const ActivityItem = ({ timestamp, message, badge }) => {
  const badgeStyles = {
    registration: 'bg-blue-50 text-blue-600 border-blue-200',
    submission: 'bg-purple-50 text-purple-600 border-purple-200',
    review: 'bg-amber-50 text-amber-600 border-amber-200',
    publish: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    system: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const activeStyle = badgeStyles[badge?.toLowerCase()] || badgeStyles.system;

  return (
    <div className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm text-slate-800 leading-relaxed break-words font-medium">{message}</p>
        <span className="text-[10px] text-slate-500 block font-semibold">{timestamp}</span>
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase select-none ${activeStyle}`}>
          {badge}
        </span>
      )}
    </div>
  );
};

export default ActivityItem;
