import React, { useState } from 'react';
import { MRTLineStatus, ServiceAdvisory } from '../types';

interface MRTStatusViewProps {
  lines: MRTLineStatus[];
  advisories: ServiceAdvisory[];
  onOpenNetworkMap: () => void;
  onSelectLineDetails: (line: MRTLineStatus) => void;
}

export const MRTStatusView: React.FC<MRTStatusViewProps> = ({
  lines,
  advisories,
  onOpenNetworkMap,
  onSelectLineDetails,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('14 OCT 2023, 14:32 SGT');
  const [selectedAdvisoryLine, setSelectedAdvisoryLine] = useState<string>('ALL');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const day = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase();
      const time = now.toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setLastUpdated(`${day}, ${time} SGT`);
      setIsRefreshing(false);
    }, 600);
  };

  const filteredAdvisories =
    selectedAdvisoryLine === 'ALL'
      ? advisories
      : advisories.filter((a) => a.lineCode === selectedAdvisoryLine);

  return (
    <div className="flex-1 md:ml-72 flex flex-col bg-[#f8f9fa] min-h-[calc(100vh-64px)] pb-24 md:pb-28">
      {/* Main Canvas Area */}
      <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
        {/* Header Section matching mockup */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-bold text-[#191c1d] tracking-tight mb-2">
              Network Status
            </h2>
            <div className="flex items-center gap-2 text-[#414751]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] pulse-dot inline-block shrink-0" />
              <span className="text-[12px] font-semibold tracking-wider uppercase font-mono">
                LIVE UPDATE: {lastUpdated}
              </span>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            {/* Network Map Modal Trigger */}
            <button
              id="btn-network-map-modal"
              onClick={onOpenNetworkMap}
              className="flex items-center gap-2 px-4 py-2 bg-[#e7e8e9] hover:bg-[#e1e3e4] border border-[#c1c6d3] rounded-lg transition-colors text-[14px] font-medium font-mono text-[#191c1d] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              <span>Network Map</span>
            </button>

            {/* Refresh Button */}
            <button
              id="btn-refresh-mrt-status"
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-[#004481] hover:bg-[#005baa] text-white border border-[#004481] rounded-lg shadow-xs transition-all text-[14px] font-medium font-mono cursor-pointer active:scale-95"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Grid of Cards (6 MRT Lines) matching mockup */}
        <div
          id="mrt-lines-grid"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12"
        >
          {lines.map((line) => {
            const hasDelay = line.status === 'delay' || line.status === 'disrupted';

            return (
              <div
                key={line.id}
                id={`mrt-card-${line.id}`}
                onClick={() => onSelectLineDetails(line)}
                className={`bg-white border rounded-xl p-5 transition-all flex flex-col justify-between h-40 relative overflow-hidden mrt-card cursor-pointer group ${
                  line.borderClass
                } ${
                  hasDelay
                    ? 'border-[#ffc107] shadow-[0_4px_12px_rgba(255,193,7,0.15)] ring-1 ring-[#ffc107]/30'
                    : 'border-[#c1c6d3] shadow-xs hover:shadow-md hover:border-[#727783]'
                }`}
              >
                {/* Card Top: Line Code Badge & Line Name & Status Icon */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`${line.badgeBg} ${line.badgeText} text-[12px] font-bold px-2 py-1 rounded-xs tracking-wider`}
                    >
                      {line.code}
                    </span>
                    <h3 className="text-[20px] font-semibold text-[#191c1d] tracking-tight group-hover:text-[#004481] transition-colors">
                      {line.name}
                    </h3>
                  </div>

                  {hasDelay ? (
                    <span
                      className="material-symbols-outlined text-[#ffc107] text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      warning
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[#727783] text-[22px]">
                      check_circle
                    </span>
                  )}
                </div>

                {/* Card Bottom: Service Status Text */}
                <div>
                  {hasDelay ? (
                    <>
                      <p className="text-[16px] text-[#ffc107] font-bold">
                        {line.statusTitle}
                      </p>
                      <p className="text-[14px] text-[#414751] mt-1 font-normal line-clamp-1">
                        {line.statusMessage || 'Service delayed'}
                      </p>
                    </>
                  ) : (
                    <p className="text-[16px] font-normal text-[#414751]">
                      {line.statusTitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Service Advisories Section matching mockup */}
        <div
          id="service-advisories-card"
          className="bg-white border border-[#c1c6d3] rounded-xl p-6 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#c1c6d3] pb-4 mb-4 gap-2">
            <h3 className="text-[20px] font-semibold text-[#191c1d] tracking-tight">
              Recent Service Advisories
            </h3>
            {/* Optional Line Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'NE', 'EW', 'NS', 'CC'].map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedAdvisoryLine(code)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedAdvisoryLine === code
                      ? 'bg-[#004481] text-white'
                      : 'bg-[#edeeef] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col divide-y divide-[#edeeef]">
            {filteredAdvisories.map((advisory) => (
              <div
                key={advisory.id}
                id={`advisory-item-${advisory.id}`}
                className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 hover:bg-[#f3f4f5] transition-colors px-2 -mx-2 rounded-lg"
              >
                {/* Advisory Icon */}
                <div className="mt-0.5 shrink-0">
                  {advisory.iconType === 'campaign' ? (
                    <span
                      className="material-symbols-outlined text-[#ffc107] text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      campaign
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[#727783] text-[22px]">
                      info
                    </span>
                  )}
                </div>

                {/* Advisory Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`${advisory.lineColorBg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider`}
                    >
                      {advisory.lineCode}
                    </span>
                    <span className="text-[12px] font-mono font-medium text-[#727783]">
                      {advisory.timeFormatted}
                    </span>
                  </div>

                  <p className="text-[14px] text-[#414751] leading-relaxed">
                    {advisory.message}
                  </p>

                  {advisory.affectedStations && (
                    <div className="mt-2 text-[12px] text-[#004481] bg-[#d5e3ff]/30 px-2.5 py-1 rounded inline-block">
                      <strong>Sector:</strong> {advisory.affectedStations}
                    </div>
                  )}

                  {advisory.alternativeTransport && (
                    <div className="mt-1.5 text-[12px] text-[#5a3e00] bg-[#ffdeaa]/30 px-2.5 py-1 rounded">
                      <strong>Bridging Bus:</strong> {advisory.alternativeTransport}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
