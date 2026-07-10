import React from 'react';
import { Layers, MessageSquare, DollarSign, Settings, ShieldCheck, Users, LogOut, UserPlus } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  company: any;
  stats: any;
  leads: any[];
  transactions: any[];
  currentUser: any;
  handleLogout: () => void; // New logout function
}

export default function Sidebar({
  activeTab, setActiveTab, company, stats, leads, transactions,
  currentUser, handleLogout
}: SidebarProps) {
  
  const role = currentUser?.role || "ROOFER_USER";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isCompanyAdmin = role === "TENANT_ADMIN" || isSuperAdmin;

  return (
    <aside id="sidebar-panel" className="w-full md:w-80 bg-[#0F172A] text-white flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <div className="w-4 h-4 bg-white rotate-45 rounded-sm"></div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight font-display text-white">STRATIS</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">MIDDLEWARE</span>
              <span className="text-[10px] text-slate-400">v2.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"}`}>
          <Layers className="w-4 h-4" /> <span>CRM Overview</span>
        </button>

        <button onClick={() => setActiveTab("conversations")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "conversations" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"}`}>
          <MessageSquare className="w-4 h-4" /> <span>Live AI Chats & Booking</span>
        </button>

        {/* FIXED: Dark theme styling and UserPlus import */}
        <button 
          onClick={() => setActiveTab("add-lead")} 
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "add-lead" 
              ? "bg-blue-600 text-white shadow-md" 
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          <UserPlus className="w-4 h-4" /> <span>Add Lead</span>
        </button>

        {/* IPAD APP - Visible to everyone */}
        <button onClick={() => setActiveTab("inspector")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all mt-4 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/50 hover:shadow-lg hover:scale-[1.02]`}>
          <span>🚀 Launch iPad Field App</span>
        </button>

        {/* --- COMPANY ADMIN ONLY TABS --- */}
        {isCompanyAdmin && (
          <div className="pt-2 mt-2 space-y-1">
            <button onClick={() => setActiveTab("billing")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "billing" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"}`}>
              <DollarSign className="w-4 h-4" /> <span>Invoices & Payments</span>
            </button>
            <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "settings" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"}`}>
              <Settings className="w-4 h-4" /> <span>Company Settings</span>
            </button>
          </div>
        )}

        {/* --- SUPER ADMIN ONLY TABS --- */}
        {isSuperAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button onClick={() => setActiveTab("admin")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "admin" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> <span>Stratis Super-Admin</span>
            </button>
            <button onClick={() => setActiveTab("admin-users")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "admin-users" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"}`}>
              <Users className="w-4 h-4 text-indigo-400" /> <span>Global Credentials</span>
            </button>
          </div>
        )}
      </nav>

      {/* --- LOGOUT BUTTON & USER PROFILE --- */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-300 font-bold truncate max-w-[150px]">{currentUser?.email}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{role.replace("_", " ")}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}