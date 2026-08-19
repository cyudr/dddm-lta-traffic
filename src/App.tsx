import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, MRTLineStatus, TrafficIncident, ServiceAdvisory } from './types';
import { INITIAL_INCIDENTS, MRT_LINES, SERVICE_ADVISORIES } from './data/transportData';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { TrafficIncidentsView } from './components/TrafficIncidentsView';
import { MRTStatusView } from './components/MRTStatusView';
import { NetworkMapModal } from './components/NetworkMapModal';
import { LineDetailsModal } from './components/LineDetailsModal';
import { ApiStatusModal } from './components/ApiStatusModal';
import { ClockModal } from './components/ClockModal';
import { TermsModal } from './components/TermsModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('traffic');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [incidents, setIncidents] = useState<TrafficIncident[]>(INITIAL_INCIDENTS);
  const [lines, setLines] = useState<MRTLineStatus[]>(MRT_LINES);
  const [advisories, setAdvisories] = useState<ServiceAdvisory[]>(SERVICE_ADVISORIES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveSyncStatus, setLiveSyncStatus] = useState<'idle' | 'syncing' | 'live' | 'fallback'>('idle');

  // Modals state
  const [isNetworkMapOpen, setIsNetworkMapOpen] = useState(false);
  const [selectedLineForModal, setSelectedLineForModal] = useState<MRTLineStatus | null>(null);
  const [isApiStatusOpen, setIsApiStatusOpen] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Fetch live LTA DataMall Traffic Incidents and Train Alerts
  const fetchLTAData = useCallback(async () => {
    setLiveSyncStatus('syncing');
    try {
      // 1. Fetch Traffic Incidents
      const incidentsRes = await fetch('/api/traffic-incidents');
      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        if (incidentsData.success && Array.isArray(incidentsData.value) && incidentsData.value.length > 0) {
          setIncidents(incidentsData.value);
          setLiveSyncStatus('live');
        } else {
          // If no active road incidents currently on the island, keep rich dataset
          setLiveSyncStatus('live');
        }
      }

      // 2. Fetch Train Service Alerts
      const alertsRes = await fetch('/api/train-service-alerts');
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success && alertsData.value) {
          const alertObj = alertsData.value;
          // If Status === 2, there is an active train disruption
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

            // Add live advisories
            if (Array.isArray(alertObj.Message) && alertObj.Message.length > 0) {
              const newAdvisories: ServiceAdvisory[] = alertObj.Message.map((m: any, idx: number) => ({
                id: `lta-adv-${idx}`,
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
    } catch (err) {
      console.warn('Could not connect to live LTA backend, fallback active:', err);
      setLiveSyncStatus('fallback');
    }
  }, []);

  useEffect(() => {
    fetchLTAData();
    // Re-fetch every 60 seconds
    const interval = setInterval(fetchLTAData, 60000);
    return () => clearInterval(interval);
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
      />

      {/* 2. Main Layout Container */}
      <div className="flex flex-1 pt-16">
        {/* Left Control Center Sidebar */}
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

        {/* Dynamic View Mode: Traffic Incidents (Screen 1) or MRT Status (Screen 2) */}
        <main className="flex-1 flex flex-col w-full">
          {currentView === 'traffic' ? (
            <TrafficIncidentsView
              incidents={incidents}
              searchQuery={searchQuery}
            />
          ) : (
            <MRTStatusView
              lines={lines}
              advisories={advisories}
              onOpenNetworkMap={() => setIsNetworkMapOpen(true)}
              onSelectLineDetails={(line) => setSelectedLineForModal(line)}
            />
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
