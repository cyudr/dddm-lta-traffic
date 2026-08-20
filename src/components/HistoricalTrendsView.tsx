import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  Car,
  Train,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { HistoricalTrendsData } from '../types';
import { getHistoricalTrendsFallbackData } from '../data/historicalTrendsData';
import { useLanguage } from '../i18n/LanguageContext';
import { MobilityDatasetsWidget } from './MobilityDatasetsWidget';

export const HistoricalTrendsView: React.FC = () => {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'custom'>('7d');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [data, setData] = useState<HistoricalTrendsData>(() => getHistoricalTrendsFallbackData('7d', startDate, endDate));
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpeedMetric, setActiveSpeedMetric] = useState<string>('ALL');
  const [dataSourceNotice, setDataSourceNotice] = useState<string>('LTA Historical Timeseries Model');

  const handlePresetChange = (tf: '24h' | '7d' | '30d' | 'custom') => {
    setTimeframe(tf);
    const end = new Date();
    const start = new Date();

    if (tf === '24h') {
      start.setDate(end.getDate() - 1);
    } else if (tf === '7d') {
      start.setDate(end.getDate() - 7);
    } else if (tf === '30d') {
      start.setDate(end.getDate() - 30);
    }

    if (tf !== 'custom') {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const selectedDaysCount = useMemo(() => {
    if (timeframe === '24h') return 1;
    if (timeframe === '7d') return 7;
    if (timeframe === '30d') return 30;
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      return Math.max(1, Math.round(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }
    return 7;
  }, [timeframe, startDate, endDate]);

  const fetchTrends = async (
    selectedTf: '24h' | '7d' | '30d' | 'custom',
    sDate: string,
    eDate: string
  ) => {
    setIsLoading(true);
    try {
      const url = `/api/historical-trends?timeframe=${selectedTf}&startDate=${sDate}&endDate=${eDate}`;
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json && json.hourlyTrends && json.hourlyTrends.length > 0) {
          setData(json);
          setDataSourceNotice('LTA DataMall Historical Timeseries Engine (Real-Time Live Ingestion)');
          setIsLoading(false);
          return;
        }
      }

      // Fallback generator for edge & Vercel deployment
      const fallback = getHistoricalTrendsFallbackData(selectedTf, sDate, eDate);
      setData(fallback);
      setDataSourceNotice('LTA Diurnal Transport Baseline Model (Vercel Edge Ready)');
    } catch (err) {
      console.warn('Backend API unreachable, using resilient LTA fallback trend model:', err);
      const fallback = getHistoricalTrendsFallbackData(selectedTf, sDate, eDate);
      setData(fallback);
      setDataSourceNotice('LTA Diurnal Transport Baseline Model (Vercel Edge Ready)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(timeframe, startDate, endDate);
  }, [timeframe, startDate, endDate]);

  return (
    <div className="flex-1 md:mr-72 flex flex-col bg-[#f8f9fa] min-h-[calc(100vh-64px)] pb-24">
      {/* 1. Header Toolbar with Date Range Selection */}
      <div className="bg-white border-b border-[#e1e3e4] px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-16 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#004481] text-white rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#191c1d] tracking-tight leading-none">
                Historical Trends & Traffic Analytics
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[12px] font-mono text-[#414751]">
                  {dataSourceNotice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Controls & Preset Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex bg-[#f3f4f5] p-1 rounded-lg border border-[#d1d5db]">
            {(['24h', '7d', '30d', 'custom'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => handlePresetChange(tf)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#004481] text-white shadow-xs'
                    : 'text-[#414751] hover:text-black'
                }`}
              >
                {tf === '24h'
                  ? '24 Hours'
                  : tf === '7d'
                  ? 'Past 7 Days'
                  : tf === '30d'
                  ? 'Past 30 Days'
                  : 'Custom Range'}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          {timeframe === 'custom' && (
            <div className="flex items-center gap-1.5 bg-white border border-[#c1c6d3] p-1 rounded-lg text-[12px] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#004481] ml-1" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-0 text-[#191c1d] text-[11px] font-mono focus:outline-none cursor-pointer"
              />
              <span className="text-[#727783] font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-0 text-[#191c1d] text-[11px] font-mono focus:outline-none cursor-pointer"
              />
              <span className="bg-[#e8f0fe] text-[#004481] text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                {selectedDaysCount}d
              </span>
            </div>
          )}

          <button
            onClick={() => fetchTrends(timeframe, startDate, endDate)}
            className="p-2 bg-white hover:bg-gray-100 border border-[#d1d5db] rounded-lg text-gray-700 transition-colors cursor-pointer shadow-2xs"
            title="Refresh Trend Model"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Main Content Dashboard */}
      <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#c1c6d3] shadow-2xs">
            <div className="flex justify-between items-start text-[#727783]">
              <span className="text-[12px] font-bold uppercase tracking-wider">Avg Expressway Speed</span>
              <Car className="w-4 h-4 text-[#004481]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#191c1d] font-mono">{data.avgNetworkSpeedKmh}</span>
              <span className="text-[14px] text-[#727783]">km/h</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-emerald-700 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{data.networkSpeedDeltaVsYesterdayPct}% vs baseline</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#c1c6d3] shadow-2xs">
            <div className="flex justify-between items-start text-[#727783]">
              <span className="text-[12px] font-bold uppercase tracking-wider">Total Recorded Incidents</span>
              <Activity className="w-4 h-4 text-[#004481]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#191c1d] font-mono">{data.totalIncidentsRecorded}</span>
              <span className="text-[14px] text-[#727783]">events</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Monitored across 10 Expressways</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#c1c6d3] shadow-2xs">
            <div className="flex justify-between items-start text-[#727783]">
              <span className="text-[12px] font-bold uppercase tracking-wider">Rail System Punctuality</span>
              <Train className="w-4 h-4 text-[#004481]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-emerald-700 font-mono">99.88%</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Exceeding LTA 99.80% Target</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#c1c6d3] shadow-2xs">
            <div className="flex justify-between items-start text-[#727783]">
              <span className="text-[12px] font-bold uppercase tracking-wider">Peak Hour Delay Index</span>
              <Clock className="w-4 h-4 text-[#004481]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-amber-700 font-mono">1.38x</span>
              <span className="text-[12px] text-[#727783]">multiplier</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-amber-700 font-semibold">
              <span>Friday Evening: Heaviest Surge</span>
            </div>
          </div>
        </div>

        {/* 1. WEEKDAY BREAKDOWN WITH EXPLICIT DATA LABELS (Monday to Sunday) */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-[#c1c6d3] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1e3e4] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#004481]" />
                <h3 className="text-[17px] font-bold text-[#191c1d]">
                  Incident Volume & Velocity Breakdown by Day of the Week
                </h3>
              </div>
              <p className="text-[12px] text-[#727783] mt-0.5">
                Explicit data labels by weekday displaying total incidents, peak hours, and average velocity.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-[#414751]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#004481] rounded-xs inline-block"></span>
                Total Incidents
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#d93025] rounded-xs inline-block"></span>
                Accidents
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#f29900] rounded-xs inline-block"></span>
                Breakdowns
              </span>
            </div>
          </div>

          {/* Weekday Bar Chart with Datalabels */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.weekdayTrends}
                margin={{ top: 25, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dayShort" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#191c1d' }} />
                <YAxis tick={{ fontSize: 11, fill: '#727783' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#c1c6d3] p-3 rounded-lg shadow-lg text-[12px] space-y-1">
                          <p className="font-bold text-[#004481] text-[13px] border-b border-[#edeeef] pb-1">
                            {d.day} ({d.isWeekend ? 'Weekend' : 'Weekday'})
                          </p>
                          <p className="text-[#191c1d]">
                            Total Incidents: <strong>{d.totalIncidents}</strong>
                          </p>
                          <p className="text-red-700">Accidents: {d.accidents}</p>
                          <p className="text-amber-700">Vehicle Breakdowns: {d.breakdowns}</p>
                          <p className="text-blue-700">Congestion Events: {d.congestionEvents}</p>
                          <p className="text-emerald-700 font-bold">Avg Speed: {d.avgSpeedKmh} km/h</p>
                          <p className="text-[#727783] text-[11px]">Peak Window: {d.peakCongestionHour}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="totalIncidents" fill="#004481" name="Total Incidents" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="label"
                    position="top"
                    style={{ fontSize: '10px', fill: '#004481', fontWeight: 'bold' }}
                  />
                </Bar>
                <Bar dataKey="accidents" fill="#d93025" name="Accidents" radius={[4, 4, 0, 0]} />
                <Bar dataKey="breakdowns" fill="#f29900" name="Breakdowns" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekday Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
            {data.weekdayTrends.map((w, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-center transition-all ${
                  w.dayShort === 'Fri'
                    ? 'bg-red-50/60 border-red-200 shadow-xs'
                    : w.isWeekend
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-[#f8f9fa] border-[#e1e3e4]'
                }`}
              >
                <span className="text-[11px] font-bold uppercase text-[#414751] block">{w.dayShort}</span>
                <span className="text-[18px] font-bold text-[#191c1d] font-mono block mt-0.5">
                  {w.totalIncidents}
                </span>
                <span className="text-[10px] text-[#727783] block">{w.avgSpeedKmh} km/h</span>
                <span className="text-[9px] font-bold text-[#004481] block mt-1 truncate" title={w.peakCongestionHour}>
                  {w.peakCongestionHour}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Diurnal Hourly Distribution Area Chart */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-[#c1c6d3] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1e3e4] pb-3">
            <div>
              <h3 className="text-[17px] font-bold text-[#191c1d]">
                Hourly Diurnal Incident Profile ({timeframe === '24h' ? '24 Hours' : timeframe === '7d' ? 'Past 7 Days' : timeframe === '30d' ? 'Past 30 Days' : `${startDate} to ${endDate}`})
              </h3>
              <p className="text-[12px] text-[#727783]">
                Cumulative breakdown of accidents, breakdowns, congestion, and roadworks by hour of day.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-[#414751] flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#d93025] rounded-xs inline-block"></span>
                Accidents
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#f29900] rounded-xs inline-block"></span>
                Breakdowns
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#1a73e8] rounded-xs inline-block"></span>
                Congestion
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#80868b] rounded-xs inline-block"></span>
                Roadworks
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d93025" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#d93025" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorBreakdowns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f29900" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f29900" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#727783' }} />
                <YAxis tick={{ fontSize: 11, fill: '#727783' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #c1c6d3',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="accidents"
                  stackId="1"
                  stroke="#d93025"
                  fill="url(#colorAccidents)"
                  name="Accidents"
                />
                <Area
                  type="monotone"
                  dataKey="breakdowns"
                  stackId="1"
                  stroke="#f29900"
                  fill="url(#colorBreakdowns)"
                  name="Breakdowns"
                />
                <Area
                  type="monotone"
                  dataKey="congestion"
                  stackId="1"
                  stroke="#1a73e8"
                  fill="url(#colorCongestion)"
                  name="Heavy Congestion"
                />
                <Area
                  type="monotone"
                  dataKey="roadworks"
                  stackId="1"
                  stroke="#80868b"
                  fill="#e0e0e0"
                  name="Roadworks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Expressway Velocity Curves */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-[#c1c6d3] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1e3e4] pb-3">
            <div>
              <h3 className="text-[17px] font-bold text-[#191c1d]">
                Expressway Speed Velocity Trajectories (km/h)
              </h3>
              <p className="text-[12px] text-[#727783]">
                Diurnal velocity profile across key Singapore expressway corridors.
              </p>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'PIE', 'AYE', 'CTE', 'KPE', 'ECP'].map((exp) => (
                <button
                  key={exp}
                  onClick={() => setActiveSpeedMetric(exp)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    activeSpeedMetric === exp
                      ? 'bg-[#004481] text-white'
                      : 'bg-[#edeeef] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.speedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#727783' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#727783' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #c1c6d3',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                {(activeSpeedMetric === 'ALL' || activeSpeedMetric === 'PIE') && (
                  <Line type="monotone" dataKey="PIE" stroke="#009645" strokeWidth={2.5} dot={false} name="PIE (km/h)" />
                )}
                {(activeSpeedMetric === 'ALL' || activeSpeedMetric === 'AYE') && (
                  <Line type="monotone" dataKey="AYE" stroke="#d42e12" strokeWidth={2.5} dot={false} name="AYE (km/h)" />
                )}
                {(activeSpeedMetric === 'ALL' || activeSpeedMetric === 'CTE') && (
                  <Line type="monotone" dataKey="CTE" stroke="#fa9e0d" strokeWidth={3} dot={false} name="CTE (km/h)" />
                )}
                {(activeSpeedMetric === 'ALL' || activeSpeedMetric === 'KPE') && (
                  <Line type="monotone" dataKey="KPE" stroke="#732282" strokeWidth={2} dot={false} name="KPE (km/h)" />
                )}
                {(activeSpeedMetric === 'ALL' || activeSpeedMetric === 'ECP') && (
                  <Line type="monotone" dataKey="ECP" stroke="#005ec4" strokeWidth={2} dot={false} name="ECP (km/h)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Grid: Corridor Travel Time Variance & SMRT/SBS Rail Reliability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Corridor Travel Time Reliability */}
          <div className="bg-white p-5 rounded-xl border border-[#c1c6d3] shadow-2xs space-y-3">
            <h3 className="text-[17px] font-bold text-[#191c1d] border-b border-[#e1e3e4] pb-2">
              Corridor Travel Time Reliability Index
            </h3>
            <div className="divide-y divide-[#edeeef]">
              {data.corridorReliability.map((corridor, idx) => (
                <div key={idx} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[13px] font-bold text-[#191c1d]">{corridor.corridor}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#727783] mt-0.5">
                        <span>Current: <strong>{corridor.currentTravelTimeMin}m</strong></span>
                        <span>•</span>
                        <span>Baseline: {corridor.baselineTravelTimeMin}m</span>
                        <span>•</span>
                        <span className={corridor.varianceMinutes > 10 ? 'text-red-600 font-bold' : 'text-emerald-600'}>
                          +{corridor.varianceMinutes}m variance
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        corridor.status === 'On Time'
                          ? 'bg-emerald-100 text-emerald-800'
                          : corridor.status === 'Moderate Delay'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {corridor.status}
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${
                        corridor.reliabilityScore >= 90
                          ? 'bg-emerald-500'
                          : corridor.reliabilityScore >= 80
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${corridor.reliabilityScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SMRT / SBS Transit Rail Reliability */}
          <div className="bg-white p-5 rounded-xl border border-[#c1c6d3] shadow-2xs space-y-3">
            <h3 className="text-[17px] font-bold text-[#191c1d] border-b border-[#e1e3e4] pb-2">
              MRT System Mean Kilometres Between Failures (MKBF)
            </h3>
            <div className="divide-y divide-[#edeeef]">
              {data.mrtReliability.map((mrt, idx) => (
                <div key={idx} className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded flex items-center justify-center text-white text-[11px] font-bold shadow-2xs ${
                        mrt.code === 'NS'
                          ? 'bg-[#d42e12]'
                          : mrt.code === 'EW'
                          ? 'bg-[#009645]'
                          : mrt.code === 'NE'
                          ? 'bg-[#732282]'
                          : mrt.code === 'CC'
                          ? 'bg-[#fa9e0d]'
                          : mrt.code === 'DT'
                          ? 'bg-[#005ec4]'
                          : 'bg-[#9D5B25]'
                      }`}
                    >
                      {mrt.code}
                    </span>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#191c1d] leading-tight">{mrt.line}</h4>
                      <span className="text-[11px] text-[#727783]">
                        MKBF: <strong>{mrt.mkbfKm.toLocaleString()}k km</strong> • Punctuality: {mrt.punctualityPct}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {mrt.morningPeakCrowdPct}% Peak Load
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4.5 Official LTA DataMall Mobility Datasets */}
        <MobilityDatasetsWidget />

        {/* 5. Top Bottlenecks Table */}
        <div className="bg-white p-5 rounded-xl border border-[#c1c6d3] shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-[17px] font-bold text-[#191c1d]">
              Top Historical Bottleneck Hotspots & Risk Sectors
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e1e3e4] text-[#727783] text-[11px] uppercase tracking-wider font-bold">
                  <th className="pb-2">Corridor Hotspot</th>
                  <th className="pb-2">Expressway</th>
                  <th className="pb-2">Incident Rate / Week</th>
                  <th className="pb-2">Avg Congestion Delay</th>
                  <th className="pb-2 text-right">Advisory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edeeef]">
                {data.topBottlenecks.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa]">
                    <td className="py-2.5 font-bold text-[#191c1d]">{item.location}</td>
                    <td className="py-2.5">
                      <span className="bg-[#004481] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {item.expressway}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[#414751]">{item.incidentFrequency} incidents/wk</td>
                    <td className="py-2.5 font-mono text-amber-700 font-bold">+{item.avgDelayMin} mins</td>
                    <td className="py-2.5 text-right">
                      <span className="bg-amber-100 text-amber-900 text-[11px] font-semibold px-2 py-0.5 rounded">
                        High Caution Zone
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
