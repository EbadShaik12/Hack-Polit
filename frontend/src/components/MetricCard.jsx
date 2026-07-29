import React from 'react';

const MetricCard = ({ title, value, description, icon: Icon, trend, color = 'blue' }) => {
  const colors = {
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    purple: {
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    emerald: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    amber: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    rose: {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
  };

  const activeColor = colors[color] || colors.blue;
  const isGreenValue = typeof value === 'string' && (value.toLowerCase() === 'online' || value.toLowerCase().includes('100%'));

  return (
    <div 
      className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-slate-900"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-500" style={{ color: '#64748B' }}>
          {title}
        </span>
        <div className={`h-10 w-10 rounded-xl ${activeColor.bg} flex items-center justify-center ${activeColor.text} border ${activeColor.border}`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span 
            className="text-3xl font-black tracking-tight"
            style={{ color: isGreenValue ? '#059669' : '#0F172A' }}
          >
            {value}
          </span>
          {trend && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs font-medium leading-relaxed text-slate-500" style={{ color: '#64748B' }}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
