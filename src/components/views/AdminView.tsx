import React from 'react';
import { ShieldCheck, Database, ArrowUpRight, DollarSign, Building2, ChevronLeft, Terminal } from 'lucide-react';

interface AdminViewProps {
  adminStats: any;
  adminLogs: any[];
  adminRole: string;
  setAdminRole: (role: string) => void;
  setWebhookLog: (log: string) => void;
  selectedAdminTenantId: string | null;
  setSelectedAdminTenantId: (id: string | null) => void;
  executeCashoutOverride: () => void;
  cashoutAmount: string;
  setCashoutAmount: (val: string) => void;
  setIsCashoutModalOpen: (val: boolean) => void;
  setCashoutError: (val: string) => void;
  setCashoutSuccess: (val: any) => void;
  setTotpToken: (val: string) => void;
}

export default function AdminView(props: AdminViewProps) {
  const {
    adminStats, adminLogs, adminRole, setAdminRole, setWebhookLog, 
    selectedAdminTenantId, setSelectedAdminTenantId, executeCashoutOverride, 
    cashoutAmount, setCashoutAmount, setIsCashoutModalOpen, 
    setCashoutError, setCashoutSuccess, setTotpToken
  } = props;

  return (
    <div className="space-y-6 animate-fade-in text-slate-700">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center translate-x-12">
          <ShieldCheck className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded text-[10px] tracking-wider uppercase inline-block border border-emerald-500/30">
                Platform Master Console
              </span>
              <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <span>ROLE: PLATFORM_MUTATION_MASTER</span>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white">Super-Admin Multi-Tenant Hub</h2>
            <p className="text-slate-300 text-xs mt-1.5 leading-relaxed max-w-2xl">
              Financial ledger auditing across all connected roofing businesses. Monitor aggregated network volume, split processing fees, and execute manual cashouts of platform fees directly using secure 2FA verifications.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-3 shrink-0">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Simulate Role Headers (RBAC Check)
            </label>
            <div className="flex bg-slate-100/10 rounded-lg p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setAdminRole("SUPER_ADMIN");
                  setWebhookLog("[RBAC Override Status] Admin header role set to SUPER_ADMIN.");
                }}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${adminRole === "SUPER_ADMIN" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
              >
                SUPER_ADMIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminRole("ROOFER_USER");
                  setWebhookLog("[RBAC Override Status] Admin header role downgraded to ROOFER_USER.");
                }}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${adminRole !== "SUPER_ADMIN" ? "bg-red-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
              >
                ROOFER_USER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold mb-2">
            <span className="uppercase tracking-wider text-[10px]">Aggregate network volume</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-2xl font-black">${adminStats ? adminStats.totalProcessedVolume.toLocaleString() : "0.00"}</h4>
        </div>
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold mb-2">
            <span className="uppercase tracking-wider text-[10px]">Platform lifetime profit</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-2xl font-black text-emerald-400">${adminStats ? adminStats.totalPlatformProfit.toLocaleString() : "0.00"}</h4>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-2">
            <span className="uppercase tracking-wider text-[10px]">Stripe wallet available</span>
          </div>
          <h4 className="text-2xl font-black text-slate-800">${adminStats ? adminStats.availableBalance.toLocaleString() : "0.00"}</h4>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-2">
            <span className="uppercase tracking-wider text-[10px]">Stripe pending</span>
          </div>
          <h4 className="text-2xl font-black text-slate-800">${adminStats ? adminStats.pendingBalance.toLocaleString() : "0.00"}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cashout Column */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-800 uppercase">Fee Cash-Out Interface</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Extraction Amount ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-xs">$</span>
                <input
                  type="number" step="0.01" value={cashoutAmount} onChange={(e) => setCashoutAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border rounded-xl bg-slate-50 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (adminRole !== "SUPER_ADMIN") return executeCashoutOverride();
              setCashoutError(""); setCashoutSuccess(null); setTotpToken(""); setIsCashoutModalOpen(true);
            }}
            className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Trigger Cash Out
          </button>
        </div>

        {/* Tenant Registry */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {!selectedAdminTenantId ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase">Roofing SaaS Tenant Registry</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b">
                    <tr><th className="py-2.5 px-3">Company</th><th className="py-2.5 px-3">Volume</th><th className="py-2.5 px-3 text-right">Skimming (2%)</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminStats?.tenants.map((tenant: any) => (
                      <tr key={tenant.companyId} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedAdminTenantId(tenant.companyId)}>
                        <td className="py-3 px-3"><span className="font-bold text-blue-600 block">{tenant.companyName}</span></td>
                        <td className="py-3 px-3">${tenant.totalVolume.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-black text-emerald-600">${tenant.platformFeesGenerated.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <button onClick={() => setSelectedAdminTenantId(null)} className="bg-slate-100 p-1.5 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="text-sm font-bold">{adminStats?.tenants.find((t:any) => t.companyId === selectedAdminTenantId)?.companyName}</h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logs Terminal */}
      <div className="bg-[#0F172A] rounded-2xl border p-5 font-mono text-xs text-slate-400 shadow-xl">
        <div className="flex items-center gap-2 mb-3 text-white font-bold border-b pb-2">
          <Terminal className="w-4 h-4 text-emerald-400" /> <span>Live Audit Trails</span>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {adminLogs.map((log, index) => (
             <div key={index} className="p-2 bg-slate-950/80 rounded border border-slate-800">
               <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.event}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}