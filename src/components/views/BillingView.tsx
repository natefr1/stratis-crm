import React from 'react';
import { Building2, RefreshCw, CreditCard, CheckCircle2 } from 'lucide-react';

interface BillingViewProps {
  company: any;
  triggerStripeConnectOnboarding: () => void;
  transactions: any[];
  leads: any[];
  initiateInvoicePayment: (tx: any) => void;
}

export default function BillingView({ company, triggerStripeConnectOnboarding, transactions, leads, initiateInvoicePayment }: BillingViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Block: Stripe Express */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold uppercase">Onboard & Payouts</h3>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Stripe ID:</span>
                <span className="font-mono text-slate-700">{company?.stripeConnectId || "None"}</span>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <button onClick={triggerStripeConnectOnboarding} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Re-initialize Connect Express
            </button>
          </div>
        </div>

        {/* Right Block: Smart Invoices */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b mb-4">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold uppercase">Smart Invoices</h3>
          </div>
          <div className="space-y-3.5">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400">No invoices yet.</p>
            ) : (
              transactions.map((tx) => {
                const linkedLead = leads.find(l => l.id === tx.leadId);
                return (
                  <div key={tx.id} className="p-4.5 rounded-xl border bg-slate-50/50 flex justify-between items-center gap-4">
                    <div>
                      <span className="text-xs font-bold block">INV-{tx.id.substring(3).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400">Homeowner: {linkedLead?.homeownerName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-sm font-bold block">${tx.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">Fee: ${tx.platformFee}</span>
                      </div>
                      {tx.status === "paid" ? (
                        <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg"><CheckCircle2 className="w-3.5 h-3.5 inline"/> PAID</span>
                      ) : (
                        <button onClick={() => initiateInvoicePayment(tx)} className="bg-slate-900 text-white font-bold py-1.5 px-3 rounded-lg text-xs">Settle Bill</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}