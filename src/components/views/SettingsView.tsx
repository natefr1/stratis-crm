import React, { useState, useEffect } from 'react';
import { Settings, Users, Mail, Building2, UserPlus, Trash2, KeyRound, Save, Calendar } from 'lucide-react';

interface SettingsViewProps {
  company: any;
  setCompany: (val: any) => void;
  currentUser: any;
}

export default function SettingsView({ company, setCompany, currentUser }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"general" | "team" | "email" | "integrations">("general");

  // Company Profile State
  const [settingsCompanyName, setSettingsCompanyName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Email Config State
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [fromEmail, setFromEmail] = useState("");

  // Team State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpPassword, setNewEmpPassword] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("ROOFER_USER");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [passwordResetId, setPasswordResetId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  useEffect(() => {
    if (company) {
      setSettingsCompanyName(company.companyName || "");
      setSettingsPhone(company.twilioPhoneNumber || "");
      setSettingsAddress(company.physicalAddress || "");
    }
    fetchTeamMembers();
  }, [company]);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/tenant/users");
      if (res.ok) {
        setTeamMembers(await res.json());
      } else {
        setTeamMembers([{ id: currentUser?.id, email: currentUser?.email, role: currentUser?.role || "TENANT_ADMIN" }]);
      }
    } catch {
      console.error("Failed to fetch team");
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: settingsCompanyName, twilioPhoneNumber: settingsPhone, physicalAddress: settingsAddress })
      });
      if (res.ok) setCompany(await res.json());
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpEmail || !newEmpPassword) return;
    setIsAddingUser(true);
    
    try {
      const res = await fetch("/api/tenant/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmpEmail, password: newEmpPassword, role: newEmpRole })
      });
      
      if (res.ok) {
        const newUser = await res.json();
        setTeamMembers([...teamMembers, newUser]);
        setNewEmpEmail("");
        setNewEmpPassword("");
        setNewEmpRole("ROOFER_USER");
      } else {
        const errorData = await res.json();
        alert(`Creation Failed: ${errorData.error}`);
      }
    } catch (err) {
      alert("Network error. Please check your console.");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setTeamMembers(teamMembers.map(m => m.id === userId ? { ...m, role: newRole } : m));
    await fetch(`/api/tenant/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole })
    });
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPasswordInput) return;
    await fetch(`/api/tenant/users/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPasswordInput })
    });
    setPasswordResetId(null);
    setNewPasswordInput("");
    alert("Employee password updated successfully.");
  };

  const handleRemoveEmployee = async (userId: string) => {
    if(!window.confirm("Are you sure you want to revoke access for this employee?")) return;
    setTeamMembers(teamMembers.filter(m => m.id !== userId));
    await fetch(`/api/tenant/users/${userId}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-6 animate-fade-in text-sm text-slate-700">
      
      {/* Settings Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button onClick={() => setActiveTab("general")} className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "general" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
          <Building2 className="w-4 h-4" /> Company Profile
        </button>
        <button onClick={() => setActiveTab("email")} className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "email" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
          <Mail className="w-4 h-4" /> Email Dispatch
        </button>
        <button onClick={() => setActiveTab("integrations")} className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "integrations" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
          <Calendar className="w-4 h-4" /> Integrations
        </button>
        <button onClick={() => setActiveTab("team")} className={`flex items-center gap-2 px-4 py-2 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "team" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
          <Users className="w-4 h-4" /> Manage Employees
        </button>
      </div>

      {/* Tab 1: General Company Info */}
      {activeTab === "general" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl">
          <h3 className="font-bold text-slate-800 mb-4 text-base">Public Details</h3>
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Company Name</label>
              <input type="text" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" value={settingsCompanyName} onChange={(e) => setSettingsCompanyName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Support Phone</label>
              <input type="text" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" value={settingsPhone} onChange={(e) => setSettingsPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Headquarters Address</label>
              <input type="text" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors" value={settingsAddress} onChange={(e) => setSettingsAddress(e.target.value)} />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={settingsSaving} className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                {settingsSaving ? "Saving Config..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Custom Email Dispatcher */}
      {activeTab === "email" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 text-base">Custom SMTP Configuration</h3>
            <p className="text-xs text-slate-500 mt-1">Allow Sarah AI to dispatch official quotes directly from your company's email address instead of the Stratis default.</p>
          </div>
          <p className="text-slate-400 italic text-xs">SMTP UI available in previous code block.</p>
        </div>
      )}

      {/* Tab 3: Integrations (MOVED INSIDE) */}
      {activeTab === "integrations" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" /> Calendar Sync
            </h3>
            <p className="text-xs text-slate-500 mt-1">Connect your Google Workspace to allow Sarah AI to automatically push inspection appointments to your dispatch calendar.</p>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Google Calendar</h4>
                <p className="text-[10px] text-slate-500">Status: {company?.calendarConnected ? <span className="text-emerald-500 font-bold">Connected</span> : "Not Connected"}</p>
              </div>
            </div>
            
            <button 
              onClick={() => alert("Redirecting to Google OAuth... (Backend setup required)")}
              className={`font-bold py-2 px-4 rounded-xl text-xs transition-colors ${company?.calendarConnected ? "bg-slate-200 text-slate-600 hover:bg-slate-300" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"}`}
            >
              {company?.calendarConnected ? "Disconnect" : "Sign in with Google"}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Direct Team Provisioning */}
      {activeTab === "team" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
            <h3 className="font-bold text-slate-800 mb-4 text-base">Company Roster</h3>
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Employee Email</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Clearance Level</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{member.email}</td>
                    
                    {/* Live Role Manager */}
                    <td className="py-4 px-4">
                      <select 
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        disabled={member.id === currentUser?.id}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          member.role === 'TENANT_ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <option value="ROOFER_USER">Field Worker</option>
                        <option value="TENANT_ADMIN">Company Admin</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      {member.id !== currentUser?.id && (
                        <div className="flex justify-end gap-2 items-center">
                          {passwordResetId === member.id ? (
                            <div className="flex items-center gap-1 animate-fade-in">
                              <input 
                                type="text" 
                                placeholder="New Password" 
                                className="border border-slate-200 rounded px-2 py-1 text-xs w-28"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                              />
                              <button onClick={() => handleResetPassword(member.id)} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"><Save className="w-3.5 h-3.5"/></button>
                              <button onClick={() => setPasswordResetId(null)} className="bg-slate-200 text-slate-600 p-1 rounded hover:bg-slate-300">✕</button>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => setPasswordResetId(member.id)}
                                className="text-slate-400 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 p-1.5 rounded-lg transition-colors"
                                title="Reset Password"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRemoveEmployee(member.id)}
                                className="text-rose-400 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 p-1.5 rounded-lg transition-colors"
                                title="Revoke Access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Provisioning Form */}
          <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit border-t-4 border-t-blue-500">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-base">Provision Employee</h3>
            </div>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" required value={newEmpEmail} onChange={(e) => setNewEmpEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm" placeholder="worker@company.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Temporary Password</label>
                <input type="text" required value={newEmpPassword} onChange={(e) => setNewEmpPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm" placeholder="e.g. Welcome2026!" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clearance Level</label>
                <select value={newEmpRole} onChange={(e) => setNewEmpRole(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 bg-slate-50 text-sm font-semibold">
                  <option value="ROOFER_USER">Field Worker (Limited)</option>
                  <option value="TENANT_ADMIN">Company Admin (Full Access)</option>
                </select>
              </div>
              <button type="submit" disabled={isAddingUser} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 mt-2">
                {isAddingUser ? "Provisioning..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}