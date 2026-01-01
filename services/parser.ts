
import { DailyDataPoint, Platform } from '../types';

export const parseMarketingData = (rawText: string): DailyDataPoint[] => {
  const lines = rawText.split('\n');
  const results: DailyDataPoint[] = [];
  let currentPlatform: Platform = 'Other';

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Detect Platform headers
    if (trimmed.includes('FACEBOOK')) {
      currentPlatform = 'Facebook';
      return;
    } else if (trimmed.includes('TIKTOK')) {
      currentPlatform = 'TikTok';
      return;
    } else if (trimmed.includes('GOOGLE PMAX')) {
      currentPlatform = 'Google PMax';
      return;
    } else if (trimmed.includes('GOOGLE SEARCH')) {
      currentPlatform = 'Google Search';
      return;
    }

    // Split line by tabs (common in spreadsheet copies)
    const parts = line.split('\t').map(p => p.trim());
    
    // Find a date (YYYY-MM-DD format)
    const dateIndex = parts.findIndex(p => /^\d{4}-\d{2}-\d{2}$/.test(p));
    if (dateIndex === -1) return;

    const date = parts[dateIndex];

    try {
      let spend = 0;
      let conversions = 0;

      switch (currentPlatform) {
        case 'Facebook':
          // Day Reach Impressions Frequency Currency Amount spent (ILS) Leads
          // Parts look like: ["", date, reach, imps, freq, curr, spend, leads, cost]
          spend = parseFloat(parts[6]?.replace(/,/g, '') || '0');
          conversions = parseFloat(parts[7]?.replace(/,/g, '') || '0');
          break;

        case 'TikTok':
          // Day | Cost USD | CPC | Impressions | CTR | Clicks | Cost/Conv | CVR | Conversions
          spend = parseFloat(parts[2]?.replace(/,/g, '') || '0');
          conversions = parseFloat(parts[9]?.replace(/,/g, '') || '0');
          break;

        case 'Google PMax':
          // קמפיין | יום | קליקים | חשיפות | שיעור קליקים | עלות ממוצעת | מחיר | המרות
          spend = parseFloat(parts[7]?.replace(/,/g, '') || '0');
          conversions = parseFloat(parts[8]?.replace(/,/g, '') || '0');
          break;

        case 'Google Search':
          // קמפיין | יום | קליקים | חשיפות | שיעור קליקים | עלות ממוצעת | מחיר | המרות
          spend = parseFloat(parts[7]?.replace(/,/g, '') || '0');
          conversions = parseFloat(parts[8]?.replace(/,/g, '') || '0');
          break;
      }

      if (!isNaN(spend) && !isNaN(conversions)) {
        results.push({
          date,
          spend,
          conversions,
          platform: currentPlatform
        });
      }
    } catch (err) {
      console.error('Error parsing line:', line, err);
    }
  });

  return results;
};
