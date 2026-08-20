import React, { useState, useEffect, useCallback } from 'react';
import {
  Bus,
  Search,
  RefreshCw,
  Clock,
  Users,
  Accessibility,
  Compass,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { BusStopItem, BusServiceArrivalInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

const POPULAR_BUS_STOPS: BusStopItem[] = [
  { busStopCode: '01012', roadName: 'Victoria St', description: 'Hotel Grand Pacific / Bugis', latitude: 1.2968, longitude: 103.8525 },
  { busStopCode: '09048', roadName: 'Orchard Rd', description: 'Orchard Plaza / Somerset', latitude: 1.3009, longitude: 103.8398 },
  { busStopCode: '09022', roadName: 'Orchard Rd', description: 'Orchard Stn / Lucky Plaza', latitude: 1.3043, longitude: 103.8338 },
  { busStopCode: '03211', roadName: 'Bayfront Ave', description: 'Marina Bay Sands Hotel', latitude: 1.2842, longitude: 103.8596 },
  { busStopCode: '03019', roadName: 'Collyer Quay', description: 'Ocean Financial Ctr / Raffles Pl', latitude: 1.2829, longitude: 103.8526 },
  { busStopCode: '28009', roadName: 'Jurong Gateway Rd', description: 'Jurong East Temp Interchange', latitude: 1.3331, longitude: 103.7423 },
  { busStopCode: '75009', roadName: 'Tampines Ave 4', description: 'Tampines Interchange', latitude: 1.3533, longitude: 103.9452 },
  { busStopCode: '46009', roadName: 'Woodlands Sq', description: 'Woodlands Temp Interchange', latitude: 1.4368, longitude: 103.7865 },
  { busStopCode: '95109', roadName: 'PTB3 Basement', description: 'Changi Airport PTB3', latitude: 1.3551, longitude: 103.9868 },
  { busStopCode: '05013', roadName: 'Eu Tong Sen St', description: 'Chinatown Point', latitude: 1.2848, longitude: 103.8446 },
];

export const BusArrivalView: React.FC = () => {
  const { t } = useLanguage();
  const [selectedStop, setSelectedStop] = useState<BusStopItem>(POPULAR_BUS_STOPS[0]);
  const [busArrivals, setBusArrivals] = useState<BusServiceArrivalInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<BusStopItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(30);
  const [serviceFilter, setServiceFilter] = useState<string>('');

  // Fetch real-time bus arrivals for a specific stop
  const fetchBusArrivals = useCallback(async (stopCode: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bus-arrival?BusStopCode=${encodeURIComponent(stopCode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.services)) {
          // Sort services alphanumerically (e.g., 2, 7, 12, 14, 174, 960)
          const sorted = [...data.services].sort((a, b) => {
            const numA = parseInt(a.serviceNo, 10);
            const numB = parseInt(b.serviceNo, 10);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return a.serviceNo.localeCompare(b.serviceNo);
          });
          setBusArrivals(sorted);
        } else {
          setBusArrivals([]);
        }
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
    } catch (err) {
      console.error('Error fetching bus arrivals:', err);
    } finally {
      setIsLoading(false);
      setAutoRefreshSecs(30);
    }
  }, []);

  // Initial fetch and stop change
  useEffect(() => {
    fetchBusArrivals(selectedStop.busStopCode);
  }, [selectedStop, fetchBusArrivals]);

  // Auto-refresh countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshSecs((prev) => {
        if (prev <= 1) {
          fetchBusArrivals(selectedStop.busStopCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedStop, fetchBusArrivals]);

  // Debounced search for bus stops from LTA DataMall
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/bus-stops?search=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.value || []);
        }
      } catch (e) {
        console.error('Error searching bus stops:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredArrivals = busArrivals.filter((svc) =>
    serviceFilter ? svc.serviceNo.toUpperCase().includes(serviceFilter.toUpperCase()) : true
  );

  const getLoadBadge = (load?: string) => {
    switch (load) {
      case 'SEA':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          text: 'Seats Available',
          dot: 'bg-emerald-500',
        };
      case 'SDA':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          text: 'Standing Available',
          dot: 'bg-amber-500',
        };
      case 'LSD':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          text: 'Limited Standing',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          text: 'Normal',
          dot: 'bg-gray-400',
        };
    }
  };

  const getOperatorColor = (op?: string) => {
    switch (op) {
      case 'SBST':
        return 'bg-[#702082] text-white'; // SBS Transit Purple
      case 'SMRT':
        return 'bg-[#d02027] text-white'; // SMRT Red
      case 'TTS':
        return 'bg-[#008080] text-white'; // Tower Transit Teal
      case 'GAS':
        return 'bg-[#98d400] text-gray-900'; // Go-Ahead Lime
      default:
        return 'bg-[#004481] text-white';
    }
  };

  return (
    <div id="bus-arrival-view" className="flex-1 bg-[#f8f9fa] p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-[#c1c6d3] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#004481] flex items-center justify-center text-white shadow-xs shrink-0">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] md:text-[22px] font-bold text-[#004481] tracking-tight">
                Live Bus Arrivals & Stop Telemetry
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                v3/BusArrival Live
              </span>
            </div>
            <p className="text-[13px] text-[#414751] mt-0.5">
              Official real-time countdowns, bus occupancy loads, and accessibility telemetry from LTA DataMall
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => fetchBusArrivals(selectedStop.busStopCode)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg bg-[#005baa] hover:bg-[#004481] text-white text-[13px] font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh arrivals"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
          <div className="text-right px-3 py-1.5 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[11px] text-[#414751]">
            <div className="font-bold text-[#191c1d]">{lastUpdated || 'Polling...'}</div>
            <div className="text-[10px] text-[#727783]">Auto-refresh: {autoRefreshSecs}s</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Stop Selector & Search on Left, Live Services on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bus Stop Search & Popular Stops (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Search Box */}
          <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 shadow-xs">
            <h2 className="text-[14px] font-bold text-[#004481] mb-2 flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              <span>Search Bus Stop / Code</span>
            </h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stop name, road, or code (e.g. 01012, Orchard)..."
                className="w-full pl-9 pr-8 py-2 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[13px] text-[#191c1d] placeholder-[#727783] focus:outline-none focus:ring-2 focus:ring-[#004481] focus:bg-white"
              />
              <Search className="w-4 h-4 text-[#727783] absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[#727783] hover:text-[#191c1d] font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-[#c1c6d3] rounded-lg divide-y divide-gray-100 bg-white shadow-md">
                {searchResults.map((bs) => (
                  <button
                    key={bs.busStopCode}
                    onClick={() => {
                      setSelectedStop(bs);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-[13px] font-bold text-[#191c1d] group-hover:text-[#005baa]">
                        {bs.description}
                      </div>
                      <div className="text-[11px] text-[#727783]">{bs.roadName}</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-gray-100 group-hover:bg-blue-100 text-gray-700 rounded">
                      {bs.busStopCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preset / Popular Transit Hubs */}
          <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 shadow-xs flex-1">
            <h2 className="text-[14px] font-bold text-[#004481] mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Major Transit Hubs</span>
            </h2>
            <div className="flex flex-col gap-1.5">
              {POPULAR_BUS_STOPS.map((stop) => {
                const isSelected = selectedStop.busStopCode === stop.busStopCode;
                return (
                  <button
                    key={stop.busStopCode}
                    onClick={() => setSelectedStop(stop)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#005baa] text-white border-[#005baa] shadow-xs'
                        : 'bg-[#fcfdfe] hover:bg-[#f3f4f5] text-[#191c1d] border-[#e1e3e4]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold">{stop.description}</span>
                      <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[#727783]'}`}>
                        {stop.roadName}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {stop.busStopCode}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Arriving Bus Services (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Active Stop Card */}
          <div className="bg-white rounded-xl border border-[#c1c6d3] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#004481] text-white tracking-wider">
                  BUS STOP {selectedStop.busStopCode}
                </span>
                <span className="text-[12px] text-[#727783] font-medium">• {selectedStop.roadName}</span>
              </div>
              <h2 className="text-[18px] md:text-[20px] font-black text-[#191c1d] mt-1">
                {selectedStop.description}
              </h2>
            </div>

            {/* Filter by Service Number */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter service (e.g. 14)..."
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[12px] text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#004481] w-40"
              />
              {serviceFilter && (
                <button
                  onClick={() => setServiceFilter('')}
                  className="text-[11px] text-[#727783] hover:text-[#191c1d] font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Services List */}
          {isLoading && busArrivals.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#c1c6d3] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <RefreshCw className="w-8 h-8 text-[#005baa] animate-spin" />
              <div className="text-[15px] font-bold text-[#191c1d]">Fetching real-time bus telemetry...</div>
              <div className="text-[12px] text-[#727783]">Connecting to LTA DataMall v3/BusArrival</div>
            </div>
          ) : filteredArrivals.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#c1c6d3] p-10 text-center flex flex-col items-center justify-center gap-2 shadow-xs">
              <Info className="w-8 h-8 text-[#727783]" />
              <div className="text-[15px] font-bold text-[#191c1d]">No active bus services reported right now</div>
              <div className="text-[12px] text-[#727783]">Services might be operating off-schedule or stop code has no incoming routes.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredArrivals.map((svc) => {
                const next1 = svc.nextBus;
                const next2 = svc.nextBus2;
                const next3 = svc.nextBus3;

                const load1 = getLoadBadge(next1?.load);
                const load2 = getLoadBadge(next2?.load);

                const isArrNow = next1 && next1.minutesUntilArrival <= 0;

                return (
                  <div
                    key={svc.serviceNo}
                    className="bg-white rounded-xl border border-[#c1c6d3] p-4 md:p-5 shadow-xs hover:border-[#005baa]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Service No & Operator */}
                    <div className="flex items-center gap-3.5 shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gray-900 text-white flex flex-col items-center justify-center font-black shadow-xs">
                        <span className="text-[20px] leading-none">{svc.serviceNo}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${getOperatorColor(svc.operator)}`}>
                          {svc.operator || 'LTA'}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Primary Arriving Bus ETA Card */}
                    <div className="flex-1 flex flex-wrap items-center gap-3">
                      {next1 ? (
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 flex-1 min-w-[200px]">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-[#727783] tracking-wider">Next Bus</span>
                            <div className="flex items-baseline gap-1.5">
                              <span
                                className={`text-[22px] font-black leading-none ${
                                  isArrNow ? 'text-emerald-600 animate-pulse' : 'text-[#004481]'
                                }`}
                              >
                                {isArrNow ? 'ARR' : `${next1.minutesUntilArrival}m`}
                              </span>
                              {!isArrNow && <span className="text-[11px] text-[#727783]">mins</span>}
                            </div>
                          </div>

                          {/* Load & Vehicle Badges */}
                          <div className="flex flex-col gap-1 ml-auto">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${load1.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${load1.dot}`}></span>
                              <span>{load1.text}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-[#414751]">
                              {next1.type === 'DD' && (
                                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 font-bold rounded">
                                  Double Deck
                                </span>
                              )}
                              {next1.type === 'BD' && (
                                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 font-bold rounded">
                                  Bendy
                                </span>
                              )}
                              {next1.feature === 'WAB' && (
                                <span className="inline-flex items-center text-blue-600 font-medium" title="Wheelchair Accessible Bus">
                                  ♿ WAB
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[12px] text-[#727783] italic">No live tracking available</div>
                      )}

                      {/* Subsequent Buses: Next 2 & Next 3 */}
                      <div className="flex items-center gap-2">
                        {next2 && (
                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center min-w-[75px]">
                            <span className="text-[9px] uppercase font-bold text-[#727783] block">2nd Bus</span>
                            <span className="text-[14px] font-black text-[#191c1d]">
                              {next2.minutesUntilArrival <= 0 ? 'ARR' : `${next2.minutesUntilArrival}m`}
                            </span>
                            <div className="text-[9px] text-[#727783] mt-0.5">
                              {next2.type === 'DD' ? '2-Deck' : 'Single'}
                            </div>
                          </div>
                        )}

                        {next3 && (
                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center min-w-[75px]">
                            <span className="text-[9px] uppercase font-bold text-[#727783] block">3rd Bus</span>
                            <span className="text-[14px] font-black text-[#191c1d]">
                              {next3.minutesUntilArrival <= 0 ? 'ARR' : `${next3.minutesUntilArrival}m`}
                            </span>
                            <div className="text-[9px] text-[#727783] mt-0.5">
                              {next3.type === 'DD' ? '2-Deck' : 'Single'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Occupancy & Feature Legend Footer */}
          <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 text-[12px] text-[#414751] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-[#004481]">Occupancy Levels:</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Seats Available
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Standing Available
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Limited Standing
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#727783]">
              <span>♿ WAB = Wheelchair Accessible</span>
              <span>•</span>
              <span>Double Deck = High Capacity 2-Tier Bus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
