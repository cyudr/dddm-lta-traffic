import React, { useState, useEffect } from 'react';
import { Search, X, Clock, Globe, Menu } from 'lucide-react';

interface TopNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenClockModal: () => void;
  onOpenDataMallModal: () => void;
  onToggleMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenClockModal,
  onOpenDataMallModal,
  onToggleMobileMenu,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const quickSearchOptions = [
    'PIE (Pan Island Expressway)',
    'AYE (Ayer Rajah Expressway)',
    'CTE (Central Expressway)',
    'KPE (Kallang-Paya Lebar)',
    'SLE (Seletar Expressway)',
    'BKE (Bukit Timah Expressway)',
    'ECP (East Coast Parkway)',
    'TPE (Tampines Expressway)',
    'MCE (Marina Coastal Expressway)',
    'Adam Road',
    'Clementi Ave 6',
    'Braddell Road',
    'Dhoby Ghaut',
  ];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' SGT'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredSuggestions = quickSearchOptions.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav
      id="top-navbar"
      className="bg-[#f8f9fa] border-b border-[#c1c6d3] fixed top-0 w-full z-50 flex justify-between items-center h-16 px-4 md:px-6 select-none"
    >
      {/* Brand & Mobile Toggle */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          id="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle mobile menu"
          className="md:hidden p-2 text-[#004481] hover:bg-[#e7e8e9] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-2">
          <span
            id="brand-title"
            className="text-[22px] md:text-[24px] font-bold text-[#004481] tracking-tight whitespace-nowrap cursor-pointer"
            onClick={() => onSearchChange('')}
          >
            TransportMonitor SG
          </span>
          <span className="hidden lg:inline-block text-[11px] font-semibold text-[#727783] uppercase tracking-wider bg-[#e1e3e4] px-2 py-0.5 rounded">
            LTA Live
          </span>
        </div>

        {/* Search input in TopBar matching mockup */}
        <div className="hidden md:flex items-center ml-4 relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#414751]" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search roads, expressways..."
              className="pl-9 pr-8 py-1.5 bg-[#edeeef] border border-[#c1c6d3] rounded focus:border-[#004481] focus:ring-1 focus:ring-[#004481] focus:bg-white text-[14px] text-[#191c1d] w-64 lg:w-72 outline-none transition-all placeholder:text-[#727783]"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#727783] hover:text-[#191c1d]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div
              id="search-suggestions"
              className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-lg border border-[#c1c6d3] shadow-lg py-1 z-50 max-h-60 overflow-y-auto"
            >
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#727783] bg-[#f3f4f5]">
                Matching Expressways & Arterials
              </div>
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={() => {
                      onSearchChange(item.split(' ')[0]);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[13px] text-[#191c1d] hover:bg-[#e7e8e9] transition-colors flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <span className="text-[11px] text-[#004481] font-medium">Select</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-[13px] text-[#727783]">
                  No exact match. Searching live incident descriptions...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TopBar Right Icons matching mockup */}
      <div className="flex items-center gap-2 md:gap-3 text-[#004481]">
        <button
          id="btn-clock-status"
          onClick={onOpenClockModal}
          title="Singapore Time (SGT) & Telemetry"
          className="cursor-pointer hover:bg-[#e7e8e9] transition-colors p-2 rounded-full flex items-center gap-1.5 text-[#004481]"
        >
          <span className="material-symbols-outlined text-[22px]">schedule</span>
          <span className="hidden sm:inline-block font-mono text-[13px] font-semibold text-[#414751]">
            {currentTime}
          </span>
        </button>

        <button
          id="btn-datamall-status"
          onClick={onOpenDataMallModal}
          title="LTA DataMall & Network Health"
          className="cursor-pointer hover:bg-[#e7e8e9] transition-colors p-2 rounded-full flex items-center gap-1 text-[#004481]"
        >
          <span className="material-symbols-outlined text-[22px]">public</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 hidden sm:inline-block"></span>
        </button>
      </div>
    </nav>
  );
};
