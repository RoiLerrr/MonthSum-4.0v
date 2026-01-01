
import { DailyDataPoint, Platform } from '../types';

export const parseMarketingData = (rawText: string): DailyDataPoint[] => {
  const lines = rawText.split('\n');
  const results: DailyDataPoint[] = [];
  let currentPlatform: Platform = 'Other';
  
  // Fixed conversion rate for TikTok USD to ILS (common for Israeli marketers)
  const USD_TO_ILS = 3.7;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Detect Platform headers and switch context
    if (trimmed.includes('Amount Spent (ILS)') && trimmed.includes('Leads')) {
      currentPlatform = 'Facebook';
      return;
    } else if (trimmed.includes('Cost (USD)') && trimmed.includes('Conversions')) {
      currentPlatform = 'TikTok';
      return;
    } else if (trimmed.includes('Avg CPC') && trimmed.includes('Cost') && trimmed.includes('Conversions')) {
      // Headers for Google exports are similar, differentiation happens at row level
      currentPlatform = 'Other'; 
      return;
    }

    // Split line by tabs
    const parts = line.split('\t').map(p => p.trim());
    
    try {
      let date = '';
      let spend = 0;
      let conversions = 0;
      let platformOverride: Platform | null = null;

      // Check for Facebook rows
      // Format: Platform (0), Day (1), ..., Amount Spent (6), Leads (7)
      if (parts[0] === 'Facebook') {
        if (parts[1] === 'All') return; // Skip total row
        if (!/^\d{4}-\d{2}-\d{2}$/.test(parts[1])) return;
        
        date = parts[1];
        spend = parseFloat(parts[6]?.replace(/,/g, '') || '0');
        conversions = parseFloat(parts[7]?.replace(/,/g, '') || '0');
        platformOverride = 'Facebook';
      } 
      // Check for TikTok rows
      // Format: Date (0), Cost USD (1), ..., Conversions (8)
      else if (/^\d{4}-\d{2}-\d{2}$/.test(parts[0]) && parts.length >= 9 && !isNaN(parseFloat(parts[1]))) {
        date = parts[0];
        // Convert USD to ILS for TikTok
        spend = parseFloat(parts[1]?.replace(/,/g, '') || '0') * USD_TO_ILS;
        conversions = parseFloat(parts[8]?.replace(/,/g, '') || '0');
        platformOverride = 'TikTok';
      }
      // Check for Google rows (PMax or Search)
      // Format: Campaign (0), Date (1), ..., Cost (6), Conversions (7)
      else if (/^\d{4}-\d{2}-\d{2}$/.test(parts[1]) && parts.length >= 8) {
        date = parts[1];
        spend = parseFloat(parts[6]?.replace(/,/g, '') || '0');
        conversions = parseFloat(parts[7]?.replace(/,/g, '') || '0');
        
        const campaignName = parts[0].toUpperCase();
        if (campaignName.includes('PMAX')) {
          platformOverride = 'Google PMax';
        } else if (campaignName.includes('SEARCH')) {
          platformOverride = 'Google Search';
        }
      }

      if (date && !isNaN(spend) && platformOverride) {
        results.push({
          date,
          spend,
          conversions,
          platform: platformOverride
        });
      }
    } catch (err) {
      console.error('Error parsing line:', line, err);
    }
  });

  return results;
};
