import React, { useState, useEffect } from 'react';
import { Shovel, HardHat, Search, RefreshCw, Calendar, Building2, Phone, Info } from 'lucide-react';
import { RoadOpeningItem } from '../types';

export const RoadOpeningsWidget: React.FC = () => {
  const [openings, setOpenings] = useState<RoadOpeningItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchRoad, setSearchRoad] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const fetchRoadOpenings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/road-openings');
      if (res.ok) {
        const data = await res.json();
        setOpenings(data.value || []);
      }
    } catch (e) {
      console.error('Error fetching road openings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadOpenings();
  }, []);

  const departments = ['ALL', 'PUB', 'SP POWERGRID', 'SINGTEL', 'LTA', 'PRIVATE'];

  const filteredOpenings = openings.filter((item) => {
    const matchesSearch =
      searchRoad.trim() === '' ||
      item.roadName.toLowerCase().includes(searchRoad.toLowerCase()) ||
      item.eventId.toLowerCase().includes(searchRoad.toLowerCase());
    const matchesDept =
      selectedDept === 'ALL' || item.svcDept.toUpperCase().includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="bg-white rounded-xl border border-[#c1c6d3] p-5 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-[#191c1d]">
                Active Road Openings & Utility Trenching Works
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                RoadOpenings
              </span>
            </div>
            <p className="text-[12px] text-[#727783] mt-0.5">
              Live utility excavation, cable laying, and water pipe replacement permits across Singapore
            </p>
          </div>
        </div>

        <button
          onClick={fetchRoadOpenings}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Notices</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search road name or Event ID (e.g. Orchard, Tampines)..."
            value={searchRoad}
            onChange={(e) => setSearchRoad(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[12px] text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#004481]"
          />
          <Search className="w-3.5 h-3.5 text-[#727783] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedDept === dept
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-[#f3f4f5] text-[#414751] hover:bg-[#e1e3e4]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Grid */}
      {isLoading && openings.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 text-orange-600 animate-spin" />
          <span className="text-[13px] text-[#727783]">Loading road openings...</span>
        </div>
      ) : filteredOpenings.length === 0 ? (
        <div className="p-6 text-center text-[13px] text-[#727783]">
          No active road opening notices matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredOpenings.slice(0, 30).map((op) => (
            <div
              key={op.eventId}
              className="bg-[#fcfdfe] border border-[#e1e3e4] hover:border-orange-300 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                    {op.svcDept}
                  </span>
                  <span className="text-[10px] font-mono text-[#727783]">#{op.eventId}</span>
                </div>
                <h4 className="text-[13px] font-bold text-[#191c1d] leading-snug line-clamp-2">
                  {op.roadName}
                </h4>
              </div>

              <div className="pt-2 border-t border-gray-100 flex flex-col gap-1 text-[11px] text-[#414751]">
                <div className="flex items-center gap-1.5 text-[#727783]">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {op.startDate} ➔ {op.endDate}
                  </span>
                </div>
                {op.other && (
                  <div className="text-[10px] text-[#727783] truncate" title={op.other}>
                    {op.other}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
