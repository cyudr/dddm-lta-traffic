import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  Clock,
  Globe,
  Menu,
  Activity,
  RefreshCw,
  Database,
  Radio,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { useLanguage, LANGUAGES, LanguageCode } from '../i18n/LanguageContext';

interface TopNavbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenClockModal: () => void;
  onOpenDataMallModal: () => void;
  onToggleMobileMenu: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  lastRefreshedTime?: string;
  apiStatus?: 'live' | 'syncing' | 'fallback' | 'idle';
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenClockModal,
  onOpenDataMallModal,
  onToggleMobileMenu,
  onRefreshData,
  isRefreshing = false,
  lastRefreshedTime,
  apiStatus = 'live',
}) => {
  const { t, language, setLanguage, currentLanguageOption } = useLanguage();
  const [sgtTime, setSgtTime] = useState<string>('');
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState<number>(60);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setSgtTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilNextRefresh((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualRefresh = () => {
    setSecondsUntilNextRefresh(60);
    if (onRefreshData) {
      onRefreshData();
    }
  };

  return (
    <header
      id="top-navbar"
      className="bg-white border-b border-[#c1c6d3] fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-6 flex items-center justify-between shadow-xs transition-colors"
    >
      {/* Left: Brand Identity & Data Source Badge */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-lg text-[#004481] hover:bg-[#f3f4f5] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#004481] flex items-center justify-center text-white shadow-xs">
            <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] md:text-[19px] font-black tracking-tight text-[#004481] leading-none">
                {t('appTitle')}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#004481]/10 text-[#004481] tracking-wide uppercase border border-[#004481]/20">
                Official
              </span>
            </div>
            <p className="text-[10px] text-[#727783] hidden sm:block leading-tight font-medium mt-0.5">
              {t('dataSourceLta')} • Land Transport Authority
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Road & Expressway Global Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#727783] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[13px] text-[#191c1d] placeholder-[#727783] focus:outline-none focus:ring-2 focus:ring-[#004481] focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#727783] hover:text-[#191c1d] font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Language Selector, API Status, Refresh Button, SGT Clock */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* 1. Language Selector Dropdown (English, Chinese, Malay, Japanese, Korean, Tamil) */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="language-selector-btn"
            onClick={() => setIsLangDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#c1c6d3] hover:border-[#004481] bg-[#f8f9fa] hover:bg-white text-[12px] font-semibold text-[#191c1d] transition-all cursor-pointer shadow-2xs"
            title={t('language')}
          >
            <Globe className="w-3.5 h-3.5 text-[#004481]" />
            <span className="hidden sm:inline">{currentLanguageOption.nativeName}</span>
            <span className="sm:hidden uppercase">{currentLanguageOption.code}</span>
            <ChevronDown className="w-3 h-3 text-[#727783]" />
          </button>

          {isLangDropdownOpen && (
            <div
              id="language-dropdown-menu"
              className="absolute right-0 mt-1.5 w-48 bg-white border border-[#c1c6d3] rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#727783] border-b border-[#edeeef]">
                {t('language')} / Select Language
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                    language === lang.code
                      ? 'bg-[#d5e3ff]/40 text-[#004481] font-bold'
                      : 'text-[#191c1d] hover:bg-[#f3f4f5]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {language === lang.code && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#004481]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Real-time API Connection Status Pill */}
        <button
          id="api-connection-status-btn"
          onClick={onOpenDataMallModal}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#c1c6d3] hover:border-[#004481] bg-[#f8f9fa] hover:bg-white text-[12px] font-medium text-[#191c1d] transition-all cursor-pointer shadow-2xs group"
          title="Click to view full LTA DataMall service health"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                apiStatus === 'syncing'
                  ? 'bg-amber-400'
                  : apiStatus === 'fallback'
                  ? 'bg-red-400'
                  : 'bg-emerald-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                apiStatus === 'syncing'
                  ? 'bg-amber-500'
                  : apiStatus === 'fallback'
                  ? 'bg-red-500'
                  : 'bg-emerald-500'
              }`}
            ></span>
          </span>
          <span className="hidden xl:inline text-[11px] text-[#727783] group-hover:text-[#191c1d]">
            API:
          </span>
          <span className="font-bold text-[11px] sm:text-[12px] text-emerald-700">
            {apiStatus === 'syncing' ? 'SYNC' : 'LIVE (24ms)'}
          </span>
        </button>

        {/* 3. Live Refresh Now Button */}
        <button
          id="refresh-data-now-btn"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-[#004481] text-white hover:bg-[#005baa] rounded-lg text-[12px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-75 ${
            isRefreshing ? 'opacity-80' : ''
          }`}
          title="Click to immediately re-poll LTA DataMall feeds"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 transition-transform duration-700 ${
              isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
            }`}
          />
          <span className="hidden sm:inline">{t('refreshData')}</span>
          <span className="text-[10px] opacity-75 font-normal hidden lg:inline">
            ({secondsUntilNextRefresh}s)
          </span>
        </button>

        {/* 4. Singapore Standard Time Master Clock */}
        <button
          id="sgt-clock-btn"
          onClick={onOpenClockModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#c1c6d3] bg-[#f8f9fa] hover:bg-white text-[12px] font-mono font-bold text-[#004481] transition-all cursor-pointer shadow-2xs"
          title="Singapore Standard Time (SGT / UTC+8)"
        >
          <Clock className="w-3.5 h-3.5 text-[#004481]" />
          <span className="tracking-tight">{sgtTime || '14:32:00'}</span>
          <span className="text-[10px] text-[#727783] font-sans font-bold">SGT</span>
        </button>
      </div>
    </header>
  );
};
