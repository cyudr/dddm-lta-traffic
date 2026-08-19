import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, MRTLineStatus, TrafficIncident, ServiceAdvisory } from './types';
import { INITIAL_INCIDENTS, MRT_LINES, SERVICE_ADVISORIES } from './data/transportData';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { TrafficIncidentsView } from './components/TrafficIncidentsView';
import { MRTStatusView } from './components/MRTStatusView';
import { HistoricalTrendsView } from './components/HistoricalTrendsView';
import { NetworkMapModal } from './components/NetworkMapModal';
import { LineDetailsModal } from './components/LineDetailsModal';
import { ApiStatusModal } from './components/ApiStatusModal';
import { ClockModal } from './components/ClockModal';
import { TermsModal } from './components/TermsModal';
import { Footer } from './components/Footer';
import { LanguageProvider } from './i18n/LanguageContext';

function TransportApp() {
  const [currentView, setCurrentView] = useState<ViewMode>('traffic');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [incidents, setIncidents] = useState<TrafficIncident[]>(INITIAL_INCIDENTS);
  const [lines, setLines] = useState<MRTLineStatus[]>(MRT_LINES);
  const [advisories, setAdvisories] = useState<ServiceAdvisory[]>(SERVICE_ADVISORIES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveSyncStatus, setLiveSyncStatus] = useState<'idle' | 'syncing' | 'live' | 'fallback'>('idle');
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isNetworkMapOpen, setIsNetworkMapOpen] = useState(false);
  const [selectedLineForModal, setSelectedLineForModal] = useState<MRTLineStatus | null>(null);
  const [isApiStatusOpen, setIsApiStatusOpen] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Fetch live LTA DataMall Traffic Incidents and Train Alerts
  const fetchLTAData = useCallback(async () => {
    setIsRefreshing(true);
    setLiveSyncStatus('syncing');
    try {
      // 1. Fetch Traffic Incidents
      const incidentsRes = await fetch('/api/traffic-incidents');
      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        if (incidentsData.success && Array.isArray(incidentsData.value) && incidentsData.value.length > 0) {
          const sanitized = incidentsData.value.map((inc: any, idx: number) => {
            let lat = typeof inc.lat === 'number' && !isNaN(inc.lat) ? inc.lat : undefined;
            let lng = typeof inc.lng === 'number' && !isNaN(inc.lng) ? inc.lng : undefined;

            if (lat === undefined || lng === undefined) {
              if (typeof inc.latPercent === 'number' && typeof inc.lngPercent === 'number') {
                lat = 1.47 - (inc.latPercent / 100) * (1.47 - 1.22);
                lng = 103.60 + (inc.lngPercent / 100) * (104.04 - 103.60);
              } else {
                lat = 1.3325 + (idx * 0.008);
                lng = 103.8200 + (idx * 0.012);
              }
            }

            return {
              ...inc,
              lat,
              lng,
            };
          });
          setIncidents(sanitized);
        }
      }

      // 2. Fetch Train Service Alerts
      const alertsRes = await fetch('/api/train-service-alerts');
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success && alertsData.value) {
          const alertObj = alertsData.value;
          if (alertObj.Status === 2 && Array.isArray(alertObj.AffectedSegments) && alertObj.AffectedSegments.length > 0) {
            const affectedLineCodes = alertObj.AffectedSegments.map((s: any) => s.Line);

            setLines((prevLines) =>
              prevLines.map((l) => {
                const isAffected = affectedLineCodes.some((code: string) =>
                  code.toUpperCase().includes(l.code)
                );
                if (isAffected) {
                  return {
                    ...l,
                    status: 'delay',
                    statusTitle: 'Service Delay',
                    borderClass: 'border-l-[#ffc107]',
                    statusMessage: alertObj.Message?.[0]?.Content || 'Service delay reported.',
                  };
                }
                return l;
              })
            );

            if (Array.isArray(alertObj.Message) && alertObj.Message.length > 0) {
              const newAdvisories: ServiceAdvisory[] = alertObj.Message.map((m: any, idx: number) => ({
                id: `lta-adv-${idx}-${Date.now()}`,
                lineCode: alertObj.AffectedSegments[0]?.Line || 'MRT',
                lineColorBg: 'bg-[#9900aa]',
                timeFormatted: 'LIVE SGT',
                iconType: 'campaign',
                iconColor: 'text-[#ffc107]',
                title: 'LTA Train Service Alert',
                message: m.Content,
                affectedStations: alertObj.AffectedSegments[0]?.Stations,
                alternativeTransport: alertObj.AffectedSegments[0]?.FreePublicBus
                  ? 'Free bridging public bus services activated.'
                  : undefined,
              }));
              setAdvisories((prev) => [...newAdvisories, ...prev]);
            }
          }
        }
      }

      setLiveSyncStatus('live');
      const nowStr =
        new Date().toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' SGT';
      setLastRefreshedTime(nowStr);
    } catch (error) {
      console.error('Error fetching live LTA DataMall data:', error);
      setLiveSyncStatus('fallback');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Poll LTA DataMall periodically
  useEffect(() => {
    fetchLTAData();
    const interval = setInterval(() => {
      fetchLTAData();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchLTAData]);

  // Keyboard shortcut: Press 'R' to refresh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'r' || e.key === 'R') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        fetchLTAData();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchLTAData]);

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen flex flex-col antialiased selection:bg-[#004481] selection:text-white">
      {/* 1. Top Navigation Bar */}
      <TopNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenClockModal={() => setIsClockModalOpen(true)}
        onOpenDataMallModal={() => setIsApiStatusOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        onRefreshData={fetchLTAData}
        isRefreshing={isRefreshing}
        lastRefreshedTime={lastRefreshedTime}
        apiStatus={liveSyncStatus}
      />

      {/* 2. Main Layout Container */}
      <div className="flex flex-1 pt-16">
        {/* Right Control Center Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
            setIsMobileMenuOpen(false);
          }}
          incidentCount={incidents.length}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic View Mode: Traffic Incidents, MRT Status, or Historical Trends */}
        <main className="flex-1 flex flex-col w-full">
          {currentView === 'traffic' ? (
            <TrafficIncidentsView
              incidents={incidents}
              searchQuery={searchQuery}
              lastRefreshedTime={lastRefreshedTime}
              onRefreshData={fetchLTAData}
              isRefreshing={isRefreshing}
              onNavigateToTrends={() => setCurrentView('trends')}
            />
          ) : currentView === 'mrt' ? (
            <MRTStatusView
              lines={lines}
              advisories={advisories}
              onOpenNetworkMap={() => setIsNetworkMapOpen(true)}
              onSelectLineDetails={(line) => setSelectedLineForModal(line)}
            />
          ) : (
            <HistoricalTrendsView />
          )}
        </main>
      </div>

      {/* 3. Global Footer */}
      <Footer
        onOpenApiStatus={() => setIsApiStatusOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      {/* 4. Modals */}
      <NetworkMapModal
        isOpen={isNetworkMapOpen}
        onClose={() => setIsNetworkMapOpen(false)}
        lines={lines}
        onSelectLine={(line) => {
          setIsNetworkMapOpen(false);
          setSelectedLineForModal(line);
        }}
      />

      <LineDetailsModal
        line={selectedLineForModal}
        onClose={() => setSelectedLineForModal(null)}
      />

      <ApiStatusModal
        isOpen={isApiStatusOpen}
        onClose={() => setIsApiStatusOpen(false)}
      />

      <ClockModal
        isOpen={isClockModalOpen}
        onClose={() => setIsClockModalOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <TransportApp />
    </LanguageProvider>
  );
}
