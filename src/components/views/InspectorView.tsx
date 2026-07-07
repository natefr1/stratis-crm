import React, { useState } from 'react';
import { Calculator, Send, CheckCircle2, ChevronLeft, Ruler, Hammer, DollarSign, Calendar } from 'lucide-react';

interface InspectorViewProps {
  leads: any[];
  setActiveTab: (tab: string) => void;
  setWebhookLog: (log: string) => void;
}

export default function InspectorView({ leads, setActiveTab, setWebhookLog }: InspectorViewProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [sqFt, setSqFt] = useState<string>("");
  const [tier, setTier] = useState<"standard" | "premium" | "luxury">("standard");
  const [extraFees, setExtraFees] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");
  const [quoteSent, setQuoteSent] = useState(false);

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  // Auto-Quoting Logic
  const pricing = { standard: 3.50, premium: 5.25, luxury: 8.00 }; // Price per sq ft
  const basePrice = (parseFloat(sqFt || "0") * pricing[tier]);
  const finalQuote = basePrice + parseFloat(extraFees || "0");

  const handleDispatchQuote = () => {
    // In a real app, this sends a POST request to your backend to update the database
    // and trigger the Sarah AI SMS engine.
    setWebhookLog(`[Inspector App -> AI Engine] Quote of $${finalQuote.toLocaleString()} generated for ${selectedLead?.homeownerName}.\nDispatching SMS and Email via Sarah AI...`);
    setQuoteSent(true);
    setTimeout(() => {
      setSelectedLeadId("");
      setQuoteSent(false);
      setSqFt("");
      setExtraFees("0");
    }, 4000);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans animate-fade-in">
      {/* Top Navigation for iPad */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold px-4 py-2 bg-slate-100 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Office Admin
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Hammer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 font-display">Field Inspector App</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">Stratis Mobile Quoter</p>
          </div>
        </div>
      </div>

      {!selectedLeadId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.filter(l => l.status === "scheduled" || l.status === "qualified").length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 border-dashed">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-bold">No Inspections Scheduled</p>
              <p className="text-sm">When Sarah AI books an appointment, it will appear here.</p>
            </div>
          )}
          {leads.filter(l => l.status === "scheduled" || l.status === "qualified").map(lead => (
            <button 
              key={lead.id}
              onClick={() => setSelectedLeadId(lead.id)}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 text-left transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Scheduled Today</span>
                <span className="text-slate-400 text-sm group-hover:text-blue-500 transition-colors">Select ➔</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-1">{lead.homeownerName}</h3>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                📍 {lead.neighborhood || "Address Unspecified"}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Input Form (iPad touch friendly) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Ruler className="w-6 h-6 text-blue-500" /> Roof Measurements
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Total Square Footage (Sq Ft)</label>
                <input 
                  type="number" 
                  value={sqFt} 
                  onChange={(e) => setSqFt(e.target.value)}
                  className="w-full text-3xl font-black text-slate-800 border-2 border-slate-200 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="e.g. 2500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Material Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setTier("standard")} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${tier === "standard" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>Standard<br/><span className="text-xs font-medium opacity-70">Asphalt</span></button>
                  <button onClick={() => setTier("premium")} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${tier === "premium" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}>Premium<br/><span className="text-xs font-medium opacity-70">Architectural</span></button>
                  <button onClick={() => setTier("luxury")} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${tier === "luxury" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-500"}`}>Luxury<br/><span className="text-xs font-medium opacity-70">Metal/Tile</span></button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Additional Repairs / Fees ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-xl font-bold text-slate-400">$</span>
                  <input 
                    type="number" 
                    value={extraFees} 
                    onChange={(e) => setExtraFees(e.target.value)}
                    className="w-full text-xl font-bold text-slate-800 border-2 border-slate-200 rounded-2xl p-4 pl-10 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Inspector Notes (Internal)</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Noted hail damage on North ridge..."
                  className="w-full border-2 border-slate-200 rounded-2xl p-4 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Right: The Final Quote & Dispatch */}
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                <Calculator className="w-64 h-64" />
              </div>
              <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">Live Automated Quote</p>
              <h3 className="text-xl font-medium text-slate-300 mb-6">Prepared for: <span className="font-bold text-white">{selectedLead.homeownerName}</span></h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-300">
                  <span>Base Materials ({sqFt || "0"} sq ft)</span>
                  <span>${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Additional Repairs</span>
                  <span>${parseFloat(extraFees || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full h-px bg-slate-700 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold">Total Estimate</span>
                  <span className="text-5xl font-black font-display text-emerald-400">${finalQuote.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {quoteSent ? (
                <div className="bg-emerald-500/20 border border-emerald-500/50 p-6 rounded-2xl flex items-center gap-4 animate-fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-emerald-300">Quote Dispatched!</h4>
                    <p className="text-sm text-emerald-100/70">Sarah AI is currently texting the payment link to {selectedLead.homeownerPhone}.</p>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleDispatchQuote}
                  disabled={!sqFt || parseFloat(sqFt) <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 transition-colors text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/50"
                >
                  <Send className="w-6 h-6" /> Dispatch to Sarah AI
                </button>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-sm text-blue-800 leading-relaxed">
              <strong>How this works:</strong> Hitting dispatch commands the Stratis backend to generate a secure Stripe Payment Link. The Sarah AI engine will automatically text this link to the homeowner using her conversational tone, allowing them to pay the deposit instantly.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}