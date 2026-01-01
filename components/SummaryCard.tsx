
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'default';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default' 
}) => {
  const variantStyles = {
    primary: 'bg-[#4F6EF7] text-white',
    secondary: 'bg-[#FFF9C4] text-[#1E293B]',
    accent: 'bg-white text-[#1E293B]',
    default: 'bg-white text-[#1E293B]'
  };

  const iconColor = variant === 'primary' ? 'text-white/60' : 'text-slate-400';

  return (
    <div className={`p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 ${variantStyles[variant]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${variant === 'primary' ? 'text-white/80' : 'text-slate-500'}`}>
            {title}
          </p>
          <h2 className="text-3xl font-bold">{value}</h2>
        </div>
        {icon && <div className={iconColor}>{icon}</div>}
      </div>
      {subtitle && (
        <p className={`text-xs mt-auto ${variant === 'primary' ? 'text-white/70' : 'text-slate-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
