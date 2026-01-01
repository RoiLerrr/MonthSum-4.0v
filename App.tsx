
import React, { useState, useMemo } from 'react';
import { parseMarketingData } from './services/parser';
import { SummaryCard } from './components/SummaryCard';
import { TrendsChart } from './components/TrendsChart';
import { DailyDataPoint, SummaryStats } from './types';

const App: React.FC = () => {
  const [rawInput, setRawInput] = useState('');
  const [data, setData] = useState<DailyDataPoint[]>([]);
  const [view, setView] = useState<'input' | 'dashboard'>('input');

  const summary = useMemo((): SummaryStats => {
    if (data.length === 0) return { totalSpend: 0, totalConversions: 0, avgCpa: 0, activeChannels: 0 };
    
    const totalSpend = data.reduce((acc, curr) => acc + curr.spend, 0);
    const totalConversions = data.reduce((acc, curr) => acc + curr.conversions, 0);
    const platforms = new Set(data.map(d => d.platform));

    return {
      totalSpend,
      totalConversions,
      avgCpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
      activeChannels: platforms.size
    };
  }, [data]);

  const handleGenerate = () => {
    if (!rawInput.trim()) return;
    const parsed = parseMarketingData(rawInput);
    if (parsed.length > 0) {
      setData(parsed);
      setView('dashboard');
    } else {
      alert("No valid data found. Please paste the full platform export including headers.");
    }
  };

  const handleReset = () => {
    setView('input');
    setRawInput('');
    setData([]);
  };

  const platformBreakdown = useMemo(() => {
    const map: Record<string, { spend: number; conv: number }> = {};
    data.forEach(d => {
      if (!map[d.platform]) map[d.platform] = { spend: 0, conv: 0 };
      map[d.platform].spend += d.spend;
      map[d.platform].conv += d.conversions;
    });
    return Object.entries(map).map(([name, stats]) => ({
      name,
      ...stats,
      cpa: stats.conv > 0 ? stats.spend / stats.conv : (stats.spend > 0 ? stats.spend : 0)
    }));
  }, [data]);

  if (view === 'input') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-4xl w-full">
          <div className="mb-10">
            <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tight">MonthSum</h1>
            <p className="text-2xl text-slate-500 font-medium italic">by Roie Lerer</p>
          </div>
          
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 mb-8 transition-all hover:shadow-3xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 leading-tight">
              Stop wasting time on reports,<br /> 
              your dashboard is <span className="text-blue-600">only 2 clicks away.</span>
            </h2>
            
            <textarea
              className="w-full h-80 p-6 rounded-2xl border-2 border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-mono text-sm resize-none bg-slate-50 placeholder-slate-400"
              placeholder="Paste your export data from Facebook, TikTok, or Google here..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            />
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGenerate}
                disabled={!rawInput.trim()}
                className="px-12 py-5 bg-[#4F6EF7] text-white rounded-2xl font-bold text-xl shadow-lg shadow-blue-200 hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Generate Dashboard ✨
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-sm font-medium">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Facebook Ads</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-400"></div> TikTok Ads</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Google PMax</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Google Search</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4F6EF7] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <div>
              <span className="font-bold text-2xl text-slate-900 tracking-tight block leading-none">MonthSum</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Dashboard Preview</span>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-100 font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            New Report
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard 
            title="Total Ad Spend" 
            value={`₪${summary.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            subtitle="Combined across all channels"
            variant="primary"
            icon={<span className="text-2xl">₪</span>}
          />
          <SummaryCard 
            title="Total Conversions" 
            value={summary.totalConversions.toLocaleString()}
            subtitle="Leads & sales registered"
            icon={<span className="text-2xl">🎯</span>}
          />
          <SummaryCard 
            title="Average CPA" 
            value={`₪${summary.avgCpa.toFixed(2)}`}
            subtitle="Cost per conversion"
            variant="secondary"
            icon={<span className="text-2xl">💸</span>}
          />
          <SummaryCard 
            title="Active Channels" 
            value={summary.activeChannels}
            subtitle="Platform diversity"
            icon={<span className="text-2xl">📊</span>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <TrendsChart 
            data={data} 
            metric="spend" 
            title="Daily Ad Spend Trend (₪)"
          />
          <TrendsChart 
            data={data} 
            metric="conversions" 
            title="Daily Conversion Volume"
          />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Platform Performance</h3>
            <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider">Aggregate</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Total Spend</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Conversions</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Avg. CPA</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Spend Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {platformBreakdown.map((platform) => (
                  <tr key={platform.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${
                          platform.name === 'Facebook' ? 'bg-[#4F6EF7]' : 
                          platform.name === 'TikTok' ? 'bg-[#EE1D52]' :
                          platform.name === 'Google PMax' ? 'bg-[#FBBF24]' : 'bg-[#10B981]'
                        }`}></div>
                        <span className="font-bold text-slate-700 text-lg">{platform.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-semibold text-slate-600">₪{platform.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-5 text-right font-semibold text-slate-600">{platform.conv.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right font-bold text-slate-900">₪{platform.cpa.toFixed(2)}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(platform.spend / summary.totalSpend) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-400">{((platform.spend / summary.totalSpend) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 text-sm">
        <p>© 2024 MonthSum • Built for marketers by Roie Lerer</p>
      </footer>
    </div>
  );
};

export default App;
