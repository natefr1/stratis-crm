import React, { useState } from 'react';
import { UserPlus, Home, Phone, MapPin, ShieldAlert, FileText, Send } from 'lucide-react';

interface LeadEntryViewProps {
  onLeadCreate: (leadData: any) => Promise<void>;
}

export default function LeadEntryView({ onLeadCreate }: LeadEntryViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    homeownerName: "",
    homeownerPhone: "",
    address: "",
    roofAge: "",
    insuranceCompany: "",
    damageNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onLeadCreate(formData);
    setIsSubmitting(false);
    // Reset form
    setFormData({ homeownerName: "", homeownerPhone: "", address: "", roofAge: "", insuranceCompany: "", damageNotes: "" });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in p-6">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-blue-600" />
          Manual Lead Intake
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          Bypass Sarah AI and manually inject a fully qualified lead directly into the CRM pipeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Customer Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Home className="w-3.5 h-3.5"/> Full Name</label>
              <input type="text" required className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="John Doe" value={formData.homeownerName} onChange={e => setFormData({...formData, homeownerName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> Phone Number</label>
              <input type="tel" required className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="(555) 123-4567" value={formData.homeownerPhone} onChange={e => setFormData({...formData, homeownerPhone: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Property Address</label>
              <input type="text" required className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="123 Main St, Austin, TX 78701" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Roofing Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Property Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> Est. Roof Age (Years)</label>
              <input type="number" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="15" value={formData.roofAge} onChange={e => setFormData({...formData, roofAge: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5"/> Insurance Provider</label>
              <input type="text" className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="State Farm, Allstate, etc." value={formData.insuranceCompany} onChange={e => setFormData({...formData, insuranceCompany: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2">Damage Notes / Reason for Call</label>
              <textarea rows={4} required className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors resize-none" placeholder="Customer reported missing shingles after last night's hail storm..." value={formData.damageNotes} onChange={e => setFormData({...formData, damageNotes: e.target.value})} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50">
          <Send className="w-5 h-5" />
          {isSubmitting ? "Generating Profile..." : "Create Lead Profile"}
        </button>
      </form>
    </div>
  );
}