import React, { useState } from 'react';
import { MRTLineStatus, ServiceAdvisory } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { LTAMRTSystemMap } from './LTAMRTSystemMap';
import { MRTCrowdDensityWidget } from './MRTCrowdDensityWidget';
import {
  Train,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Radio,
  Map as MapIcon,
  ShieldCheck
} from 'lucide-react';

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
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('LIVE SGT');
  const [selectedAdvisoryLine, setSelectedAdvisoryLine] = useState<string>('ALL');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setLastUpdated(`${time} SGT`);
      setIsRefreshing(false);
    }, 600);
  };

  const filteredAdvisories =
    selectedAdvisoryLine === 'ALL'
      ? advisories
      : advisories.filter((a) => a.lineCode === selectedAdvisoryLine);

  return (
    <div className="flex-1 md:mr-72 flex flex-col bg-[#f8f9fa] min-h-[calc(100vh-64px)] pb-20">
      {/* 1. Header Toolbar */}
      <div className="bg-white border-b border-[#e1e3e4] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#004481] text-white rounded-lg">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#191c1d] tracking-tight leading-none">
                {t('networkStatusTitle')}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[12px] font-mono text-[#414751]">
                  LTA TrainServiceAlerts • {lastUpdated}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Refresh */}
          <button
            id="btn-refresh-mrt-status"
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-[#004481] hover:bg-[#005baa] text-white border border-[#004481] rounded-lg shadow-xs transition-all text-[13px] font-semibold cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? t('updating') : t('refreshData')}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Canvas: Real MRT Network Map ALWAYS Displayed */}
      <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* LTA Official MRT Transit Map Component */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-[#004481]" />
              <h3 className="text-[15px] font-bold text-[#191c1d] uppercase tracking-wider">
                Singapore Rail Transit System Map (Interactive)
              </h3>
            </div>
            <span className="text-[12px] text-[#727783]">
              Always active • Click any station for timetables & crowd levels
            </span>
          </div>

          <LTAMRTSystemMap
            lines={lines}
            advisories={advisories}
            onSelectLine={onSelectLineDetails}
            heightClass="h-[540px] md:h-[620px]"
          />
        </section>

        {/* 3. Live MRT Lines Status Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-bold text-[#191c1d] tracking-tight">
              Line-by-Line Service Status
            </h3>
            <span className="text-[12px] text-[#727783]">
              Select a line to view station list & headway intervals
            </span>
          </div>

          <div
            id="mrt-lines-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {lines.map((line) => {
              const hasDelay = line.status === 'delay' || line.status === 'disrupted';

              return (
                <div
                  key={line.id}
                  id={`mrt-card-${line.id}`}
                  onClick={() => onSelectLineDetails(line)}
                  className={`bg-white border rounded-xl p-4 transition-all flex flex-col justify-between h-36 relative overflow-hidden mrt-card cursor-pointer group shadow-2xs hover:shadow-md ${
                    line.borderClass
                  } ${
                    hasDelay
                      ? 'border-[#ffc107] bg-amber-50/40 ring-1 ring-[#ffc107]/40'
                      : 'border-[#c1c6d3] hover:border-[#004481]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`${line.badgeBg} ${line.badgeText} text-[11px] font-bold px-2 py-0.5 rounded tracking-wider shadow-2xs`}
                      >
                        {line.code}
                      </span>
                      <h4 className="text-[16px] font-bold text-[#191c1d] group-hover:text-[#004481] transition-colors leading-tight">
                        {line.name}
                      </h4>
                    </div>

                    {hasDelay ? (
                      <span className="p-1 bg-amber-100 text-amber-800 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      </span>
                    ) : (
                      <span className="p-1 bg-emerald-50 text-emerald-700 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </span>
                    )}
                  </div>

                  <div>
                    {hasDelay ? (
                      <div>
                        <span className="text-[13px] text-amber-700 font-bold block">
                          {line.statusTitle}
                        </span>
                        <p className="text-[12px] text-[#414751] truncate mt-0.5">
                          {line.statusMessage || t('serviceDelay')}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-[#414751]">
                          {t('normalService')}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          2-3 min Headway
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3.5 Real-Time Platform Crowd Density Telemetry (PCDRealTime) */}
        <section id="mrt-crowd-density-section">
          <MRTCrowdDensityWidget />
        </section>

        {/* 4. Live Service Advisories from LTA DataMall */}
        <section
          id="service-advisories-card"
          className="bg-white border border-[#c1c6d3] rounded-xl p-5 shadow-2xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e1e3e4] pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ba1a1a]" />
              <h3 className="text-[17px] font-bold text-[#191c1d] tracking-tight">
                {t('recentAdvisories')}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'NE', 'EW', 'NS', 'CC', 'DT', 'TE'].map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedAdvisoryLine(code)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
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
                className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5 hover:bg-[#f8f9fa] transition-colors px-2 -mx-2 rounded-lg"
              >
                <div className="mt-0.5 shrink-0">
                  {advisory.iconType === 'campaign' ? (
                    <div className="p-1.5 bg-amber-100 rounded-md text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-blue-100 rounded-md text-blue-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`${advisory.lineColorBg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider`}
                    >
                      {advisory.lineCode}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-[#727783]">
                      {advisory.timeFormatted}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#191c1d] leading-relaxed">
                    {advisory.message}
                  </p>

                  {advisory.affectedStations && (
                    <div className="mt-2 text-[12px] text-[#004481] bg-[#d5e3ff]/30 px-2.5 py-1 rounded inline-block font-medium">
                      <strong>{t('sector')}:</strong> {advisory.affectedStations}
                    </div>
                  )}

                  {advisory.alternativeTransport && (
                    <div className="mt-1.5 text-[12px] text-[#5a3e00] bg-[#ffdeaa]/30 px-2.5 py-1 rounded font-medium">
                      <strong>{t('bridgingBus')}:</strong> {advisory.alternativeTransport}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
