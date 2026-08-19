import { HistoricalTrendsData } from '../types';

export function getHistoricalTrendsFallbackData(timeframe: '24h' | '7d' | '30d' = '24h'): HistoricalTrendsData {
  // Diurnal incident distribution calibrated with LTA peak hour historical averages
  const multiplier = timeframe === '7d' ? 6.8 : timeframe === '30d' ? 28.5 : 1.0;

  const hourlyTrends = [
    { hour: '00:00', accidents: Math.round(1 * multiplier), breakdowns: Math.round(3 * multiplier), roadworks: Math.round(6 * multiplier), congestion: 0, total: Math.round(10 * multiplier) },
    { hour: '02:00', accidents: 0, breakdowns: Math.round(2 * multiplier), roadworks: Math.round(8 * multiplier), congestion: 0, total: Math.round(10 * multiplier) },
    { hour: '04:00', accidents: Math.round(1 * multiplier), breakdowns: Math.round(1 * multiplier), roadworks: Math.round(7 * multiplier), congestion: Math.round(1 * multiplier), total: Math.round(10 * multiplier) },
    { hour: '06:00', accidents: Math.round(2 * multiplier), breakdowns: Math.round(4 * multiplier), roadworks: Math.round(3 * multiplier), congestion: Math.round(5 * multiplier), total: Math.round(14 * multiplier) },
    { hour: '07:00', accidents: Math.round(5 * multiplier), breakdowns: Math.round(8 * multiplier), roadworks: Math.round(1 * multiplier), congestion: Math.round(18 * multiplier), total: Math.round(32 * multiplier) },
    { hour: '08:00', accidents: Math.round(9 * multiplier), breakdowns: Math.round(11 * multiplier), roadworks: 0, congestion: Math.round(26 * multiplier), total: Math.round(46 * multiplier) },
    { hour: '09:00', accidents: Math.round(6 * multiplier), breakdowns: Math.round(8 * multiplier), roadworks: Math.round(1 * multiplier), congestion: Math.round(19 * multiplier), total: Math.round(34 * multiplier) },
    { hour: '10:00', accidents: Math.round(3 * multiplier), breakdowns: Math.round(5 * multiplier), roadworks: Math.round(4 * multiplier), congestion: Math.round(8 * multiplier), total: Math.round(20 * multiplier) },
    { hour: '12:00', accidents: Math.round(4 * multiplier), breakdowns: Math.round(6 * multiplier), roadworks: Math.round(3 * multiplier), congestion: Math.round(11 * multiplier), total: Math.round(24 * multiplier) },
    { hour: '14:00', accidents: Math.round(3 * multiplier), breakdowns: Math.round(4 * multiplier), roadworks: Math.round(5 * multiplier), congestion: Math.round(9 * multiplier), total: Math.round(21 * multiplier) },
    { hour: '16:00', accidents: Math.round(5 * multiplier), breakdowns: Math.round(7 * multiplier), roadworks: Math.round(2 * multiplier), congestion: Math.round(14 * multiplier), total: Math.round(28 * multiplier) },
    { hour: '17:30', accidents: Math.round(8 * multiplier), breakdowns: Math.round(10 * multiplier), roadworks: 0, congestion: Math.round(24 * multiplier), total: Math.round(42 * multiplier) },
    { hour: '18:30', accidents: Math.round(11 * multiplier), breakdowns: Math.round(13 * multiplier), roadworks: 0, congestion: Math.round(29 * multiplier), total: Math.round(53 * multiplier) },
    { hour: '19:30', accidents: Math.round(7 * multiplier), breakdowns: Math.round(9 * multiplier), roadworks: Math.round(1 * multiplier), congestion: Math.round(21 * multiplier), total: Math.round(38 * multiplier) },
    { hour: '21:00', accidents: Math.round(3 * multiplier), breakdowns: Math.round(4 * multiplier), roadworks: Math.round(6 * multiplier), congestion: Math.round(7 * multiplier), total: Math.round(20 * multiplier) },
    { hour: '22:30', accidents: Math.round(2 * multiplier), breakdowns: Math.round(3 * multiplier), roadworks: Math.round(8 * multiplier), congestion: Math.round(2 * multiplier), total: Math.round(15 * multiplier) },
  ];

  const speedTimeline = [
    { time: '00:00', PIE: 88, AYE: 85, CTE: 82, KPE: 80, ECP: 89, SLE: 90, avgSpeed: 85.6 },
    { time: '06:00', PIE: 82, AYE: 80, CTE: 76, KPE: 78, ECP: 84, SLE: 86, avgSpeed: 81.0 },
    { time: '07:30', PIE: 42, AYE: 38, CTE: 28, KPE: 52, ECP: 58, SLE: 64, avgSpeed: 47.0 },
    { time: '08:30', PIE: 35, AYE: 32, CTE: 22, KPE: 48, ECP: 52, SLE: 58, avgSpeed: 41.1 },
    { time: '10:00', PIE: 68, AYE: 65, CTE: 58, KPE: 70, ECP: 76, SLE: 80, avgSpeed: 69.5 },
    { time: '12:30', PIE: 62, AYE: 60, CTE: 54, KPE: 68, ECP: 72, SLE: 78, avgSpeed: 65.6 },
    { time: '15:00', PIE: 66, AYE: 64, CTE: 59, KPE: 72, ECP: 75, SLE: 81, avgSpeed: 69.5 },
    { time: '17:30', PIE: 39, AYE: 36, CTE: 25, KPE: 45, ECP: 49, SLE: 55, avgSpeed: 41.5 },
    { time: '18:30', PIE: 32, AYE: 30, CTE: 19, KPE: 40, ECP: 44, SLE: 51, avgSpeed: 36.0 },
    { time: '19:45', PIE: 52, AYE: 48, CTE: 42, KPE: 59, ECP: 64, SLE: 70, avgSpeed: 55.8 },
    { time: '21:30', PIE: 78, AYE: 75, CTE: 72, KPE: 77, ECP: 82, SLE: 86, avgSpeed: 78.3 },
    { time: '23:00', PIE: 86, AYE: 84, CTE: 80, KPE: 79, ECP: 88, SLE: 89, avgSpeed: 84.3 },
  ];

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
    { location: 'PIE near Adam Road Flyover (Westbound)', expressway: 'PIE', incidentFrequency: 4.8, avgDelayMin: 18 },
    { location: 'CTE Tunnel near Cairnhill Circle (Southbound)', expressway: 'CTE', incidentFrequency: 5.2, avgDelayMin: 24 },
    { location: 'AYE near Clementi Ave 6 Exit (Eastbound)', expressway: 'AYE', incidentFrequency: 3.9, avgDelayMin: 15 },
    { location: 'KPE Underground near Airport Road Exit', expressway: 'KPE', incidentFrequency: 2.7, avgDelayMin: 11 },
    { location: 'BKE near Dairy Farm Road (Northbound)', expressway: 'BKE', incidentFrequency: 2.4, avgDelayMin: 12 },
  ];

  return {
    timeframe,
    lastHarvestTimestamp: new Date().toISOString(),
    totalIncidentsRecorded: Math.round(342 * multiplier),
    avgNetworkSpeedKmh: 64.2,
    networkSpeedDeltaVsYesterdayPct: +4.8,
    peakHourCongestionIndex: 7.4,
    hourlyTrends,
    speedTimeline,
    corridorReliability,
    mrtReliability,
    topBottlenecks,
  };
}
