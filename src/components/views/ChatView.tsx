import React from 'react';
import { Settings, MessageSquare, Calendar, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface ChatViewProps {
  leads: any[];
  selectedLeadId: string;
  setSelectedLeadId: (id: string) => void;
  setBookingFinished: (val: boolean) => void;
  updateLeadStatus: (status: any) => void;
  selectedLead: any;
  homeownerInput: string;
  setHomeownerInput: (val: string) => void;
  sendChatMessage: (e: React.FormEvent) => void;
  chatLoading: boolean;
  chatBottomRef: React.RefObject<HTMLDivElement>;
  bookingFinished: boolean;
  selectedBookingTime: string;
  setSelectedBookingTime: (val: string) => void;
  completeSchedulerBooking: () => void;
}

export default function ChatView(props: ChatViewProps) {
  const { leads, selectedLeadId, setSelectedLeadId, setBookingFinished, updateLeadStatus, selectedLead, homeownerInput, setHomeownerInput, sendChatMessage, chatLoading, chatBottomRef, bookingFinished, selectedBookingTime, setSelectedBookingTime, completeSchedulerBooking } = props;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Leads List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Select Active Lead</h3>
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {leads.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setSelectedLeadId(l.id); setBookingFinished(false); }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${selectedLeadId === l.id ? "bg-slate-50 border-blue-500 shadow-sm" : "bg-white border-slate-100 hover:border-slate-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs truncate">{l.homeownerName}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100">{l.status.toUpperCase()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Overwrite Controls */}
          {selectedLead && (
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 space-y-4 shadow-md">
              <div className="flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold uppercase">Pipeline Overwrite</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => updateLeadStatus("conversing")} className="bg-slate-800 text-[10px] font-bold py-1.5 rounded">Set: Conversing</button>
                <button onClick={() => updateLeadStatus("qualified")} className="bg-indigo-900/40 text-[10px] font-bold py-1.5 rounded">Set: Qualified</button>
                <button onClick={() => updateLeadStatus("scheduled")} className="bg-blue-900/40 text-[10px] font-bold py-1.5 rounded">Set: Scheduled</button>
                <button onClick={() => updateLeadStatus("won")} className="bg-emerald-900/40 text-[10px] font-bold py-1.5 rounded">Set: Won</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Interaction */}
        <div className="lg:col-span-8 space-y-6">
          {selectedLead ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h4 className="text-xs font-bold">Sarah Conversation with {selectedLead.homeownerName}</h4>
              </div>
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {selectedLead.transcript.map((msg: any, i: number) => (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${msg.sender === "sarah" ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                    <div className={`rounded-2xl p-4.5 text-sm ${msg.sender === "sarah" ? "bg-slate-50 text-slate-700 rounded-tl-none border" : "bg-blue-600 text-white rounded-tr-none"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="text-xs text-blue-600 animate-pulse">Sarah AI is typing...</div>}
                <div ref={chatBottomRef} />
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <form onSubmit={sendChatMessage} className="flex gap-2">
                  <input type="text" value={homeownerInput} onChange={(e) => setHomeownerInput(e.target.value)} placeholder="Type a reply..." className="flex-1 text-xs border rounded-xl px-4 py-3" />
                  <button type="submit" disabled={chatLoading} className="bg-slate-900 text-white px-4 rounded-xl"><Send className="w-4 h-4" /></button>
                </form>
              </div>
            </div>
          ) : (
             <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">Select a lead to begin</div>
          )}
        </div>
      </div>
    </div>
  );
}