import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Layers, ShieldCheck, Activity, Search, Info } from 'lucide-react';
import { StationCrowdDensity, MRTCrowdLevel } from '../types';

const MRT_LINES = [
  { id: 'ALL', name: 'All Lines', color: '#004481', bg: 'bg-[#004481]' },
  { id: 'NSL', name: 'North-South Line', color: '#d42e12', bg: 'bg-[#d42e12]' },
  { id: 'EWL', name: 'East-West Line', color: '#009645', bg: 'bg-[#009645]' },
  { id: 'NEL', name: 'North East Line', color: '#8f4199', bg: 'bg-[#8f4199]' },
  { id: 'CCL', name: 'Circle Line', color: '#fa9e0d', bg: 'bg-[#fa9e0d]' },
  { id: 'DTL', name: 'Downtown Line', color: '#005ec4', bg: 'bg-[#005ec4]' },
  { id: 'TEL', name: 'Thomson-East Coast Line', color: '#9d5b25', bg: 'bg-[#9d5b25]' },
];

export const MRTCrowdDensityWidget: React.FC = () => {
  const [selectedLine, setSelectedLine] = useState<string>('ALL');
  const [crowdData, setCrowdData] = useState<StationCrowdDensity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchStation, setSearchStation] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchCrowdDensity = async (line: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/crowd-density?line=${encodeURIComponent(line)}`);
      if (res.ok) {
        const data = await res.json();
        setCrowdData(data.value || []);
      }
      setLastUpdated(
        new Date().toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' SGT'
      );
    } catch (e) {
      console.error('Error fetching crowd density:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrowdDensity(selectedLine);
    const timer = setInterval(() => fetchCrowdDensity(selectedLine), 60000); // 60s auto refresh
    return () => clearInterval(timer);
  }, [selectedLine]);

  const filteredStations = crowdData.filter((item) => {
    const query = searchStation.toLowerCase().trim();
    if (!query) return true;
    return (
      item.station.toLowerCase().includes(query) ||
      (item.stationName && item.stationName.toLowerCase().includes(query))
    );
  });

  const getCrowdBadge = (level: MRTCrowdLevel) => {
    switch (level) {
      case 'l':
        return {
          label: 'Low Crowd',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          score: 25,
        };
      case 'm':
        return {
          label: 'Moderate Crowd',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          score: 60,
        };
      case 'h':
        return {
          label: 'High Crowd',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          score: 95,
        };
      default:
        return {
          label: 'Normal',
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          dot: 'bg-gray-400',
          score: 30,
        };
    }
  };

  // Crowd Statistics Calculation
  const totalCount = filteredStations.length;
  const lowCount = filteredStations.filter((s) => s.crowdLevel === 'l').length;
  const modCount = filteredStations.filter((s) => s.crowdLevel === 'm').length;
  const highCount = filteredStations.filter((s) => s.crowdLevel === 'h').length;

  return (
    <div className="bg-white rounded-xl border border-[#c1c6d3] p-5 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-[#191c1d]">
                Real-Time MRT Platform Crowd Density (PCD)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                PCDRealTime
              </span>
            </div>
            <p className="text-[12px] text-[#727783] mt-0.5">
              Live 10-minute interval platform passenger crowd levels directly from LTA DataMall
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => fetchCrowdDensity(selectedLine)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
          <span className="text-[11px] text-[#727783] font-medium bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
            {lastUpdated || 'Polling...'}
          </span>
        </div>
      </div>

      {/* Line Filter Pills & Station Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {MRT_LINES.map((line) => {
            const isSelected = selectedLine === line.id;
            return (
              <button
                key={line.id}
                onClick={() => setSelectedLine(line.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#004481] text-white shadow-xs'
                    : 'bg-[#f3f4f5] text-[#414751] hover:bg-[#e1e3e4]'
                }`}
              >
                {line.id !== 'ALL' && (
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: line.color }}
                  ></span>
                )}
                <span>{line.name}</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Filter station name or code..."
            value={searchStation}
            onChange={(e) => setSearchStation(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[12px] text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#004481]"
          />
          <Search className="w-3.5 h-3.5 text-[#727783] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Aggregate Density Meter */}
      {totalCount > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold text-[#191c1d]">Network Distribution:</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {lowCount} Low ({Math.round((lowCount / totalCount) * 100)}%)
              </span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {modCount} Moderate ({Math.round((modCount / totalCount) * 100)}%)
              </span>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                {highCount} High ({Math.round((highCount / totalCount) * 100)}%)
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-xs h-2 rounded-full overflow-hidden flex bg-gray-200">
            <div style={{ width: `${(lowCount / totalCount) * 100}%` }} className="bg-emerald-500 h-full"></div>
            <div style={{ width: `${(modCount / totalCount) * 100}%` }} className="bg-amber-500 h-full"></div>
            <div style={{ width: `${(highCount / totalCount) * 100}%` }} className="bg-rose-500 h-full"></div>
          </div>
        </div>
      )}

      {/* Station Cards Grid */}
      {isLoading && crowdData.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
          <span className="text-[13px] text-[#727783]">Loading station crowd levels...</span>
        </div>
      ) : filteredStations.length === 0 ? (
        <div className="p-8 text-center text-[13px] text-[#727783]">
          No stations matching "{searchStation}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredStations.map((st) => {
            const badge = getCrowdBadge(st.crowdLevel);
            const lineObj = MRT_LINES.find((l) => l.id === st.line);
            const lineColor = lineObj?.color || '#004481';

            return (
              <div
                key={`${st.line}-${st.station}`}
                className="bg-white border border-[#e1e3e4] hover:border-[#c1c6d3] rounded-xl p-3 flex flex-col justify-between gap-2 shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-mono font-black text-white"
                      style={{ backgroundColor: lineColor }}
                    >
                      {st.station}
                    </span>
                    <span className="text-[13px] font-bold text-[#191c1d] truncate max-w-[130px]" title={st.stationName}>
                      {st.stationName || st.station}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                    {badge.label}
                  </span>

                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        st.crowdLevel === 'h'
                          ? 'bg-rose-500'
                          : st.crowdLevel === 'm'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${badge.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
