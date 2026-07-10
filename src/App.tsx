import React, { useState, useEffect, useRef } from "react";

// Components & Views
import AuthView from "./components/AuthView";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/views/DashboardView";
import ChatView from "./components/views/ChatView";
import BillingView from "./components/views/BillingView";
import SettingsView from "./components/views/SettingsView";
import AdminView from "./components/views/AdminView";
import AdminCredentials from "./components/AdminCredentials"; 
import InspectorView from "./components/views/InspectorView";
import LeadEntryView from "./components/views/LeadEntryView"; 

// Types
import { Lead, RoofingCompany, Transaction, DashboardStats, AdminDashboardStats } from "./types";

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL || "";

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [adminRole, setAdminRole] = useState<string>("ROOFER_USER"); 
  const [adminIsLoggedIn, setAdminIsLoggedIn] = useState<boolean>(false); 
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "conversations" | "add-lead" | "billing" | "blueprint" | "admin" | "admin-users" | "settings" | "inspector">("dashboard");

  // Core App State
  const [company, setCompany] = useState<RoofingCompany | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Admin States
  const [adminStats, setAdminStats] = useState<AdminDashboardStats | null>(null);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [cashoutAmount, setCashoutAmount] = useState<string>("");
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState<boolean>(false);
  const [totpToken, setTotpToken] = useState<string>("");
  const [cashoutError, setCashoutError] = useState<string>("");
  const [cashoutSuccess, setCashoutSuccess] = useState<any>(null);
  const [selectedAdminTenantId, setSelectedAdminTenantId] = useState<string | null>(null);

  // Chat & Funnel State
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [homeownerInput, setHomeownerInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [selectedBookingTime, setSelectedBookingTime] = useState<string>("");
  const [bookingFinished, setBookingFinished] = useState<boolean>(false);

  // Inbound Form State
  const [newHomeownerName, setNewHomeownerName] = useState<string>("");
  const [newHomeownerPhone, setNewHomeownerPhone] = useState<string>("");
  const [newHomeownerChannel, setNewHomeownerChannel] = useState<"sms" | "instagram" | "web">("sms");
  const [newHomeownerNeighborhood, setNewHomeownerNeighborhood] = useState<string>("Memorial");
  const [newHomeownerMsg, setNewHomeownerMsg] = useState<string>("");
  const [isCreatingInbound, setIsCreatingInbound] = useState<boolean>(false);
  const [webhookLog, setWebhookLog] = useState<string>("Waiting for system event...");

  // 👈 NEW: Helper to generate auth headers for every request
  const getAuthHeaders = () => {
    const token = localStorage.getItem("stratis_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // Data Fetching
  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      const companyRes = await fetch(`${API_URL}/api/company`, { headers });
      if (companyRes.ok) setCompany(await companyRes.json());

      const leadsRes = await fetch(`${API_URL}/api/leads`, { headers });
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data);
        if (data.length > 0 && !selectedLeadId) setSelectedLeadId(data[0].id);
      }

      const txRes = await fetch(`${API_URL}/api/transactions`, { headers });
      if (txRes.ok) setTransactions(await txRes.json());

      const statsRes = await fetch(`${API_URL}/api/stats`, { headers });
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error("Error retrieving dashboard state:", err);
    }
  };

  const fetchAdminData = async () => {
    try {
      const headers = { ...getAuthHeaders(), "x-admin-role": adminRole };
      const adminRes = await fetch(`${API_URL}/admin/dashboard-stats`, { headers });
      if (adminRes.ok) setAdminStats(await adminRes.json());

      const logsRes = await fetch(`${API_URL}/admin/audit-logs`, { headers });
      if (logsRes.ok) setAdminLogs(await logsRes.json());
    } catch (err) {
      console.error("Error retrieving platform metrics:", err);
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("stratis_token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true); 
        setActiveTab("dashboard"); 

        if (data.user?.role === 'SUPER_ADMIN') {
          setAdminIsLoggedIn(true);
          setAdminRole("SUPER_ADMIN");
        } else {
          setAdminIsLoggedIn(false);
          setAdminRole(data.user?.role || "ROOFER_USER");
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
      localStorage.removeItem("stratis_token");
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAdminRole("ROOFER_USER");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    if (adminIsLoggedIn) fetchAdminData();
    const interval = setInterval(() => {
      fetchData();
      if (adminIsLoggedIn) fetchAdminData();
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated, adminIsLoggedIn, adminRole]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedLead?.transcript, chatLoading]);

  if (!isAuthenticated) {
    return <AuthView onLogin={checkAuth} />;
  }

  const executeCashoutOverride = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/cashout`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "x-admin-role": adminRole },
        body: JSON.stringify({ amount: 1, totpToken: '000000' })
      });
      const result = await res.json();
      if (!res.ok) {
        setWebhookLog(`[SUPER-ADMIN RBAC STOPPED] Server blocked request!\nStatus Code: ${res.status} Forbidden\nBackend Response: ${result.error}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFullLeadEntry = async (leadData: any) => {
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          homeownerName: leadData.homeownerName,
          homeownerPhone: leadData.homeownerPhone,
          homeownerChannel: "web",
          neighborhood: leadData.address,
          status: "new",
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const initialNote = `[INTERNAL NOTE] Manual Lead created. Address: ${leadData.address} | Roof Age: ${leadData.roofAge || 'N/A'} | Insurance: ${leadData.insuranceCompany || 'N/A'} | Damage Notes: ${leadData.damageNotes}`;
        
        await fetch(`${API_URL}/api/leads/${created.id}/chat`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ text: initialNote }),
        });

        await fetchData();
        setSelectedLeadId(created.id);
        setActiveTab("conversations");
        setWebhookLog(`[Manual Entry] Lead profile created for ${created.homeownerName}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualLeadEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeownerName.trim() || !newHomeownerMsg.trim()) return;

    setIsCreatingInbound(true);
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          homeownerName: newHomeownerName,
          homeownerPhone: newHomeownerPhone || "+1 (832) 555-8899",
          homeownerChannel: newHomeownerChannel,
          neighborhood: newHomeownerNeighborhood,
          status: "conversing",
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const chatRes = await fetch(`${API_URL}/api/leads/${created.id}/chat`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ text: newHomeownerMsg }),
        });

        if (chatRes.ok) {
          await fetchData();
          setSelectedLeadId(created.id);
          setActiveTab("conversations");
          setNewHomeownerName("");
          setNewHomeownerPhone("");
          setNewHomeownerMsg("");
          setWebhookLog(`[Gateway Inbound Intercept] Homeowner ${created.homeownerName} initiated contact.\nPassed to Sarah AI.`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingInbound(false);
    }
  };

  const sendChatMessage = async (e?: React.FormEvent, isHuman?: boolean) => {
    if (e) e.preventDefault();
    if (!homeownerInput.trim() || !selectedLeadId) return;

    const userText = homeownerInput;
    setHomeownerInput("");
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/leads/${selectedLeadId}/chat`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: userText, isHuman }),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
        fetchData();
        
        if (updatedLead.status === "qualified") {
          setWebhookLog(`[CRM Webhook] Sarah qualified ${updatedLead.homeownerName}. Forwarding to JobNimbus...`);
        }
      }
    } catch (err) {
      console.error("AI roundtrip error:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const updateLeadStatus = async (status: Lead["status"]) => {
    if (!selectedLeadId) return;
    try {
      const res = await fetch(`${API_URL}/api/leads/${selectedLeadId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updatedLead = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completeSchedulerBooking = async () => {
    if (!selectedLeadId || !selectedBookingTime) return;
    try {
      const res = await fetch(`${API_URL}/api/leads/${selectedLeadId}/book`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ date: selectedBookingTime }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === data.id ? data : l)));
        setBookingFinished(true);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="saas-container" className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {activeTab === "inspector" ? (
        <InspectorView leads={leads} setActiveTab={setActiveTab} setWebhookLog={setWebhookLog} />
      ) : (
        <>
          <div className="flex-1 flex flex-col md:flex-row min-h-screen">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              company={company} 
              stats={stats} 
              leads={leads} 
              transactions={transactions}
              currentUser={currentUser}
              handleLogout={handleLogout}
            />

            <main className="flex-1 flex flex-col min-h-0">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {activeTab === "dashboard" && (
                  <DashboardView 
                    company={company}
                    stats={stats}
                    transactions={transactions}
                    leads={leads}
                    handleManualLeadEntry={handleManualLeadEntry}
                    newHomeownerName={newHomeownerName}
                    setNewHomeownerName={setNewHomeownerName}
                    newHomeownerPhone={newHomeownerPhone}
                    setNewHomeownerPhone={setNewHomeownerPhone}
                    newHomeownerChannel={newHomeownerChannel}
                    setNewHomeownerChannel={setNewHomeownerChannel as any}
                    newHomeownerNeighborhood={newHomeownerNeighborhood}
                    setNewHomeownerNeighborhood={setNewHomeownerNeighborhood}
                    newHomeownerMsg={newHomeownerMsg}
                    setNewHomeownerMsg={setNewHomeownerMsg}
                    isCreatingInbound={isCreatingInbound}
                    webhookLog={webhookLog}
                  />
                )}

                {activeTab === "add-lead" && (
                  <LeadEntryView onLeadCreate={handleFullLeadEntry} />
                )}

                {activeTab === "conversations" && (
                  <ChatView 
                    leads={leads}
                    selectedLeadId={selectedLeadId}
                    setSelectedLeadId={setSelectedLeadId}
                    setBookingFinished={setBookingFinished}
                    updateLeadStatus={updateLeadStatus}
                    selectedLead={selectedLead}
                    homeownerInput={homeownerInput}
                    setHomeownerInput={setHomeownerInput}
                    sendChatMessage={sendChatMessage}
                    chatLoading={chatLoading}
                    chatBottomRef={chatBottomRef}
                    bookingFinished={bookingFinished}
                    selectedBookingTime={selectedBookingTime}
                    setSelectedBookingTime={setSelectedBookingTime}
                    completeSchedulerBooking={completeSchedulerBooking}
                  />
                )}

                {activeTab === "billing" && (
                  <BillingView 
                    company={company}
                    triggerStripeConnectOnboarding={() => console.log("Stripe mock")}
                    transactions={transactions}
                    leads={leads}
                    initiateInvoicePayment={(tx) => console.log("Pay", tx)}
                  />
                )}

                {activeTab === "settings" && (
                  <SettingsView company={company} setCompany={setCompany} currentUser={currentUser} />
                )}

                {activeTab === "admin" && (
                  <AdminView 
                    adminStats={adminStats}
                    adminLogs={adminLogs}
                    adminRole={adminRole}
                    setAdminRole={setAdminRole}
                    setWebhookLog={setWebhookLog}
                    selectedAdminTenantId={selectedAdminTenantId}
                    setSelectedAdminTenantId={setSelectedAdminTenantId}
                    executeCashoutOverride={executeCashoutOverride}
                    cashoutAmount={cashoutAmount}
                    setCashoutAmount={setCashoutAmount}
                    setIsCashoutModalOpen={setIsCashoutModalOpen}
                    setCashoutError={setCashoutError}
                    setCashoutSuccess={setCashoutSuccess}
                    setTotpToken={setTotpToken}
                  />
                )}

                {activeTab === "admin-users" && <AdminCredentials />}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}