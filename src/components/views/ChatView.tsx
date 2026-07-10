import React, { useState } from 'react';
import { Send, Bot, Calendar as CalendarIcon, CheckCircle2, Hand, UserCog } from 'lucide-react';

interface ChatViewProps {
  leads: any[];
  selectedLeadId: string;
  setSelectedLeadId: (id: string) => void;
  setBookingFinished: (val: boolean) => void;
  updateLeadStatus: (status: string) => void;
  selectedLead: any;
  homeownerInput: string;
  setHomeownerInput: (val: string) => void;
  sendChatMessage: (e?: React.FormEvent, isHuman?: boolean) => void;
  chatLoading: boolean;
  chatBottomRef: any;
  bookingFinished: boolean;
  selectedBookingTime: string;
  setSelectedBookingTime: (val: string) => void;
  completeSchedulerBooking: () => void;
}

export default function ChatView({
  leads, selectedLeadId, setSelectedLeadId, setBookingFinished,
  updateLeadStatus, selectedLead, homeownerInput, setHomeownerInput,
  sendChatMessage, chatLoading, chatBottomRef, bookingFinished,
  selectedBookingTime, setSelectedBookingTime, completeSchedulerBooking
}: ChatViewProps) {
  
  // Local state to toggle bot on/off. In a real app, this syncs to your database!
  const [isBotActive, setIsBotActive] = useState(true);

  if (!leads || leads.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-400 font-medium">No conversations yet.</div>;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass a flag to your API so it knows if it's Sarah or a Human replying
    sendChatMessage(e, !isBotActive); 
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-white rounded-3xl border border-slate-200 shadow-sm flex overflow-hidden">
      
      {/* Sidebar: Lead List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-800 text-lg">Active Leads</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => { setSelectedLeadId(lead.id); setBookingFinished(false); setIsBotActive(true); }}
              className={`w-full text-left p-3 rounded-xl transition-all ${selectedLeadId === lead.id ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-slate-100 border border-transparent'}`}
            >
              <div className="font-bold text-slate-800 text-sm truncate">{lead.homeownerName}</div>
              <div className="text-xs text-slate-500 flex justify-between mt-1">
                <span className="truncate">{lead.neighborhood}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${lead.status === 'qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{lead.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedLead ? (
          <>
            {/* Chat Header & Handoff Toggle */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10">
              <div>
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  {selectedLead.homeownerName}
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-md font-bold">{selectedLead.homeownerPhone}</span>
                </h3>
              </div>
              
              {/* HUMAN HANDOFF BUTTON */}
              <button 
                onClick={() => setIsBotActive(!isBotActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isBotActive 
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {isBotActive ? <><Hand className="w-4 h-4"/> Take Over Chat</> : <><Bot className="w-4 h-4"/> Re-Enable Sarah AI</>}
              </button>
            </div>

            {/* AI Status Banner */}
            <div className={`text-center py-1.5 text-[10px] font-bold uppercase tracking-widest ${isBotActive ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
              {isBotActive ? "🤖 Sarah AI is managing this conversation" : "👨‍💻 Human Support Mode Active (AI Disabled)"}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {selectedLead.transcript?.map((msg: any, idx: number) => {
                const isHomeowner = msg.sender === 'homeowner';
                const isAdmin = msg.sender === 'admin'; // Assume human messages are marked 'admin'
                return (
                  <div key={idx} className={`flex ${isHomeowner ? 'justify-end' : 'justify-start'}`}>
                    {!isHomeowner && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0 ${isAdmin ? 'bg-amber-500' : 'bg-blue-600'}`}>
                        {isAdmin ? <UserCog className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                    )}
                    <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isHomeowner 
                        ? 'bg-slate-800 text-white rounded-tr-sm' 
                        : isAdmin 
                          ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-sm font-medium'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-1"><Bot className="w-4 h-4 text-blue-500" /></div>
                  <div className="bg-slate-200 p-4 rounded-2xl w-24 h-12 rounded-tl-sm"></div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={homeownerInput}
                  onChange={(e) => setHomeownerInput(e.target.value)}
                  placeholder={isBotActive ? "Send message as homeowner (Demo)..." : "Type reply as Company Support..."}
                  className={`flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${isBotActive ? 'focus:ring-slate-400 bg-slate-50' : 'focus:ring-amber-500 bg-amber-50'}`}
                />
                <button
                  type="submit"
                  disabled={!homeownerInput.trim() || chatLoading}
                  className={`text-white p-3 rounded-xl transition-colors disabled:opacity-50 ${isBotActive ? 'bg-slate-800 hover:bg-slate-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">Select a lead to view history</div>
        )}
      </div>
    </div>
  );
}