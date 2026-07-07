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

// Types
import { Lead, RoofingCompany, Transaction, DashboardStats, AdminDashboardStats } from "./types";

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Real Database Security Checks
  const [adminRole, setAdminRole] = useState<string>("ROOFER_USER"); 
  const [adminIsLoggedIn, setAdminIsLoggedIn] = useState<boolean>(false); 
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "conversations" | "billing" | "blueprint" | "admin" | "admin-users" | "settings" | "inspector">("dashboard");

  // Core App State
  const [company, setCompany] = useState<RoofingCompany | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // --- MISSING ADMIN STATES RESTORED ---
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
  
  // Scheduling State
  const [selectedBookingTime, setSelectedBookingTime] = useState<string>("");
  const [bookingFinished, setBookingFinished] = useState<boolean>(false);

  // Inbound Form State (For Dashboard)
  const [newHomeownerName, setNewHomeownerName] = useState<string>("");
  const [newHomeownerPhone, setNewHomeownerPhone] = useState<string>("");
  const [newHomeownerChannel, setNewHomeownerChannel] = useState<"sms" | "instagram" | "web">("sms");
  const [newHomeownerNeighborhood, setNewHomeownerNeighborhood] = useState<string>("Memorial");
  const [newHomeownerMsg, setNewHomeownerMsg] = useState<string>("");
  const [isCreatingInbound, setIsCreatingInbound] = useState<boolean>(false);

  // System Logs
  const [webhookLog, setWebhookLog] = useState<string>("Waiting for system event...");

  // Data Fetching
  const fetchData = async () => {
    try {
      const companyRes = await fetch("/api/company");
      if (companyRes.ok) setCompany(await companyRes.json());

      const leadsRes = await fetch("/api/leads");
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data);
        if (data.length > 0 && !selectedLeadId) setSelectedLeadId(data[0].id);
      }

      const txRes = await fetch("/api/transactions");
      if (txRes.ok) setTransactions(await txRes.json());

      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error("Error retrieving dashboard state:", err);
    }
  };

  // --- MISSING ADMIN FETCH RESTORED ---
  const fetchAdminData = async () => {
    try {
      const headers = { "x-admin-role": adminRole };
      const adminRes = await fetch("/admin/dashboard-stats", { headers });
      if (adminRes.ok) setAdminStats(await adminRes.json());

      const logsRes = await fetch("/admin/audit-logs", { headers });
      if (logsRes.ok) setAdminLogs(await logsRes.json());
    } catch (err) {
      console.error("Error retrieving platform metrics:", err);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        
        // 👇 FORCE THE UI TO START ON THE DASHBOARD
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
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAdminRole("ROOFER_USER");
    } catch (err) {
      console.error(err);
    }
  };

  // React Hooks
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

  // Auth Guard
  if (!isAuthenticated) {
    return <AuthView onLogin={checkAuth} />;
  }

  // --- MISSING CASHOUT OVERRIDE RESTORED ---
  const executeCashoutOverride = async () => {
    try {
      const res = await fetch("/admin/cashout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": adminRole
        },
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

  // Action Handlers
  const handleManualLeadEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeownerName.trim() || !newHomeownerMsg.trim()) return;

    setIsCreatingInbound(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const chatRes = await fetch(`/api/leads/${created.id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!homeownerInput.trim() || !selectedLeadId) return;

    const userText = homeownerInput;
    setHomeownerInput("");
    setChatLoading(true);

    try {
      const response = await fetch(`/api/leads/${selectedLeadId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
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
      const res = await fetch(`/api/leads/${selectedLeadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/leads/${selectedLeadId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // Main Render
  return (
    <div id="saas-container" className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      
      {/* IF INSPECTOR MODE IS ACTIVE, HIDE EVERYTHING AND SHOW ONLY THE IPAD APP */}
      {activeTab === "inspector" ? (
        <InspectorView 
          leads={leads} 
          setActiveTab={setActiveTab} 
          setWebhookLog={setWebhookLog} 
        />
      ) : (
        /* OTHERWISE, RENDER THE NORMAL DESKTOP ADMIN DASHBOARD */
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
                  <SettingsView 
                    company={company} 
                    setCompany={setCompany} 
                    currentUser={currentUser}
                  />
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

                {activeTab === "admin-users" && (
                  <AdminCredentials />
                )}

              </div>
            </main>
          </div>
        </>
      )}

    </div>
  );
}