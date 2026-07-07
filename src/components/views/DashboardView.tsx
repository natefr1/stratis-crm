import React from 'react';
import { Users, Sparkles, DollarSign, ArrowUpRight, Zap, RefreshCw, Terminal } from 'lucide-react';

interface DashboardProps {
  company: any;
  stats: any;
  transactions: any[];
  leads: any[];
  handleManualLeadEntry: (e: React.FormEvent) => void;
  newHomeownerName: string;
  setNewHomeownerName: (val: string) => void;
  newHomeownerPhone: string;
  setNewHomeownerPhone: (val: string) => void;
  newHomeownerChannel: "sms" | "instagram" | "web";
  setNewHomeownerChannel: (val: "sms" | "instagram" | "web") => void;
  newHomeownerNeighborhood: string;
  setNewHomeownerNeighborhood: (val: string) => void;
  newHomeownerMsg: string;
  setNewHomeownerMsg: (val: string) => void;
  isCreatingInbound: boolean;
  webhookLog: string;
}

export default function DashboardView(props: DashboardProps) {
  const {
    company, stats, transactions, leads, handleManualLeadEntry,
    newHomeownerName, setNewHomeownerName, newHomeownerPhone, setNewHomeownerPhone,
    newHomeownerChannel, setNewHomeownerChannel, newHomeownerNeighborhood, setNewHomeownerNeighborhood,
    newHomeownerMsg, setNewHomeownerMsg, isCreatingInbound, webhookLog
  } = props;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Intro Quick Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center translate-x-12">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
        <div className="max-w-2xl">
          <span className="bg-blue-500/20 text-blue-300 font-bold px-2.5 py-1 rounded text-[10px] tracking-wider uppercase inline-block mb-3">
            SAAS AUTOMATED ENGINE
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white">Howdy, {company?.companyName || "Partner"}!</h2>
          <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
            This platform bridges inbound homeowner channels (SMS & Instagram) directly to your AI reasoning model configured with the custom <strong>"Sarah" roofing instructions</strong>. Once qualified, details are injected into your calendar and payments auto-route with our 2% platform fee skim.
          </p>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Captured Leads</span>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><Users className="w-5 h-5" /></div>
          </div>
          <h4 className="text-3xl font-black text-slate-800">{stats ? stats.totalLeads : "0"}</h4>
          <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
            <span className="text-emerald-500 font-bold">100% real-time</span> sms & social tracking
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Qualified by Sarah</span>
            <div className="p-2 bg-slate-50 rounded-lg text-blue-600"><Sparkles className="w-5 h-5" /></div>
          </div>
          <h4 className="text-3xl font-black text-slate-800">{stats ? stats.qualifiedLeads : "0"}</h4>
          <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
            <span className="text-blue-600 font-black">{stats ? stats.ratio : "0"}%</span> Conversion Efficiency Rate
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Won Net Revenue</span>
            <div className="p-2 bg-slate-50 rounded-lg text-emerald-600"><DollarSign className="w-5 h-5" /></div>
          </div>
          <h4 className="text-3xl font-black text-slate-800">
            ${stats ? stats.revenueGenerated.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
          </h4>
          <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">After Stripe automatic fee splits (98%)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Incoming Unpaid Flow</span>
            <div className="p-2 bg-slate-50 rounded-lg text-amber-600"><ArrowUpRight className="w-5 h-5" /></div>
          </div>
          <h4 className="text-3xl font-black text-slate-800">
            ${transactions.filter(t => t.status === "pending").reduce((acc, current) => acc + current.amount, 0).toLocaleString()}
          </h4>
          <p className="text-slate-400 text-xs mt-1.5">{transactions.filter(t => t.status === "pending").length} open invoice statements</p>
        </div>
      </div>

      {/* Manual Lead Inbound Trigger Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Manual Lead Entry Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-300 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Manual Inbound Lead</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Manually log a new homeowner lead and their initial message. This will initialize the Sarah AI conversation pipeline.
          </p>

          <form onSubmit={handleManualLeadEntry} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Homeowner Name</label>
              <input
                type="text" required value={newHomeownerName} onChange={(e) => setNewHomeownerName(e.target.value)} placeholder="e.g. John Doe"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inbound Channel</label>
                <select
                  value={newHomeownerChannel} onChange={(e) => setNewHomeownerChannel(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="sms">💬 Twilio SMS</option>
                  <option value="instagram">📸 Instagram DM</option>
                  <option value="web">🌐 Website Widget</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                <input
                  type="text" value={newHomeownerNeighborhood} onChange={(e) => setNewHomeownerNeighborhood(e.target.value)} placeholder="e.g. Heights, Katy"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">First Incoming Query (Inbound)</label>
              <textarea
                required rows={3} value={newHomeownerMsg} onChange={(e) => setNewHomeownerMsg(e.target.value)} placeholder="Hey, my shingles blew off near Katy, need immediate inspection!"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button type="submit" disabled={isCreatingInbound} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors duration-150">
              {isCreatingInbound ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Saving Lead Hook...</span></>
              ) : (
                <><Zap className="w-3.5 h-3.5 text-amber-400" /><span>Save Lead Event</span></>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Leads Pipeline Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Active Leads Pipeline</h3>
            </div>
            <span className="text-[11px] text-slate-500">Live updating</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-3">Homeowner</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">{lead.homeownerName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {lead.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-400 text-[10px]">Review via Chats tab</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unified System Logs Output */}
      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-5 font-mono text-xs text-slate-400 shadow-lg relative">
        <div className="absolute right-4 top-4.5 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span className="text-[10px] text-slate-500 font-bold uppercase">webhook monitor</span>
        </div>
        <div className="flex items-center gap-2 mb-3 text-white font-bold border-b border-slate-800 pb-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Integrations Webhook Transceiver Terminal (Simulation Output)</span>
        </div>
        <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap leading-tight text-slate-300">
          {webhookLog}
        </pre>
      </div>

    </div>
  );
}