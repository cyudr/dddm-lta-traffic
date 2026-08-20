import { HistoricalTrendsData, WeekdayTrendMetric } from '../types';

export function getHistoricalTrendsFallbackData(
  timeframe: '24h' | '7d' | '30d' | 'custom' = '7d',
  startDate?: string,
  endDate?: string
): HistoricalTrendsData {
  let multiplier = 7.0;
  let rangeDays = 7;

  if (timeframe === '24h') {
    multiplier = 1.0;
    rangeDays = 1;
  } else if (timeframe === '30d') {
    multiplier = 30.0;
    rangeDays = 30;
  } else if (timeframe === 'custom' && startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    rangeDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
    multiplier = rangeDays;
  }

  // Count exact occurrences of each weekday in the date range if custom
  const weekdayCounts: Record<string, number> = {
    Monday: Math.max(1, Math.round(rangeDays / 7)),
    Tuesday: Math.max(1, Math.round(rangeDays / 7)),
    Wednesday: Math.max(1, Math.round(rangeDays / 7)),
    Thursday: Math.max(1, Math.round(rangeDays / 7)),
    Friday: Math.max(1, Math.round(rangeDays / 7)),
    Saturday: Math.max(1, Math.round(rangeDays / 7)),
    Sunday: Math.max(1, Math.round(rangeDays / 7)),
  };

  if (timeframe === 'custom' && startDate && endDate) {
    // Reset and compute exact day counts
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const cur = new Date(startDate);
    const end = new Date(endDate);
    for (const d of dayNames) weekdayCounts[d] = 0;

    while (cur <= end) {
      const name = dayNames[cur.getDay()];
      weekdayCounts[name] = (weekdayCounts[name] || 0) + 1;
      cur.setDate(cur.getDate() + 1);
    }
    // Prevent 0 divide
    for (const d of dayNames) {
      if (weekdayCounts[d] === 0) weekdayCounts[d] = 1;
    }
  }

  // 1. Weekday Datalabel Breakdown (Monday to Sunday)
  const weekdayTrends: WeekdayTrendMetric[] = [
    {
      day: 'Monday',
      dayShort: 'Mon',
      isWeekend: false,
      accidents: Math.round(3.2 * weekdayCounts['Monday']),
      breakdowns: Math.round(4.8 * weekdayCounts['Monday']),
      congestionEvents: Math.round(9.5 * weekdayCounts['Monday']),
      totalIncidents: Math.round(17.5 * weekdayCounts['Monday']),
      avgSpeedKmh: 61.5,
      peakCongestionHour: '08:15 AM',
      label: `Mon: ${Math.round(17.5 * weekdayCounts['Monday'])} inc • 61.5 km/h`,
    },
    {
      day: 'Tuesday',
      dayShort: 'Tue',
      isWeekend: false,
      accidents: Math.round(2.8 * weekdayCounts['Tuesday']),
      breakdowns: Math.round(4.2 * weekdayCounts['Tuesday']),
      congestionEvents: Math.round(8.2 * weekdayCounts['Tuesday']),
      totalIncidents: Math.round(15.2 * weekdayCounts['Tuesday']),
      avgSpeedKmh: 64.8,
      peakCongestionHour: '08:30 AM',
      label: `Tue: ${Math.round(15.2 * weekdayCounts['Tuesday'])} inc • 64.8 km/h`,
    },
    {
      day: 'Wednesday',
      dayShort: 'Wed',
      isWeekend: false,
      accidents: Math.round(3.0 * weekdayCounts['Wednesday']),
      breakdowns: Math.round(4.5 * weekdayCounts['Wednesday']),
      congestionEvents: Math.round(8.8 * weekdayCounts['Wednesday']),
      totalIncidents: Math.round(16.3 * weekdayCounts['Wednesday']),
      avgSpeedKmh: 63.2,
      peakCongestionHour: '08:20 AM',
      label: `Wed: ${Math.round(16.3 * weekdayCounts['Wednesday'])} inc • 63.2 km/h`,
    },
    {
      day: 'Thursday',
      dayShort: 'Thu',
      isWeekend: false,
      accidents: Math.round(3.1 * weekdayCounts['Thursday']),
      breakdowns: Math.round(4.6 * weekdayCounts['Thursday']),
      congestionEvents: Math.round(9.2 * weekdayCounts['Thursday']),
      totalIncidents: Math.round(16.9 * weekdayCounts['Thursday']),
      avgSpeedKmh: 62.4,
      peakCongestionHour: '08:35 AM',
      label: `Thu: ${Math.round(16.9 * weekdayCounts['Thursday'])} inc • 62.4 km/h`,
    },
    {
      day: 'Friday',
      dayShort: 'Fri',
      isWeekend: false,
      accidents: Math.round(4.5 * weekdayCounts['Friday']),
      breakdowns: Math.round(5.8 * weekdayCounts['Friday']),
      congestionEvents: Math.round(12.5 * weekdayCounts['Friday']),
      totalIncidents: Math.round(22.8 * weekdayCounts['Friday']),
      avgSpeedKmh: 56.8, // Heaviest weekday congestion
      peakCongestionHour: '18:45 PM',
      label: `Fri: ${Math.round(22.8 * weekdayCounts['Friday'])} inc • 56.8 km/h (PM Peak)`,
    },
    {
      day: 'Saturday',
      dayShort: 'Sat',
      isWeekend: true,
      accidents: Math.round(2.1 * weekdayCounts['Saturday']),
      breakdowns: Math.round(3.2 * weekdayCounts['Saturday']),
      congestionEvents: Math.round(5.8 * weekdayCounts['Saturday']),
      totalIncidents: Math.round(11.1 * weekdayCounts['Saturday']),
      avgSpeedKmh: 72.4,
      peakCongestionHour: '14:30 PM',
      label: `Sat: ${Math.round(11.1 * weekdayCounts['Saturday'])} inc • 72.4 km/h`,
    },
    {
      day: 'Sunday',
      dayShort: 'Sun',
      isWeekend: true,
      accidents: Math.round(1.6 * weekdayCounts['Sunday']),
      breakdowns: Math.round(2.5 * weekdayCounts['Sunday']),
      congestionEvents: Math.round(4.8 * weekdayCounts['Sunday']),
      totalIncidents: Math.round(8.9 * weekdayCounts['Sunday']),
      avgSpeedKmh: 76.1,
      peakCongestionHour: '19:00 PM (Causeway Inflow)',
      label: `Sun: ${Math.round(8.9 * weekdayCounts['Sunday'])} inc • 76.1 km/h`,
    },
  ];

  // 2. Diurnal Hourly Trend Breakdown
  // Note: In midnight hours (00:00 - 05:00), accidents/congestion are virtually 0, only scheduled night roadworks occur.
  const hourlyTrends = [
    { hour: '00:00', accidents: 0, breakdowns: Math.max(0, Math.round(0.2 * rangeDays)), roadworks: Math.round(1.2 * rangeDays), congestion: 0, total: Math.round(1.4 * rangeDays) },
    { hour: '02:00', accidents: 0, breakdowns: Math.max(0, Math.round(0.1 * rangeDays)), roadworks: Math.round(1.5 * rangeDays), congestion: 0, total: Math.round(1.6 * rangeDays) },
    { hour: '04:00', accidents: 0, breakdowns: Math.max(0, Math.round(0.1 * rangeDays)), roadworks: Math.round(1.4 * rangeDays), congestion: 0, total: Math.round(1.5 * rangeDays) },
    { hour: '06:00', accidents: Math.round(0.4 * rangeDays), breakdowns: Math.round(0.6 * rangeDays), roadworks: Math.round(0.5 * rangeDays), congestion: Math.round(0.8 * rangeDays), total: Math.round(2.3 * rangeDays) },
    { hour: '07:00', accidents: Math.round(1.1 * rangeDays), breakdowns: Math.round(1.4 * rangeDays), roadworks: Math.round(0.1 * rangeDays), congestion: Math.round(3.8 * rangeDays), total: Math.round(6.4 * rangeDays) },
    { hour: '08:00', accidents: Math.round(1.8 * rangeDays), breakdowns: Math.round(2.1 * rangeDays), roadworks: 0, congestion: Math.round(5.5 * rangeDays), total: Math.round(9.4 * rangeDays) }, // Morning peak
    { hour: '09:00', accidents: Math.round(1.2 * rangeDays), breakdowns: Math.round(1.5 * rangeDays), roadworks: Math.round(0.2 * rangeDays), congestion: Math.round(3.5 * rangeDays), total: Math.round(6.4 * rangeDays) },
    { hour: '10:00', accidents: Math.round(0.6 * rangeDays), breakdowns: Math.round(0.9 * rangeDays), roadworks: Math.round(0.6 * rangeDays), congestion: Math.round(1.4 * rangeDays), total: Math.round(3.5 * rangeDays) },
    { hour: '12:00', accidents: Math.round(0.8 * rangeDays), breakdowns: Math.round(1.1 * rangeDays), roadworks: Math.round(0.5 * rangeDays), congestion: Math.round(2.0 * rangeDays), total: Math.round(4.4 * rangeDays) },
    { hour: '14:00', accidents: Math.round(0.7 * rangeDays), breakdowns: Math.round(0.9 * rangeDays), roadworks: Math.round(0.8 * rangeDays), congestion: Math.round(1.6 * rangeDays), total: Math.round(4.0 * rangeDays) },
    { hour: '16:00', accidents: Math.round(1.0 * rangeDays), breakdowns: Math.round(1.3 * rangeDays), roadworks: Math.round(0.3 * rangeDays), congestion: Math.round(2.8 * rangeDays), total: Math.round(5.4 * rangeDays) },
    { hour: '17:30', accidents: Math.round(1.6 * rangeDays), breakdowns: Math.round(1.9 * rangeDays), roadworks: 0, congestion: Math.round(4.8 * rangeDays), total: Math.round(8.3 * rangeDays) }, // Evening peak
    { hour: '18:30', accidents: Math.round(2.2 * rangeDays), breakdowns: Math.round(2.5 * rangeDays), roadworks: 0, congestion: Math.round(5.8 * rangeDays), total: Math.round(10.5 * rangeDays) }, // Evening peak
    { hour: '19:30', accidents: Math.round(1.3 * rangeDays), breakdowns: Math.round(1.7 * rangeDays), roadworks: Math.round(0.2 * rangeDays), congestion: Math.round(3.9 * rangeDays), total: Math.round(7.1 * rangeDays) },
    { hour: '21:00', accidents: Math.round(0.5 * rangeDays), breakdowns: Math.round(0.8 * rangeDays), roadworks: Math.round(0.9 * rangeDays), congestion: Math.round(1.1 * rangeDays), total: Math.round(3.3 * rangeDays) },
    { hour: '22:30', accidents: Math.round(0.2 * rangeDays), breakdowns: Math.round(0.5 * rangeDays), roadworks: Math.round(1.2 * rangeDays), congestion: 0, total: Math.round(1.9 * rangeDays) },
  ];

  // 3. Speed Curves
  // Midnight speed in Singapore expressways is 88-92 km/h (Smooth Free Flow, 0% congestion).
  const speedTimeline = [
    { time: '00:00', PIE: 90, AYE: 88, CTE: 85, KPE: 84, ECP: 92, SLE: 92, avgSpeed: 88.5 },
    { time: '02:00', PIE: 92, AYE: 90, CTE: 88, KPE: 86, ECP: 94, SLE: 94, avgSpeed: 90.6 },
    { time: '04:00', PIE: 92, AYE: 90, CTE: 88, KPE: 86, ECP: 94, SLE: 94, avgSpeed: 90.6 },
    { time: '06:00', PIE: 84, AYE: 82, CTE: 78, KPE: 80, ECP: 86, SLE: 88, avgSpeed: 83.0 },
    { time: '07:30', PIE: 42, AYE: 38, CTE: 24, KPE: 52, ECP: 58, SLE: 64, avgSpeed: 46.3 },
    { time: '08:30', PIE: 35, AYE: 32, CTE: 20, KPE: 48, ECP: 52, SLE: 58, avgSpeed: 40.8 },
    { time: '10:00', PIE: 68, AYE: 65, CTE: 58, KPE: 70, ECP: 76, SLE: 80, avgSpeed: 69.5 },
    { time: '12:30', PIE: 64, AYE: 62, CTE: 56, KPE: 68, ECP: 74, SLE: 78, avgSpeed: 67.0 },
    { time: '15:00', PIE: 66, AYE: 64, CTE: 59, KPE: 72, ECP: 75, SLE: 81, avgSpeed: 69.5 },
    { time: '17:30', PIE: 38, AYE: 34, CTE: 22, KPE: 44, ECP: 48, SLE: 54, avgSpeed: 40.0 },
    { time: '18:30', PIE: 30, AYE: 28, CTE: 18, KPE: 38, ECP: 42, SLE: 49, avgSpeed: 34.2 },
    { time: '19:45', PIE: 52, AYE: 48, CTE: 42, KPE: 59, ECP: 64, SLE: 70, avgSpeed: 55.8 },
    { time: '21:30', PIE: 80, AYE: 78, CTE: 74, KPE: 78, ECP: 84, SLE: 88, avgSpeed: 80.3 },
    { time: '23:00', PIE: 88, AYE: 86, CTE: 82, KPE: 82, ECP: 90, SLE: 90, avgSpeed: 86.3 },
  ];

  // 4. Corridor Reliability
  const corridorReliability = [
    {
      corridor: 'PIE (Changi Airport ➔ Tuas Link)',
      currentTravelTimeMin: 48,
      baselineTravelTimeMin: 34,
      varianceMinutes: +14,
      status: 'Moderate Delay' as const,
      peakHourTrend: 'Improving' as const,
      reliabilityScore: 88,
    },
    {
      corridor: 'CTE (SLE / Tampines ➔ City Centre CBD)',
      currentTravelTimeMin: 38,
      baselineTravelTimeMin: 19,
      varianceMinutes: +19,
      status: 'Heavy Delay' as const,
      peakHourTrend: 'Worsening' as const,
      reliabilityScore: 76,
    },
    {
      corridor: 'AYE (Jurong Town ➔ Keppel Road / MCE)',
      currentTravelTimeMin: 31,
      baselineTravelTimeMin: 21,
      varianceMinutes: +10,
      status: 'Moderate Delay' as const,
      peakHourTrend: 'Stable' as const,
      reliabilityScore: 84,
    },
    {
      corridor: 'KPE (TPE Punggol ➔ ECP / Marina Bay)',
      currentTravelTimeMin: 18,
      baselineTravelTimeMin: 14,
      varianceMinutes: +4,
      status: 'On Time' as const,
      peakHourTrend: 'Improving' as const,
      reliabilityScore: 95,
    },
    {
      corridor: 'ECP (Changi ➔ Shenton Way / CBD)',
      currentTravelTimeMin: 22,
      baselineTravelTimeMin: 17,
      varianceMinutes: +5,
      status: 'On Time' as const,
      peakHourTrend: 'Stable' as const,
      reliabilityScore: 92,
    },
  ];

  // 5. MRT Reliability
  const mrtReliability = [
    {
      line: 'North-South Line (NSL)',
      code: 'NS',
      mkbfKm: 2350,
      punctualityPct: 99.85,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: 88,
      eveningPeakCrowdPct: 92,
    },
    {
      line: 'East-West Line (EWL)',
      code: 'EW',
      mkbfKm: 2180,
      punctualityPct: 99.82,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: 90,
      eveningPeakCrowdPct: 94,
    },
    {
      line: 'North East Line (NEL)',
      code: 'NE',
      mkbfKm: 2890,
      punctualityPct: 99.91,
      majorDelaysThisMonth: 1,
      morningPeakCrowdPct: 85,
      eveningPeakCrowdPct: 89,
    },
    {
      line: 'Circle Line (CCL)',
      code: 'CC',
      mkbfKm: 2640,
      punctualityPct: 99.88,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: 82,
      eveningPeakCrowdPct: 86,
    },
    {
      line: 'Downtown Line (DTL)',
      code: 'DT',
      mkbfKm: 3410,
      punctualityPct: 99.96,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: 78,
      eveningPeakCrowdPct: 81,
    },
    {
      line: 'Thomson-East Coast Line (TEL)',
      code: 'TE',
      mkbfKm: 3850,
      punctualityPct: 99.98,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: 72,
      eveningPeakCrowdPct: 75,
    },
  ];

  const topBottlenecks = [
    { location: 'PIE near Adam Road Flyover (Westbound)', expressway: 'PIE', incidentFrequency: Number((4.8 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 18 },
    { location: 'CTE Tunnel near Cairnhill Circle (Southbound)', expressway: 'CTE', incidentFrequency: Number((5.2 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 24 },
    { location: 'AYE near Clementi Ave 6 Exit (Eastbound)', expressway: 'AYE', incidentFrequency: Number((3.9 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 15 },
    { location: 'KPE Underground near Airport Road Exit', expressway: 'KPE', incidentFrequency: Number((2.7 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 11 },
    { location: 'BKE near Dairy Farm Road (Northbound)', expressway: 'BKE', incidentFrequency: Number((2.4 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 12 },
  ];

  const totalIncidentsRecorded = weekdayTrends.reduce((sum, item) => sum + item.totalIncidents, 0);

  return {
    timeframe,
    startDate,
    endDate,
    lastHarvestTimestamp: new Date().toISOString(),
    totalIncidentsRecorded,
    avgNetworkSpeedKmh: 64.2,
    networkSpeedDeltaVsYesterdayPct: +4.8,
    peakHourCongestionIndex: 7.4,
    hourlyTrends,
    weekdayTrends,
    speedTimeline,
    corridorReliability,
    mrtReliability,
    topBottlenecks,
  };
}
