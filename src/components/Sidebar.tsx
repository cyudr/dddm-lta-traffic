import React from 'react';
import { ViewMode } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { AlertTriangle, Train, TrendingUp, Compass, Bus, Car } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  incidentCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  incidentCount,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Right-Hand Side Control Center Navigation Sidebar */}
      <aside
        id="control-center-sidebar"
        className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-72 bg-[#edeeef] flex flex-col justify-between p-4 z-40 border-l border-[#c1c6d3] shadow-lg transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-2 mb-3 border-b border-[#c1c6d3]/60">
            <h2 className="text-[19px] font-bold text-[#004481] leading-tight">
              {t('controlCenter')}
            </h2>
            <p className="text-[11px] font-semibold text-[#414751] uppercase tracking-wider mt-0.5">
              {t('liveIngestion')}
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {/* 1. Traffic Incidents Nav Button */}
            <button
              id="nav-btn-traffic-incidents"
              onClick={() => {
                onSelectView('traffic');
                onCloseMobile();
              }}
              className={`w-full text-left rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentView === 'traffic'
                  ? 'bg-[#005baa] text-white shadow-sm font-bold'
                  : 'text-[#414751] hover:bg-[#e1e3e4] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-[13px]">{t('trafficIncidents')}</span>
              </div>
              {incidentCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                    currentView === 'traffic'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e51d24] text-white'
                  }`}
                >
                  {incidentCount}
                </span>
              )}
            </button>

            {/* 2. Bus Arrivals & Stops Nav Button (NEW) */}
            <button
              id="nav-btn-bus-arrivals"
              onClick={() => {
                onSelectView('bus');
                onCloseMobile();
              }}
              className={`w-full text-left rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentView === 'bus'
                  ? 'bg-[#005baa] text-white shadow-sm font-bold'
                  : 'text-[#414751] hover:bg-[#e1e3e4] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bus className="w-4 h-4 shrink-0" />
                <span className="text-[13px]">Bus Arrivals & Stops</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                  currentView === 'bus'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                v3 Live
              </span>
            </button>

            {/* 3. MRT/LRT Status & Crowds Nav Button */}
            <button
              id="nav-btn-mrt-status"
              onClick={() => {
                onSelectView('mrt');
                onCloseMobile();
              }}
              className={`w-full text-left rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentView === 'mrt'
                  ? 'bg-[#005baa] text-white shadow-sm font-bold'
                  : 'text-[#414751] hover:bg-[#e1e3e4] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Train className="w-4 h-4 shrink-0" />
                <span className="text-[13px]">MRT Status & Crowds</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                  currentView === 'mrt'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                PCD Live
              </span>
            </button>

            {/* 4. Taxis & Parking Nav Button (NEW) */}
            <button
              id="nav-btn-taxis-parking"
              onClick={() => {
                onSelectView('taxis-parking');
                onCloseMobile();
              }}
              className={`w-full text-left rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentView === 'taxis-parking'
                  ? 'bg-[#005baa] text-white shadow-sm font-bold'
                  : 'text-[#414751] hover:bg-[#e1e3e4] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 shrink-0" />
                <span className="text-[13px]">Taxis & Parking</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                  currentView === 'taxis-parking'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                Lots & Stands
              </span>
            </button>

            {/* 5. JB / SG Customs & Checkpoints Nav Button */}
            <button
              id="nav-btn-customs-checkpoints"
              onClick={() => {
                onSelectView('customs');
                onCloseMobile();
              }}
              className={`w-full text-left rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentView === 'customs'
                  ? 'bg-[#005baa] text-white shadow-sm font-bold'
                  : 'text-[#414751] hover:bg-[#e1e3e4] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 shrink-0" />
                <span className="text-[13px]">JB / SG Customs</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                  currentView === 'customs'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#004481]/10 text-[#004481]'
                }`}
              >
                Woodlands/Tuas
              </span>
            </button>

            {/* 6. Historical Trends & Analytics Nav Button */}
            <button
              id="nav-btn-historical-trends"
              onClick={() => {
                onSelectView('trends');
                onCloseMobile();
              }}
              className={`w-full text-left rounded-lg px-3.5 py-2.5 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentView === 'trends'
                  ? 'bg-[#005baa] text-white shadow-sm font-bold'
                  : 'text-[#414751] hover:bg-[#e1e3e4] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="text-[13px]">Historical & Open Data</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                  currentView === 'trends'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                Archives
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Control Center Live Status Card */}
        <div className="pt-3 border-t border-[#c1c6d3]/60">
          <div
            id="sidebar-live-status-indicator"
            className="flex items-center gap-2.5 mb-2 bg-[#ffffff] rounded-lg p-2.5 border border-[#c1c6d3] shadow-xs"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#e51d24] pulse-dot shrink-0" />
            <span className="text-[11px] font-bold tracking-wider text-[#e51d24]">
              {t('liveUpdate')}: ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#727783] px-1">
            <span>16+ Data Feeds Active</span>
            <span className="font-mono">LTA DataMall v2</span>
          </div>
        </div>
      </aside>
    </>
  );
};

