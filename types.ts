
export type Platform = 'Facebook' | 'TikTok' | 'Google PMax' | 'Google Search' | 'Other';

export interface DailyDataPoint {
  date: string;
  spend: number;
  conversions: number;
  platform: Platform;
}

export interface SummaryStats {
  totalSpend: number;
  totalConversions: number;
  avgCpa: number;
  activeChannels: number;
}

export interface DashboardState {
  rawInput: string;
  processedData: DailyDataPoint[];
  summary: SummaryStats;
  isProcessing: boolean;
}
