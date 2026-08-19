import React from 'react';
import { ViewMode } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

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
          <div className="p-2 mb-4 border-b border-[#c1c6d3]/60">
            <h2 className="text-[20px] font-bold text-[#004481] leading-7">
              {t('controlCenter')}
            </h2>
            <p className="text-[12px] font-semibold text-[#414751] uppercase tracking-wider mt-0.5">
              {t('liveIngestion')}
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {/* Traffic Incidents Nav Button */}
            <button
              id="nav-btn-traffic-incidents"
              onClick={() => {
                onSelectView('traffic');
                onCloseMobile();
              }}
              className={`w-full text-left rounded-lg px-4 py-3 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentView === 'traffic'
                  ? 'bg-[#005baa] text-white shadow-sm font-bold'
                  : 'text-[#414751] hover:bg-[#e1e3e4] font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings:
                      currentView === 'traffic' ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  warning
                </span>
                <span className="text-[14px]">{t('trafficIncidents')}</span>
              </div>
              {incidentCount > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    currentView === 'traffic'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e51d24] text-white'
                  }`}
                >
                  {incidentCount}
                </span>
              )}
            </button>

            {/* MRT/LRT Status Nav Button */}
            <button
              id="nav-btn-mrt-status"
              onClick={() => {
                onSelectView('mrt');
                onCloseMobile();
              }}
              className={`w-full text-left rounded-lg px-4 py-3 flex items-center justify-between transition-all duration-150 cursor-pointer ${
                currentView === 'mrt'
                  ? 'bg-[#005baa] text-white shadow-sm font-bold'
                  : 'text-[#414751] hover:bg-[#e1e3e4] font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings:
                      currentView === 'mrt' ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  subway
                </span>
                <span className="text-[14px]">{t('mrtStatus')}</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  currentView === 'mrt'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#ffc107] text-[#191c1d]'
                }`}
              >
                1 Alert
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Control Center Live Status Card */}
        <div className="pt-4 border-t border-[#c1c6d3]/60">
          <div
            id="sidebar-live-status-indicator"
            className="flex items-center gap-2.5 mb-2 bg-[#ffffff] rounded p-3 border border-[#c1c6d3] shadow-xs"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#e51d24] pulse-dot shrink-0" />
            <span className="text-[12px] font-bold tracking-wider text-[#e51d24]">
              {t('liveUpdate')}: ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#727783] px-1">
            <span>Data Stream: 24ms ping</span>
            <span className="font-mono">LTA v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
