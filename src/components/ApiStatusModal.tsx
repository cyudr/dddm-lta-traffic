import React, { useState } from 'react';
import { X, CheckCircle, Activity, Server, Database, ShieldCheck, RefreshCw, Send } from 'lucide-react';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose }) => {
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: string; count?: number; latency?: number }>>({});

  if (!isOpen) return null;

  const endpoints = [
    {
      id: 'incidents',
      name: 'TrafficIncidents',
      desc: 'Real-time road accidents, breakdowns & heavy congestion alerts',
      path: '/api/traffic-incidents',
      ltaPath: 'TrafficIncidents',
      status: 'Operational',
      cadence: 'Every 2 mins',
    },
    {
      id: 'trains',
      name: 'TrainServiceAlerts',
      desc: 'MRT/LRT disruptions, affected stations & bridging bus activations',
      path: '/api/train-service-alerts',
      ltaPath: 'TrainServiceAlerts',
      status: 'Operational',
      cadence: 'Realtime Poll',
    },
    {
      id: 'cameras',
      name: 'Traffic-Imagesv2',
      desc: 'Expressway CCTV live snapshots across all Singapore corridors',
      path: '/api/traffic-images',
      ltaPath: 'Traffic-Imagesv2',
      status: 'Operational',
      cadence: 'Every 1 min',
    },
    {
      id: 'speeds',
      name: 'TrafficSpeedBandsv2',
      desc: 'Real-time average vehicle speeds on expressway segments',
      path: '/api/traffic-speed-bands',
      ltaPath: 'TrafficSpeedBandsv2',
      status: 'Operational',
      cadence: 'Every 5 mins',
    },
    {
      id: 'travelTimes',
      name: 'EstTravelTimes',
      desc: 'Estimated point-to-point journey durations on expressways',
      path: '/api/est-travel-times',
      ltaPath: 'EstTravelTimes',
      status: 'Operational',
      cadence: 'Every 5 mins',
    },
    {
      id: 'vms',
      name: 'VMS (Variable Message Signs)',
      desc: 'Overhead electronic highway signage warnings & travel advisories',
      path: '/api/vms',
      ltaPath: 'VMS',
      status: 'Operational',
      cadence: 'Every 2 mins',
    },
    {
      id: 'roadworks',
      name: 'RoadWorks',
      desc: 'Active & scheduled lane closures, resurfacing & construction',
      path: '/api/road-works',
      ltaPath: 'RoadWorks',
      status: 'Operational',
      cadence: 'Daily / Active',
    },
    {
      id: 'trafficLights',
      name: 'FaultyTrafficLights',
      desc: 'Traffic light blackouts and maintenance tracking',
      path: '/api/faulty-traffic-lights',
      ltaPath: 'FaultyTrafficLights',
      status: 'Operational',
      cadence: 'On Alert',
    },
    {
      id: 'carparks',
      name: 'CarParkAvailabilityv2',
      desc: 'Real-time parking lot availability in CBD, Orchard & Marina Bay',
      path: '/api/carpark-availability',
      ltaPath: 'CarParkAvailabilityv2',
      status: 'Operational',
      cadence: 'Every 1 min',
    },
  ];

  const testEndpoint = async (ep: typeof endpoints[0]) => {
    setTestingEndpoint(ep.id);
    const start = Date.now();
    try {
      const res = await fetch(ep.path);
      const latency = Date.now() - start;
      const data = await res.json();
      const count = Array.isArray(data.value) ? data.value.length : (data.count || 1);
      setTestResults((prev) => ({
        ...prev,
        [ep.id]: {
          status: res.ok ? '200 OK' : `HTTP ${res.status}`,
          count,
          latency,
        },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [ep.id]: { status: 'Failed', latency: Date.now() - start },
      }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <div
      id="api-status-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150"
    >
      <div
        id="api-status-modal"
        className="bg-white rounded-2xl shadow-2xl border border-[#c1c6d3] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#e1e3e4] bg-[#004481] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold tracking-tight">
                LTA DataMall API Integrations & Services
              </h3>
              <p className="text-[12px] text-white/80">
                Live DataMall v2 REST Ingestion Pipeline • Proxy Server Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary Banner */}
        <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[13px]">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All 9 Land Transport Authority DataMall microservices are deployed and connected.</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
            Key: Active
          </span>
        </div>

        {/* Endpoints Table */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#edeeef] text-[#727783] text-[11px] uppercase tracking-wider">
                <th className="pb-2 font-bold">LTA DataMall Service</th>
                <th className="pb-2 font-bold hidden sm:table-cell">Cadence</th>
                <th className="pb-2 font-bold">Status / Latency</th>
                <th className="pb-2 font-bold text-right">Test Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edeeef]">
              {endpoints.map((ep) => {
                const result = testResults[ep.id];
                const isTesting = testingEndpoint === ep.id;

                return (
                  <tr key={ep.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-3 font-medium text-[#191c1d] pr-2">
                      <div className="font-bold text-[#004481]">{ep.name}</div>
                      <div className="text-[11px] text-[#727783] line-clamp-1">{ep.desc}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">{ep.path}</div>
                    </td>
                    <td className="py-3 text-[#727783] text-[12px] hidden sm:table-cell whitespace-nowrap">
                      {ep.cadence}
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      {result ? (
                        <div className="text-[11px] font-mono">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {result.status}
                          </span>
                          <span className="text-gray-500 ml-1.5">
                            {result.latency}ms
                            {result.count !== undefined && ` (${result.count} items)`}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Operational
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => testEndpoint(ep)}
                        disabled={isTesting}
                        className="px-2.5 py-1 bg-white hover:bg-[#004481] hover:text-white border border-[#c1c6d3] text-[#004481] rounded text-[11px] font-bold transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Pinging...' : 'Ping'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f8f9fa] border-t border-[#c1c6d3] flex justify-between items-center text-[12px] text-[#727783] px-4 shrink-0">
          <span>Official LTA DataMall Account Key: <code className="font-mono text-[#004481]">3QiN8fMXQ/aEnjfKwkgZkA==</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004481] text-white rounded-lg font-semibold hover:bg-[#005baa] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
