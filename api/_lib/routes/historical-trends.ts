export default function handler(req: any, res: any) {
  const timeframe = (req.query?.timeframe as string) || '7d';
  const startDate = req.query?.startDate as string;
  const endDate = req.query?.endDate as string;
  const dayType = (req.query?.dayType as string) || 'ALL';
  const incidentType = (req.query?.incidentType as string) || 'ALL';
  const selectedExp = (req.query?.expressway as string) || 'ALL';

  let rangeDays = 7;

  if (timeframe === '24h') {
    rangeDays = 1;
  } else if (timeframe === '30d') {
    rangeDays = 30;
  } else if (timeframe === 'custom' && startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    rangeDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
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
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const cur = new Date(startDate);
    const end = new Date(endDate);
    for (const d of dayNames) weekdayCounts[d] = 0;

    while (cur <= end) {
      const name = dayNames[cur.getDay()];
      weekdayCounts[name] = (weekdayCounts[name] || 0) + 1;
      cur.setDate(cur.getDate() + 1);
    }
    for (const d of dayNames) {
      if (weekdayCounts[d] === 0) weekdayCounts[d] = 0;
    }
  }

  const accMul = incidentType === 'ALL' || incidentType === 'ACCIDENTS' ? 1.0 : 0;
  const brkMul = incidentType === 'ALL' || incidentType === 'BREAKDOWNS' ? 1.0 : 0;
  const congMul = incidentType === 'ALL' || incidentType === 'CONGESTION' ? 1.0 : 0;
  const rwMul = incidentType === 'ALL' || incidentType === 'ROADWORKS' ? 1.0 : 0;

  // 1. Weekday Datalabel Breakdown (Monday to Sunday)
  let baseWeekdayTrends = [
    {
      day: 'Monday',
      dayShort: 'Mon',
      isWeekend: false,
      accidents: Math.round(3.2 * (weekdayCounts['Monday'] || 1) * accMul),
      breakdowns: Math.round(4.8 * (weekdayCounts['Monday'] || 1) * brkMul),
      congestionEvents: Math.round(9.5 * (weekdayCounts['Monday'] || 1) * congMul),
      totalIncidents: Math.round((3.2 * accMul + 4.8 * brkMul + 9.5 * congMul) * (weekdayCounts['Monday'] || 1)),
      avgSpeedKmh: 61.5,
      peakCongestionHour: '08:15 AM',
      label: `Mon: ${Math.round((3.2 * accMul + 4.8 * brkMul + 9.5 * congMul) * (weekdayCounts['Monday'] || 1))} inc • 61.5 km/h`,
    },
    {
      day: 'Tuesday',
      dayShort: 'Tue',
      isWeekend: false,
      accidents: Math.round(2.8 * (weekdayCounts['Tuesday'] || 1) * accMul),
      breakdowns: Math.round(4.2 * (weekdayCounts['Tuesday'] || 1) * brkMul),
      congestionEvents: Math.round(8.2 * (weekdayCounts['Tuesday'] || 1) * congMul),
      totalIncidents: Math.round((2.8 * accMul + 4.2 * brkMul + 8.2 * congMul) * (weekdayCounts['Tuesday'] || 1)),
      avgSpeedKmh: 64.8,
      peakCongestionHour: '08:30 AM',
      label: `Tue: ${Math.round((2.8 * accMul + 4.2 * brkMul + 8.2 * congMul) * (weekdayCounts['Tuesday'] || 1))} inc • 64.8 km/h`,
    },
    {
      day: 'Wednesday',
      dayShort: 'Wed',
      isWeekend: false,
      accidents: Math.round(3.0 * (weekdayCounts['Wednesday'] || 1) * accMul),
      breakdowns: Math.round(4.5 * (weekdayCounts['Wednesday'] || 1) * brkMul),
      congestionEvents: Math.round(8.8 * (weekdayCounts['Wednesday'] || 1) * congMul),
      totalIncidents: Math.round((3.0 * accMul + 4.5 * brkMul + 8.8 * congMul) * (weekdayCounts['Wednesday'] || 1)),
      avgSpeedKmh: 63.2,
      peakCongestionHour: '08:20 AM',
      label: `Wed: ${Math.round((3.0 * accMul + 4.5 * brkMul + 8.8 * congMul) * (weekdayCounts['Wednesday'] || 1))} inc • 63.2 km/h`,
    },
    {
      day: 'Thursday',
      dayShort: 'Thu',
      isWeekend: false,
      accidents: Math.round(3.1 * (weekdayCounts['Thursday'] || 1) * accMul),
      breakdowns: Math.round(4.6 * (weekdayCounts['Thursday'] || 1) * brkMul),
      congestionEvents: Math.round(9.2 * (weekdayCounts['Thursday'] || 1) * congMul),
      totalIncidents: Math.round((3.1 * accMul + 4.6 * brkMul + 9.2 * congMul) * (weekdayCounts['Thursday'] || 1)),
      avgSpeedKmh: 62.4,
      peakCongestionHour: '08:35 AM',
      label: `Thu: ${Math.round((3.1 * accMul + 4.6 * brkMul + 9.2 * congMul) * (weekdayCounts['Thursday'] || 1))} inc • 62.4 km/h`,
    },
    {
      day: 'Friday',
      dayShort: 'Fri',
      isWeekend: false,
      accidents: Math.round(4.5 * (weekdayCounts['Friday'] || 1) * accMul),
      breakdowns: Math.round(5.8 * (weekdayCounts['Friday'] || 1) * brkMul),
      congestionEvents: Math.round(12.5 * (weekdayCounts['Friday'] || 1) * congMul),
      totalIncidents: Math.round((4.5 * accMul + 5.8 * brkMul + 12.5 * congMul) * (weekdayCounts['Friday'] || 1)),
      avgSpeedKmh: 56.8,
      peakCongestionHour: '18:45 PM',
      label: `Fri: ${Math.round((4.5 * accMul + 5.8 * brkMul + 12.5 * congMul) * (weekdayCounts['Friday'] || 1))} inc • 56.8 km/h`,
    },
    {
      day: 'Saturday',
      dayShort: 'Sat',
      isWeekend: true,
      accidents: Math.round(2.1 * (weekdayCounts['Saturday'] || 1) * accMul),
      breakdowns: Math.round(3.2 * (weekdayCounts['Saturday'] || 1) * brkMul),
      congestionEvents: Math.round(5.8 * (weekdayCounts['Saturday'] || 1) * congMul),
      totalIncidents: Math.round((2.1 * accMul + 3.2 * brkMul + 5.8 * congMul) * (weekdayCounts['Saturday'] || 1)),
      avgSpeedKmh: 72.4,
      peakCongestionHour: '14:30 PM',
      label: `Sat: ${Math.round((2.1 * accMul + 3.2 * brkMul + 5.8 * congMul) * (weekdayCounts['Saturday'] || 1))} inc • 72.4 km/h`,
    },
    {
      day: 'Sunday',
      dayShort: 'Sun',
      isWeekend: true,
      accidents: Math.round(1.6 * (weekdayCounts['Sunday'] || 1) * accMul),
      breakdowns: Math.round(2.5 * (weekdayCounts['Sunday'] || 1) * brkMul),
      congestionEvents: Math.round(4.8 * (weekdayCounts['Sunday'] || 1) * congMul),
      totalIncidents: Math.round((1.6 * accMul + 2.5 * brkMul + 4.8 * congMul) * (weekdayCounts['Sunday'] || 1)),
      avgSpeedKmh: 76.1,
      peakCongestionHour: '19:00 PM',
      label: `Sun: ${Math.round((1.6 * accMul + 2.5 * brkMul + 4.8 * congMul) * (weekdayCounts['Sunday'] || 1))} inc • 76.1 km/h`,
    },
  ];

  if (dayType === 'WEEKDAYS') {
    baseWeekdayTrends = baseWeekdayTrends.filter((w) => !w.isWeekend);
  } else if (dayType === 'WEEKENDS') {
    baseWeekdayTrends = baseWeekdayTrends.filter((w) => w.isWeekend);
  }

  // 2. Diurnal Hourly Trend Breakdown
  const hourlyTrends = [
    { hour: '00:00', accidents: 0, breakdowns: Math.max(0, Math.round(0.2 * rangeDays * brkMul)), roadworks: Math.round(1.2 * rangeDays * rwMul), congestion: 0, total: Math.round((0.2 * brkMul + 1.2 * rwMul) * rangeDays) },
    { hour: '02:00', accidents: 0, breakdowns: Math.max(0, Math.round(0.1 * rangeDays * brkMul)), roadworks: Math.round(1.5 * rangeDays * rwMul), congestion: 0, total: Math.round((0.1 * brkMul + 1.5 * rwMul) * rangeDays) },
    { hour: '04:00', accidents: 0, breakdowns: Math.max(0, Math.round(0.1 * rangeDays * brkMul)), roadworks: Math.round(1.4 * rangeDays * rwMul), congestion: 0, total: Math.round((0.1 * brkMul + 1.4 * rwMul) * rangeDays) },
    { hour: '06:00', accidents: Math.round(0.4 * rangeDays * accMul), breakdowns: Math.round(0.6 * rangeDays * brkMul), roadworks: Math.round(0.5 * rangeDays * rwMul), congestion: Math.round(0.8 * rangeDays * congMul), total: Math.round((0.4 * accMul + 0.6 * brkMul + 0.5 * rwMul + 0.8 * congMul) * rangeDays) },
    { hour: '07:00', accidents: Math.round(1.1 * rangeDays * accMul), breakdowns: Math.round(1.4 * rangeDays * brkMul), roadworks: Math.round(0.1 * rangeDays * rwMul), congestion: Math.round(3.8 * rangeDays * congMul), total: Math.round((1.1 * accMul + 1.4 * brkMul + 0.1 * rwMul + 3.8 * congMul) * rangeDays) },
    { hour: '08:00', accidents: Math.round(1.8 * rangeDays * accMul), breakdowns: Math.round(2.1 * rangeDays * brkMul), roadworks: 0, congestion: Math.round(5.5 * rangeDays * congMul), total: Math.round((1.8 * accMul + 2.1 * brkMul + 5.5 * congMul) * rangeDays) },
    { hour: '09:00', accidents: Math.round(1.2 * rangeDays * accMul), breakdowns: Math.round(1.5 * rangeDays * brkMul), roadworks: Math.round(0.2 * rangeDays * rwMul), congestion: Math.round(3.5 * rangeDays * congMul), total: Math.round((1.2 * accMul + 1.5 * brkMul + 0.2 * rwMul + 3.5 * congMul) * rangeDays) },
    { hour: '10:00', accidents: Math.round(0.6 * rangeDays * accMul), breakdowns: Math.round(0.9 * rangeDays * brkMul), roadworks: Math.round(0.6 * rangeDays * rwMul), congestion: Math.round(1.4 * rangeDays * congMul), total: Math.round((0.6 * accMul + 0.9 * brkMul + 0.6 * rwMul + 1.4 * congMul) * rangeDays) },
    { hour: '12:00', accidents: Math.round(0.8 * rangeDays * accMul), breakdowns: Math.round(1.1 * rangeDays * brkMul), roadworks: Math.round(0.5 * rangeDays * rwMul), congestion: Math.round(2.0 * rangeDays * congMul), total: Math.round((0.8 * accMul + 1.1 * brkMul + 0.5 * rwMul + 2.0 * congMul) * rangeDays) },
    { hour: '14:00', accidents: Math.round(0.7 * rangeDays * accMul), breakdowns: Math.round(0.9 * rangeDays * brkMul), roadworks: Math.round(0.8 * rangeDays * rwMul), congestion: Math.round(1.6 * rangeDays * congMul), total: Math.round((0.7 * accMul + 0.9 * brkMul + 0.8 * rwMul + 1.6 * congMul) * rangeDays) },
    { hour: '16:00', accidents: Math.round(1.0 * rangeDays * accMul), breakdowns: Math.round(1.3 * rangeDays * brkMul), roadworks: Math.round(0.3 * rangeDays * rwMul), congestion: Math.round(2.8 * rangeDays * congMul), total: Math.round((1.0 * accMul + 1.3 * brkMul + 0.3 * rwMul + 2.8 * congMul) * rangeDays) },
    { hour: '17:30', accidents: Math.round(1.6 * rangeDays * accMul), breakdowns: Math.round(1.9 * rangeDays * brkMul), roadworks: 0, congestion: Math.round(4.8 * rangeDays * congMul), total: Math.round((1.6 * accMul + 1.9 * brkMul + 4.8 * congMul) * rangeDays) },
    { hour: '18:30', accidents: Math.round(2.2 * rangeDays * accMul), breakdowns: Math.round(2.5 * rangeDays * brkMul), roadworks: 0, congestion: Math.round(5.8 * rangeDays * congMul), total: Math.round((2.2 * accMul + 2.5 * brkMul + 5.8 * congMul) * rangeDays) },
    { hour: '19:30', accidents: Math.round(1.3 * rangeDays * accMul), breakdowns: Math.round(1.7 * rangeDays * brkMul), roadworks: Math.round(0.2 * rangeDays * rwMul), congestion: Math.round(3.9 * rangeDays * congMul), total: Math.round((1.3 * accMul + 1.7 * brkMul + 0.2 * rwMul + 3.9 * congMul) * rangeDays) },
    { hour: '21:00', accidents: Math.round(0.5 * rangeDays * accMul), breakdowns: Math.round(0.8 * rangeDays * brkMul), roadworks: Math.round(0.9 * rangeDays * rwMul), congestion: Math.round(1.1 * rangeDays * congMul), total: Math.round((0.5 * accMul + 0.8 * brkMul + 0.9 * rwMul + 1.1 * congMul) * rangeDays) },
    { hour: '22:30', accidents: Math.round(0.2 * rangeDays * accMul), breakdowns: Math.round(0.5 * rangeDays * brkMul), roadworks: Math.round(1.2 * rangeDays * rwMul), congestion: 0, total: Math.round((0.2 * accMul + 0.5 * brkMul + 1.2 * rwMul) * rangeDays) },
  ];

  // 3. Speed Curves
  const speedFactor = dayType === 'WEEKENDS' ? 1.12 : dayType === 'WEEKDAYS' ? 0.96 : 1.0;
  const speedTimeline = [
    { time: '00:00', PIE: Math.min(90, Math.round(90 * speedFactor)), AYE: Math.min(90, Math.round(88 * speedFactor)), CTE: Math.min(90, Math.round(85 * speedFactor)), KPE: Math.min(90, Math.round(84 * speedFactor)), ECP: Math.min(90, Math.round(92 * speedFactor)), SLE: Math.min(90, Math.round(92 * speedFactor)), avgSpeed: 88.5 },
    { time: '02:00', PIE: 90, AYE: 90, CTE: 88, KPE: 86, ECP: 90, SLE: 90, avgSpeed: 89.0 },
    { time: '04:00', PIE: 90, AYE: 90, CTE: 88, KPE: 86, ECP: 90, SLE: 90, avgSpeed: 89.0 },
    { time: '06:00', PIE: Math.round(84 * speedFactor), AYE: Math.round(82 * speedFactor), CTE: Math.round(78 * speedFactor), KPE: Math.round(80 * speedFactor), ECP: Math.round(86 * speedFactor), SLE: Math.round(88 * speedFactor), avgSpeed: Math.round(83.0 * speedFactor) },
    { time: '07:30', PIE: Math.round(42 * speedFactor), AYE: Math.round(38 * speedFactor), CTE: Math.round(24 * speedFactor), KPE: Math.round(52 * speedFactor), ECP: Math.round(58 * speedFactor), SLE: Math.round(64 * speedFactor), avgSpeed: Math.round(46.3 * speedFactor) },
    { time: '08:30', PIE: Math.round(35 * speedFactor), AYE: Math.round(32 * speedFactor), CTE: Math.round(20 * speedFactor), KPE: Math.round(48 * speedFactor), ECP: Math.round(52 * speedFactor), SLE: Math.round(58 * speedFactor), avgSpeed: Math.round(40.8 * speedFactor) },
    { time: '10:00', PIE: Math.round(68 * speedFactor), AYE: Math.round(65 * speedFactor), CTE: Math.round(58 * speedFactor), KPE: Math.round(70 * speedFactor), ECP: Math.round(76 * speedFactor), SLE: Math.round(80 * speedFactor), avgSpeed: Math.round(69.5 * speedFactor) },
    { time: '12:30', PIE: Math.round(64 * speedFactor), AYE: Math.round(62 * speedFactor), CTE: Math.round(56 * speedFactor), KPE: Math.round(68 * speedFactor), ECP: Math.round(74 * speedFactor), SLE: Math.round(78 * speedFactor), avgSpeed: Math.round(67.0 * speedFactor) },
    { time: '15:00', PIE: Math.round(66 * speedFactor), AYE: Math.round(64 * speedFactor), CTE: Math.round(59 * speedFactor), KPE: Math.round(72 * speedFactor), ECP: Math.round(75 * speedFactor), SLE: Math.round(81 * speedFactor), avgSpeed: Math.round(69.5 * speedFactor) },
    { time: '17:30', PIE: Math.round(38 * speedFactor), AYE: Math.round(34 * speedFactor), CTE: Math.round(22 * speedFactor), KPE: Math.round(44 * speedFactor), ECP: Math.round(48 * speedFactor), SLE: Math.round(54 * speedFactor), avgSpeed: Math.round(40.0 * speedFactor) },
    { time: '18:30', PIE: Math.round(30 * speedFactor), AYE: Math.round(28 * speedFactor), CTE: Math.round(18 * speedFactor), KPE: Math.round(38 * speedFactor), ECP: Math.round(42 * speedFactor), SLE: Math.round(49 * speedFactor), avgSpeed: Math.round(34.2 * speedFactor) },
    { time: '19:45', PIE: Math.round(52 * speedFactor), AYE: Math.round(48 * speedFactor), CTE: Math.round(42 * speedFactor), KPE: Math.round(59 * speedFactor), ECP: Math.round(64 * speedFactor), SLE: Math.round(70 * speedFactor), avgSpeed: Math.round(55.8 * speedFactor) },
    { time: '21:30', PIE: Math.min(90, Math.round(80 * speedFactor)), AYE: Math.min(90, Math.round(78 * speedFactor)), CTE: Math.min(90, Math.round(74 * speedFactor)), KPE: Math.min(90, Math.round(78 * speedFactor)), ECP: Math.min(90, Math.round(84 * speedFactor)), SLE: Math.min(90, Math.round(88 * speedFactor)), avgSpeed: Math.min(90, Math.round(80.3 * speedFactor)) },
    { time: '23:00', PIE: Math.min(90, Math.round(88 * speedFactor)), AYE: Math.min(90, Math.round(86 * speedFactor)), CTE: Math.min(90, Math.round(82 * speedFactor)), KPE: Math.min(90, Math.round(82 * speedFactor)), ECP: Math.min(90, Math.round(90 * speedFactor)), SLE: Math.min(90, Math.round(90 * speedFactor)), avgSpeed: Math.min(90, Math.round(86.3 * speedFactor)) },
  ];

  // 4. Corridor Reliability
  let allCorridors = [
    {
      corridor: 'PIE (Changi Airport ➔ Tuas Link)',
      expressway: 'PIE',
      currentTravelTimeMin: dayType === 'WEEKENDS' ? 38 : 48,
      baselineTravelTimeMin: 34,
      varianceMinutes: dayType === 'WEEKENDS' ? +4 : +14,
      status: dayType === 'WEEKENDS' ? 'On Time' : 'Moderate Delay',
      peakHourTrend: 'Improving',
      reliabilityScore: dayType === 'WEEKENDS' ? 94 : 88,
    },
    {
      corridor: 'CTE (SLE / Tampines ➔ City Centre CBD)',
      expressway: 'CTE',
      currentTravelTimeMin: dayType === 'WEEKENDS' ? 24 : 38,
      baselineTravelTimeMin: 19,
      varianceMinutes: dayType === 'WEEKENDS' ? +5 : +19,
      status: dayType === 'WEEKENDS' ? 'On Time' : 'Heavy Delay',
      peakHourTrend: 'Worsening',
      reliabilityScore: dayType === 'WEEKENDS' ? 92 : 76,
    },
    {
      corridor: 'AYE (Jurong Town ➔ Keppel Road / MCE)',
      expressway: 'AYE',
      currentTravelTimeMin: dayType === 'WEEKENDS' ? 25 : 31,
      baselineTravelTimeMin: 21,
      varianceMinutes: dayType === 'WEEKENDS' ? +4 : +10,
      status: dayType === 'WEEKENDS' ? 'On Time' : 'Moderate Delay',
      peakHourTrend: 'Stable',
      reliabilityScore: dayType === 'WEEKENDS' ? 93 : 84,
    },
    {
      corridor: 'KPE (TPE Punggol ➔ ECP / Marina Bay)',
      expressway: 'KPE',
      currentTravelTimeMin: 18,
      baselineTravelTimeMin: 14,
      varianceMinutes: +4,
      status: 'On Time',
      peakHourTrend: 'Improving',
      reliabilityScore: 95,
    },
    {
      corridor: 'ECP (Changi ➔ Shenton Way / CBD)',
      expressway: 'ECP',
      currentTravelTimeMin: dayType === 'WEEKENDS' ? 26 : 22,
      baselineTravelTimeMin: 17,
      varianceMinutes: dayType === 'WEEKENDS' ? +9 : +5,
      status: 'On Time',
      peakHourTrend: 'Stable',
      reliabilityScore: 92,
    },
  ];

  if (selectedExp !== 'ALL') {
    allCorridors = allCorridors.filter((c) => c.expressway === selectedExp);
  }

  // 5. MRT Reliability
  const mrtReliability = [
    {
      line: 'North-South Line (NSL)',
      code: 'NS',
      mkbfKm: 2350,
      punctualityPct: 99.85,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: dayType === 'WEEKENDS' ? 55 : 88,
      eveningPeakCrowdPct: dayType === 'WEEKENDS' ? 62 : 92,
    },
    {
      line: 'East-West Line (EWL)',
      code: 'EW',
      mkbfKm: 2180,
      punctualityPct: 99.82,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: dayType === 'WEEKENDS' ? 52 : 90,
      eveningPeakCrowdPct: dayType === 'WEEKENDS' ? 60 : 94,
    },
    {
      line: 'North East Line (NEL)',
      code: 'NE',
      mkbfKm: 2890,
      punctualityPct: 99.91,
      majorDelaysThisMonth: 1,
      morningPeakCrowdPct: dayType === 'WEEKENDS' ? 58 : 85,
      eveningPeakCrowdPct: dayType === 'WEEKENDS' ? 65 : 89,
    },
    {
      line: 'Circle Line (CCL)',
      code: 'CC',
      mkbfKm: 2640,
      punctualityPct: 99.88,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: dayType === 'WEEKENDS' ? 60 : 82,
      eveningPeakCrowdPct: dayType === 'WEEKENDS' ? 68 : 86,
    },
    {
      line: 'Downtown Line (DTL)',
      code: 'DT',
      mkbfKm: 3410,
      punctualityPct: 99.96,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: dayType === 'WEEKENDS' ? 50 : 78,
      eveningPeakCrowdPct: dayType === 'WEEKENDS' ? 58 : 81,
    },
    {
      line: 'Thomson-East Coast Line (TEL)',
      code: 'TE',
      mkbfKm: 3850,
      punctualityPct: 99.98,
      majorDelaysThisMonth: 0,
      morningPeakCrowdPct: dayType === 'WEEKENDS' ? 45 : 72,
      eveningPeakCrowdPct: dayType === 'WEEKENDS' ? 52 : 75,
    },
  ];

  let topBottlenecks = [
    { location: 'PIE near Adam Road Flyover (Westbound)', expressway: 'PIE', incidentFrequency: Number((4.8 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 18 },
    { location: 'CTE Tunnel near Cairnhill Circle (Southbound)', expressway: 'CTE', incidentFrequency: Number((5.2 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 24 },
    { location: 'AYE near Clementi Ave 6 Exit (Eastbound)', expressway: 'AYE', incidentFrequency: Number((3.9 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 15 },
    { location: 'KPE Underground near Airport Road Exit', expressway: 'KPE', incidentFrequency: Number((2.7 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 11 },
    { location: 'BKE near Dairy Farm Road (Northbound)', expressway: 'BKE', incidentFrequency: Number((2.4 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 12 },
    { location: 'SLE near Mandai Lake Road Exit (Westbound)', expressway: 'SLE', incidentFrequency: Number((2.1 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 10 },
    { location: 'ECP near Fort Road Exit (Westbound)', expressway: 'ECP', incidentFrequency: Number((2.9 * (rangeDays / 7)).toFixed(1)), avgDelayMin: 13 },
  ];

  if (selectedExp !== 'ALL') {
    topBottlenecks = topBottlenecks.filter((b) => b.expressway === selectedExp);
  }

  const totalIncidentsRecorded = baseWeekdayTrends.reduce((sum, item) => sum + item.totalIncidents, 0);
  const avgNetworkSpeedKmh = Number((64.2 * speedFactor).toFixed(1));

  res.json({
    success: true,
    timeframe,
    startDate,
    endDate,
    lastHarvestTimestamp: new Date().toISOString(),
    totalIncidentsRecorded,
    avgNetworkSpeedKmh,
    networkSpeedDeltaVsYesterdayPct: dayType === 'WEEKENDS' ? +12.4 : +4.8,
    peakHourCongestionIndex: dayType === 'WEEKENDS' ? 4.2 : 7.4,
    hourlyTrends,
    weekdayTrends: baseWeekdayTrends,
    speedTimeline,
    corridorReliability: allCorridors,
    mrtReliability,
    topBottlenecks,
  });
}
