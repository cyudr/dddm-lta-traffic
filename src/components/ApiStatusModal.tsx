import React from 'react';
import { X, CheckCircle, Activity, Server, Database, ShieldCheck } from 'lucide-react';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const endpoints = [
    {
      name: 'LTA Traffic Incidents v2',
      path: '/v2/TrafficIncidents',
      status: 'Operational',
      uptime: '99.98%',
      latency: '24ms',
      refreshRate: 'Every 2 mins',
    },
    {
      name: 'Expressway Camera Feeds',
      path: '/v2/Traffic-Images',
      status: 'Operational',
      uptime: '100.0%',
      latency: '42ms',
      refreshRate: 'Every 1 min',
    },
    {
      name: 'Train Service Alerts',
      path: '/v2/TrainServiceAlerts',
      status: 'Operational',
      uptime: '99.95%',
      latency: '18ms',
      refreshRate: 'Realtime SSE',
    },
    {
      name: 'Expressway Travel Times',
      path: '/v2/EstTravelTimes',
      status: 'Operational',
      uptime: '99.99%',
      latency: '30ms',
      refreshRate: 'Every 5 mins',
    },
    {
      name: 'ERP Rates & Gantries',
      path: '/v2/ERPRates',
      status: 'Operational',
      uptime: '100.0%',
      latency: '15ms',
      refreshRate: 'Static Daily',
    },
  ];

  return (
    <div
      id="api-status-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="api-status-modal"
        className="bg-white rounded-xl shadow-2xl border border-[#c1c6d3] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#c1c6d3] bg-[#f8f9fa] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[#004481]" />
            <h3 className="text-[18px] font-bold text-[#004481]">
              LTA DataMall API & System Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#727783] hover:text-[#191c1d] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global summary banner */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-[14px]">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>All LTA DataMall ingestion microservices are operational.</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            99.98% SLA
          </span>
        </div>

        {/* Endpoints Table */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#edeeef] text-[#727783] text-[11px] uppercase tracking-wider">
                <th className="pb-2 font-bold">Endpoint Service</th>
                <th className="pb-2 font-bold">Status</th>
                <th className="pb-2 font-bold">Latency</th>
                <th className="pb-2 font-bold">Cadence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edeeef]">
              {endpoints.map((ep) => (
                <tr key={ep.path} className="hover:bg-[#f8f9fa]">
                  <td className="py-2.5 font-medium text-[#191c1d]">
                    <div>{ep.name}</div>
                    <div className="font-mono text-[11px] text-[#727783]">{ep.path}</div>
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {ep.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-[#414751]">{ep.latency}</td>
                  <td className="py-2.5 text-[#727783] text-[12px]">{ep.refreshRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f8f9fa] border-t border-[#c1c6d3] flex justify-between items-center text-[12px] text-[#727783] px-4">
          <span>Server Region: asia-southeast1 (Singapore)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004481] text-white rounded font-semibold hover:bg-[#005baa]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
