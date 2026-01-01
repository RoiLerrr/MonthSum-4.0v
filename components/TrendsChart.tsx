
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { DailyDataPoint, Platform } from '../types';

interface TrendsChartProps {
  data: DailyDataPoint[];
  metric: 'spend' | 'conversions' | 'cpa';
  title: string;
}

const PLATFORM_COLORS: Record<Platform, string> = {
  'Facebook': '#4F6EF7',
  'TikTok': '#EE1D52',
  'Google PMax': '#FBBF24',
  'Google Search': '#10B981',
  'Other': '#94A3B8'
};

export const TrendsChart: React.FC<TrendsChartProps> = ({ data, metric, title }) => {
  // Aggregate data by date
  const chartDataMap: Record<string, any> = {};
  const platforms = new Set<Platform>();

  data.forEach(d => {
    platforms.add(d.platform);
    if (!chartDataMap[d.date]) {
      chartDataMap[d.date] = { date: d.date };
    }
    
    let value = 0;
    if (metric === 'spend') value = d.spend;
    else if (metric === 'conversions') value = d.conversions;
    else if (metric === 'cpa') value = d.conversions > 0 ? d.spend / d.conversions : 0;

    chartDataMap[d.date][d.platform] = (chartDataMap[d.date][d.platform] || 0) + value;
  });

  const chartData = Object.values(chartDataMap).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => val.split('-').slice(1).join('/')}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => metric === 'conversions' ? val : `₪${val}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            {Array.from(platforms).map(platform => (
              <Line
                key={platform}
                type="monotone"
                dataKey={platform}
                stroke={PLATFORM_COLORS[platform]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
